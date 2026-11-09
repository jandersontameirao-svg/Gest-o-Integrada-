import {financeActions} from '../shared/finance/model.ts';
import type {ModuleId,Principal} from '../shared/catalog.ts';
export type Grant={scope_id:string;module_id:ModuleId;action:string;effect:'allow'|'deny'};
export const actions=['read','export','governance','transfer','grants','units','edit','approve','reopen','attachments','jobs','ai','settle','reverse',...financeActions] as const;
export function evaluateAccess(user:Principal,module:ModuleId,action:string,enabled:boolean,scopeIds:string[],grants:Grant[],profile?:string){
 if(!enabled)return false;
 if(action==='reopen'&&profile!=='DIRETORES')return false;
 const matching=grants.filter(g=>scopeIds.includes(g.scope_id)&&g.module_id===module&&g.action===action);
 if(matching.some(g=>g.effect==='deny'))return false;
 if(matching.some(g=>g.effect==='allow'))return true;
 const companyId=scopeIds.find(s=>s.startsWith('scope-company:'))?.slice(14);
 const permission=module+':'+action;
 return user.memberships.some(m=>(m.companyId===companyId||(m.isHolding&&m.corporate))&&m.permissions.includes(permission))
  || (module==='strategy'&&['governance','transfer','grants','units'].includes(action)&&profile==='DIRETORES'
    &&user.memberships.some(m=>m.isHolding&&m.corporate&&m.permissions.includes('strategy:read')));
}

