import type {Principal,ModuleId} from '../shared/catalog.ts';
import type {PoolConnection} from 'mysql2/promise';
import {randomUUID} from 'node:crypto';
import {pool,rows} from './db.ts';
import {evaluateAccess,type Grant} from './governance-policy.ts';
import {HttpError} from './policy.ts';
export async function checkAccess(user:Principal,scopeId:string,module:ModuleId,action:string,connection:PoolConnection|typeof pool=pool,asOf=new Date().toISOString().slice(0,10)){
 const [scope]=await rows<{kind:string;company_id:string|null;unit_id:string|null}>('SELECT kind,company_id,unit_id FROM organization_scopes WHERE id=?',[scopeId],connection);
 if(!scope)return false;
 const ids=[scopeId];
 let enabled=module==='strategy';
 if(scope.kind==='company'){
  const [entitlement]=await rows<{enabled:number}>('SELECT enabled FROM company_module_entitlements WHERE company_id=? AND module_id=?',[scope.company_id,module],connection);
  enabled=!!entitlement?.enabled;
  const units=await rows<{unit_id:string}>('SELECT unit_id FROM company_unit_history WHERE company_id=? AND valid_from<=? AND (valid_to IS NULL OR valid_to>?)',[scope.company_id,asOf,asOf],connection);
  ids.push(...units.map(u=>'scope-unit:'+u.unit_id));
 }else if(scope.kind==='unit'){
  const [u]=await rows<{active:number}>('SELECT active FROM business_units WHERE id=?',[scope.unit_id],connection);
  enabled=enabled&&!!u?.active;
 }
 ids.push('scope-holding');
 const grants=await rows<Grant>('SELECT scope_id,module_id,action,effect FROM scope_grants WHERE user_id=?',[user.id],connection);
 const [profile]=await rows<{profile:string}>('SELECT profile FROM user_profiles WHERE user_id=?',[user.id],connection);
 return evaluateAccess(user,module,action,enabled,ids,grants,profile?.profile);
}
export async function requireAccess(user:Principal,scopeId:string,module:ModuleId,action:string,connection:PoolConnection|typeof pool=pool){
 if(!await checkAccess(user,scopeId,module,action,connection)){await pool.execute('INSERT INTO audit_events(id,actor_id,module_id,action,outcome) VALUES (?,?,?,?,?)',[randomUUID(),user.id,module,'access.'+action,'denied']);throw new HttpError(403,'Acesso não autorizado ou módulo não habilitado.');}
}
export async function allowedCompanies(user:Principal,module:ModuleId,asOf=new Date().toISOString().slice(0,10)){
 const list=await rows<{id:string;name:string;isHolding:number}>('SELECT id,name,is_holding isHolding FROM companies ORDER BY sort_order');
 const result=[];
 for(const company of list)if(await checkAccess(user,'scope-company:'+company.id,module,'read',pool,asOf))result.push(company);
 return result;
}

