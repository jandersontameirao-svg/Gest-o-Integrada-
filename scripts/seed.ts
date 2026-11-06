import {randomUUID} from 'node:crypto';
import {companies,modules} from '../shared/catalog.ts';
import {hashPassword} from '../server/crypto.ts';
import {pool,rows} from '../server/db.ts';
if (process.env.NODE_ENV === 'production' || !process.env.DB_NAME?.endsWith('_demo')) throw new Error('Seed permitido somente em banco *_demo fora de produção.');
const password = process.env.DEMO_PASSWORD;
if (!password || password.length < 16 || password.length > 256) throw new Error('Defina DEMO_PASSWORD sintética entre 16 e 256 caracteres.');
const connection = await pool.getConnection();
try {
 await connection.beginTransaction();
 const existing = await rows('SELECT id FROM users LIMIT 1',[],connection);
 if (existing.length) throw new Error('Seed exige banco sem usuários; não sobrescreve credenciais.');
 for (const [i,c] of companies.entries()) await connection.execute('INSERT INTO companies(id,name,is_holding,sort_order) VALUES (?,?,?,?)',[c.id,c.name,c.isHolding,i]);
 for (const [id,name] of [['corporate-reader','Leitor corporativo'],['company-reader','Leitor da empresa'],['restricted','Sem acesso a módulos']]) await connection.execute('INSERT INTO roles(id,name) VALUES (?,?)',[id,name]);
 for (const m of modules) {
  const p = m.id+':read';
  await connection.execute('INSERT INTO permissions(id) VALUES (?)',[p]);
  for (const role of ['corporate-reader','company-reader']) await connection.execute('INSERT INTO role_permissions(role_id,permission) VALUES (?,?)',[role,p]);
  for (const c of companies) await connection.execute('INSERT INTO demo_records(id,company_id,module_id,label) VALUES (?,?,?,?)',[randomUUID(),c.id,m.id,'DEMONSTRAÇÃO — espaço reservado de '+m.name]);
 }
 for(const [id,name] of [['utu','UTU — Demonstração'],['vinho-24','Vinho 24 Horas — Demonstração']]){
  await connection.execute('INSERT INTO companies(id,name,is_holding,sort_order) VALUES (?,?,FALSE,?)',[id,name,id==='utu'?5:6]);
 }
 const allCompanies=await rows<{id:string}>('SELECT id FROM companies',[],connection);
 for(const c of allCompanies){
  await connection.execute('INSERT INTO organization_scopes(id,kind,company_id) VALUES (?,?,?)',['scope-company:'+c.id,'company',c.id]);
  await connection.execute('INSERT INTO company_unit_history(id,company_id,unit_id,valid_from) VALUES (?,?,?,?)',[randomUUID(),c.id,c.id==='utu'?'africa':c.id==='vinho-24'?'vinho':'arqueo','1970-01-01']);
  for(const m of modules)await connection.execute('INSERT INTO company_module_entitlements(company_id,module_id,enabled) VALUES (?,?,?)',[c.id,m.id,m.id==='strategy'||!['utu','vinho-24'].includes(c.id)]);
 }
 const hash = await hashPassword(password);
 for (const [email,name,company,role,corporate] of [
  ['holding@example.test','Diretoria demonstração','holding','corporate-reader',true],
  ['projetos@example.test','Analista demonstração','arqueoproject','company-reader',false],
  ['oceano@example.test','Analista oceano demonstração','arqueocean','company-reader',false],
  ['restrito@example.test','Usuário sem permissões','arqueoproject','restricted',false],
 ] as const) {
  const id = randomUUID();
  await connection.execute('INSERT INTO users(id,email,name,password_hash) VALUES (?,?,?,?)',[id,email,name,hash]);
  await connection.execute('INSERT INTO user_profiles(user_id,profile) VALUES (?,?)',[id,email==='holding@example.test'?'DIRETORES':email==='projetos@example.test'?'GERENTES':'OPERADORES']);
  if(email==='holding@example.test')for(const action of ['edit','approve','reopen','export'])await connection.execute('INSERT INTO scope_grants VALUES (?,?,?,?,?)',[id,'scope-holding','strategy',action,'allow']);
  await connection.execute('INSERT INTO memberships(user_id,company_id,role_id,corporate) VALUES (?,?,?,?)',[id,company,role,corporate]);
 }
 await connection.commit(); console.log('Empresas cadastradas e dados sintéticos de demonstração criados.');
} catch(error) {await connection.rollback(); throw error;} finally {connection.release(); await pool.end();}

