import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { modules, type ModuleId } from '../shared/catalog.ts';
import { pool, rows } from './db.ts';
import { authenticate, loadPrincipal } from './auth.ts';
import { digestToken, newToken, verifyPassword, hashPassword } from './crypto.ts';
import { authorize, HttpError } from './policy.ts';
import {allowedCompanies,requireAccess} from './access.ts';
import {governanceRouter} from './governance.ts';
import {contractsRouter} from './contracts/router.ts';
import {strategyRouter} from './strategy.ts';
const dummyHash = hashPassword('dummy-password-never-used-for-login');
export function createApp() {
 const app = express();
 app.disable('x-powered-by');
 app.use(helmet());
 app.use('/api/v1/strategy',express.json({limit:'128kb'}));
 app.use('/api/v1/contracts',express.json({limit:'12mb'}));
 app.use(express.json({limit:'16kb'}));
 app.use('/api', (_req,res,next) => { res.setHeader('Cache-Control','no-store'); next(); });
 app.use('/api', rateLimit({windowMs:60_000, limit:120, standardHeaders:'draft-8', legacyHeaders:false}));
 app.get('/api/v1/health', (_req,res) => res.json({status:'ok'}));
 app.post('/api/v1/auth/login', rateLimit({windowMs:15*60_000,limit:10,legacyHeaders:false}), async (req,res) => {
  const {email,password} = req.body ?? {};
  if (typeof email !== 'string' || email.length > 254 || typeof password !== 'string' || password.length > 256) throw new HttpError(400,'Credenciais inválidas.');
  const users = await rows<{id:string;password_hash:string}>('SELECT id,password_hash FROM users WHERE email=? AND active=1', [email.trim().toLowerCase()]);
  const valid = await verifyPassword(password, users[0]?.password_hash ?? await dummyHash);
  if (!users[0] || !valid) {
   await pool.execute('INSERT INTO audit_events (id,action,outcome) VALUES (?,?,?)',[randomUUID(),'auth.login','denied']);
   throw new HttpError(401,'Credenciais inválidas.');
  }
  const token = newToken();
  const connection = await pool.getConnection();
  try {
   await connection.beginTransaction();
   await connection.execute('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 8 HOUR))',[digestToken(token),users[0].id]);
   await connection.execute('INSERT INTO audit_events (id,actor_id,action,outcome) VALUES (?,?,?,?)',[randomUUID(),users[0].id,'auth.login','allowed']);
   await connection.commit();
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
  res.json({token,user:await loadPrincipal(users[0].id)});
 });
 app.use('/api/v1', async (req,res,next) => {
  if (req.path === '/health') return next();
  res.locals.user = await authenticate(req.headers.authorization);
  next();
 });
 app.get('/api/v1/me', (_req,res) => res.json(res.locals.user));
 app.post('/api/v1/auth/logout', async (req,res) => {
  const connection = await pool.getConnection();
  try {
   await connection.beginTransaction();
   await connection.execute('DELETE FROM sessions WHERE token_hash=?',[digestToken(req.headers.authorization!.slice(7))]);
   await connection.execute('INSERT INTO audit_events (id,actor_id,action,outcome) VALUES (?,?,?,?)',[randomUUID(),res.locals.user.id,'auth.logout','allowed']);
   await connection.commit();
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
  res.status(204).end();
 });
 app.use('/api/v1/governance',governanceRouter);
 app.use('/api/v1/strategy',strategyRouter);
 app.use('/api/v1/contracts',contractsRouter);
 app.get('/api/v1/companies', async (req,res) => {
  const module=typeof req.query.module==='string'?req.query.module:'projects';
  if(!modules.some(m=>m.id===module))throw new HttpError(400,'Módulo inválido.');
  res.json(await allowedCompanies(res.locals.user,module as ModuleId));
 });
 app.get('/api/v1/modules/:module/overview', async (req,res) => {
  const module = req.params.module as ModuleId;
  if (!modules.some(m=>m.id===module)) throw new HttpError(404,'Módulo inexistente.');
  const companyId = typeof req.query.companyId === 'string' ? req.query.companyId : undefined;
  let scope;
  try {
   if(!companyId)throw new HttpError(400,'Selecione uma empresa.');
   if(companyId==='corporate')scope=authorize(res.locals.user,companyId,module);
   else{await requireAccess(res.locals.user,'scope-company:'+companyId,module,'read');scope={corporate:false,companyId};}
  }
  catch (error) {
   await pool.execute('INSERT INTO audit_events (id,actor_id,action,outcome,module_id) VALUES (?,?,?,?,?)',
    [randomUUID(),res.locals.user.id,'module.overview','denied',module]);
   throw error;
  }
  // A empresa recebida nunca é usada sem autorização; nenhuma consulta aceita SQL do cliente.
  const permitted=await allowedCompanies(res.locals.user,module);
  const permittedIds=scope.corporate?permitted.map(c=>c.id):[scope.companyId];
  const records=permittedIds.length?await rows<{id:string;companyId:string;label:string}>(
   'SELECT id,company_id companyId,label FROM demo_records WHERE module_id=? AND company_id IN ('+permittedIds.map(()=>'?').join(',')+') ORDER BY id LIMIT 100',
   [module,...permittedIds]):[];
  await pool.execute('INSERT INTO audit_events (id,actor_id,company_id,module_id,action,outcome) VALUES (?,?,?,?,?,?)',
   [randomUUID(),res.locals.user.id,scope.corporate?null:scope.companyId,module,'module.overview','allowed']);
  res.json({demonstration:true, module, scope:scope.companyId, records});
 });
 app.use('/api', (_req,_res,next) => next(new HttpError(404,'Rota inexistente.')));
 app.use(express.static('dist/client'));
 app.get('/{*path}', (_req,res) => res.sendFile('index.html',{root:'dist/client'}));
 app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = error instanceof HttpError ? error.status : ('status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500 ? error.status : 500);
  // Não registrar credenciais, headers, SQL ou payloads.
  if (status === 500) console.error('Falha interna na API.');
  res.status(status).json({error: error instanceof HttpError ? error.message : status === 500 ? 'Erro interno.' : 'Requisição inválida.'});
 });
 return app;
}

