import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {pool,rows} from './db.ts';
import {requireAccess,checkAccess,allowedCompanies} from './access.ts';
import {actions} from './governance-policy.ts';
import {HttpError} from './policy.ts';
import {modules} from '../shared/catalog.ts';
function field(value:unknown,max=160):string{if(typeof value!=='string'||!value.trim()||value.length>max)throw new HttpError(400,'Campo inválido.');return value.trim();}
export const governanceRouter=Router();
governanceRouter.get('/snapshot',async(req,res)=>{
 const scope=typeof req.query.scopeId==='string'?req.query.scopeId:'scope-holding';
 const asOf=typeof req.query.asOf==='string'?req.query.asOf:new Date().toISOString().slice(0,10);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(asOf)||!Number.isFinite(Date.parse(asOf))||new Date(asOf).toISOString().slice(0,10)!==asOf)throw new HttpError(400,'Data inválida.');
 await requireAccess(res.locals.user,scope,'strategy','read');
 const units=await rows<{id:string;name:string}>('SELECT id,name FROM business_units WHERE active=TRUE ORDER BY name');
 const visibleUnits:typeof units=[];for(const u of units)if(await checkAccess(res.locals.user,'scope-unit:'+u.id,'strategy','read'))visibleUnits.push(u);
 let companies=await allowedCompanies(res.locals.user,'strategy',asOf);
 if(scope.startsWith('scope-company:'))companies=companies.filter(c=>'scope-company:'+c.id===scope);
 const membership=await rows<{company_id:string;unit_id:string;valid_from:string;valid_to:string|null}>('SELECT company_id,unit_id,DATE_FORMAT(valid_from,"%Y-%m-%d") valid_from,DATE_FORMAT(valid_to,"%Y-%m-%d") valid_to FROM company_unit_history WHERE valid_from<=? AND (valid_to IS NULL OR valid_to>?)',[asOf,asOf]);
 if(scope.startsWith('scope-unit:'))companies=companies.filter(c=>membership.some(m=>m.company_id===c.id&&'scope-unit:'+m.unit_id===scope));
 const ids=new Set(companies.map(c=>c.id));
 const entitlements=await rows<{company_id:string;module_id:string;enabled:number}>('SELECT company_id,module_id,enabled FROM company_module_entitlements ORDER BY company_id,module_id');
 const profile=(await rows<{profile:string}>('SELECT profile FROM user_profiles WHERE user_id=?',[res.locals.user.id]))[0]?.profile??'OPERADORES';
 await pool.execute('INSERT INTO audit_events(id,actor_id,module_id,action,outcome) VALUES (?,?,?,?,?)',[randomUUID(),res.locals.user.id,'strategy','governance.snapshot','allowed']);
 res.json({scopeId:scope,asOf,profile,units:units.filter(u=>visibleUnits.some(v=>v.id===u.id)||membership.some(m=>ids.has(m.company_id)&&m.unit_id===u.id)),companies,memberships:membership.filter(m=>ids.has(m.company_id)),entitlements:entitlements.filter(e=>ids.has(e.company_id)),canManage:await checkAccess(res.locals.user,'scope-holding','strategy','governance')});
});
governanceRouter.post('/units',async(req,res)=>{
 await requireAccess(res.locals.user,'scope-holding','strategy','units');
 const name=field(req.body?.name),id=randomUUID(),c=await pool.getConnection();
 try{await c.beginTransaction();await c.execute('INSERT INTO business_units(id,name) VALUES (?,?)',[id,name]);await c.execute('INSERT INTO organization_scopes(id,kind,unit_id) VALUES (?,?,?)',['scope-unit:'+id,'unit',id]);await c.execute('INSERT INTO governance_events(id,actor_id,action,scope_id,after_data) VALUES (?,?,?,?,?)',[randomUUID(),res.locals.user.id,'unit.create','scope-holding',JSON.stringify({id,name})]);await c.commit();res.status(201).json({id,name});}catch(e){await c.rollback();throw e;}finally{c.release();}
});
governanceRouter.post('/transfer',async(req,res)=>{
 await requireAccess(res.locals.user,'scope-holding','strategy','transfer');
 const companyId=field(req.body?.companyId,40),unitId=field(req.body?.unitId,40),effectiveDate=field(req.body?.effectiveDate,10);
 if(effectiveDate!==new Date().toISOString().slice(0,10))throw new HttpError(400,'Transferência efetiva hoje (UTC), sem alteração retroativa.');
 const c=await pool.getConnection();
 try{await c.beginTransaction();
  if(!(await rows('SELECT id FROM companies WHERE id=? FOR UPDATE',[companyId],c))[0])throw new HttpError(404,'Empresa inexistente.');
  await requireAccess(res.locals.user,'scope-company:'+companyId,'strategy','transfer',c);
  if(!(await rows('SELECT id FROM business_units WHERE id=? AND active=TRUE',[unitId],c))[0])throw new HttpError(404,'Unidade inexistente.');
  const [current]=await rows<{id:string;unit_id:string;start:string}>('SELECT id,unit_id,DATE_FORMAT(valid_from,"%Y-%m-%d") start FROM company_unit_history WHERE company_id=? AND valid_to IS NULL FOR UPDATE',[companyId],c);
  if(!current||current.unit_id===unitId||current.start>=effectiveDate)throw new HttpError(409,'Transferência conflitante ou intervalo sem duração.');
  await c.execute('UPDATE company_unit_history SET valid_to=? WHERE id=?',[effectiveDate,current.id]);
  await c.execute('INSERT INTO company_unit_history(id,company_id,unit_id,valid_from) VALUES (?,?,?,?)',[randomUUID(),companyId,unitId,effectiveDate]);
  await c.execute('INSERT INTO governance_events(id,actor_id,action,scope_id,before_data,after_data) VALUES (?,?,?,?,?,?)',[randomUUID(),res.locals.user.id,'company.transfer','scope-company:'+companyId,JSON.stringify(current),JSON.stringify({unitId,effectiveDate})]);await c.commit();res.json({companyId,unitId,effectiveDate});
 }catch(e){await c.rollback();throw e;}finally{c.release();}
});
governanceRouter.get('/history/:companyId',async(req,res)=>{
 const id=field(req.params.companyId,40);await requireAccess(res.locals.user,'scope-company:'+id,'strategy','read');
 res.json(await rows('SELECT unit_id,DATE_FORMAT(valid_from,"%Y-%m-%d") valid_from,DATE_FORMAT(valid_to,"%Y-%m-%d") valid_to FROM company_unit_history WHERE company_id=? ORDER BY valid_from',[id]));
});
governanceRouter.get('/grants',async(_req,res)=>{
 await requireAccess(res.locals.user,'scope-holding','strategy','grants');
 res.json({users:await rows('SELECT u.id,u.name,p.profile FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id ORDER BY u.name'),scopes:await rows('SELECT id,kind,company_id,unit_id FROM organization_scopes ORDER BY id'),grants:await rows('SELECT user_id,scope_id,module_id,action,effect FROM scope_grants ORDER BY user_id,scope_id'),actions});
});
governanceRouter.put('/grants',async(req,res)=>{
 await requireAccess(res.locals.user,'scope-holding','strategy','grants');
 const userId=field(req.body?.userId,36),scopeId=field(req.body?.scopeId,90),module=field(req.body?.module,20),action=field(req.body?.action,40),effect=field(req.body?.effect,5);
 if(!modules.some(m=>m.id===module)||!actions.some(a=>a===action)||!['allow','deny'].includes(effect))throw new HttpError(400,'Permissão inválida.');
 const c=await pool.getConnection();try{await c.beginTransaction();
 if(!(await rows('SELECT id FROM users WHERE id=?',[userId],c))[0]||!(await rows('SELECT id FROM organization_scopes WHERE id=?',[scopeId],c))[0])throw new HttpError(404,'Usuário ou escopo inexistente.');
 const before=await rows('SELECT effect FROM scope_grants WHERE user_id=? AND scope_id=? AND module_id=? AND action=?',[userId,scopeId,module,action],c);
 await c.execute('INSERT INTO scope_grants(user_id,scope_id,module_id,action,effect) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE effect=?',[userId,scopeId,module,action,effect,effect]);
 await c.execute('INSERT INTO governance_events(id,actor_id,action,scope_id,before_data,after_data) VALUES (?,?,?,?,?,?)',[randomUUID(),res.locals.user.id,'grant.configure',scopeId,JSON.stringify(before),JSON.stringify({userId,module,action,effect})]);await c.commit();res.json({saved:true});
 }catch(e){await c.rollback();throw e;}finally{c.release();}
});

governanceRouter.put('/profile',async(req,res)=>{
 await requireAccess(res.locals.user,'scope-holding','strategy','grants');
 const [actor]=await rows<{profile:string}>('SELECT profile FROM user_profiles WHERE user_id=?',[res.locals.user.id]);
 if(actor?.profile!=='DIRETORES')throw new HttpError(403,'Somente diretores podem alterar perfis.');
 const userId=field(req.body?.userId,36),profile=field(req.body?.profile,20);
 if(!['DIRETORES','GERENTES','OPERADORES'].includes(profile))throw new HttpError(400,'Perfil inválido.');
 if(userId===res.locals.user.id)throw new HttpError(409,'Alteração do próprio perfil exige outro diretor.');
 const c=await pool.getConnection();try{await c.beginTransaction();
 const directors=await rows<{user_id:string}>("SELECT user_id FROM user_profiles WHERE profile='DIRETORES' ORDER BY user_id FOR UPDATE",[],c);
 if(!directors.some(d=>d.user_id===res.locals.user.id))throw new HttpError(403,'Perfil de diretor revogado.');
 if(!(await rows('SELECT id FROM users WHERE id=? FOR UPDATE',[userId],c))[0])throw new HttpError(404,'Usuário inexistente.');
 const before=await rows('SELECT profile FROM user_profiles WHERE user_id=?',[userId],c);
 await c.execute('INSERT INTO user_profiles(user_id,profile) VALUES (?,?) ON DUPLICATE KEY UPDATE profile=?',[userId,profile,profile]);
 await c.execute('INSERT INTO governance_events(id,actor_id,action,scope_id,before_data,after_data) VALUES (?,?,?,?,?,?)',[randomUUID(),res.locals.user.id,'profile.configure','scope-holding',JSON.stringify(before),JSON.stringify({userId,profile})]);
 await c.commit();res.json({saved:true});}catch(e){await c.rollback();throw e;}finally{c.release();}
});
