import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluateAccess,type Grant,actions} from '../server/governance-policy.ts';
import type {Principal} from '../shared/catalog.ts';
const director:Principal={id:'synthetic',name:'Diretor demo',memberships:[{companyId:'holding',roleId:'corporate-reader',corporate:true,isHolding:true,permissions:['strategy:read','finance:read']}]};
const operator:Principal={id:'operator',name:'Operador demo',memberships:[]};
test('habilitação precede perfil, concessão pessoal e acesso corporativo',()=>{
 const grant:Grant={scope_id:'scope-company:utu',module_id:'finance',action:'read',effect:'allow'};
 assert.equal(evaluateAccess(director,'finance','read',false,['scope-company:utu','scope-holding'],[grant],'DIRETORES'),false);
});
test('negação pessoal prevalece sobre concessão do papel e de unidade',()=>{
 const grants:Grant[]=[{scope_id:'scope-unit:arqueo',module_id:'strategy',action:'read',effect:'allow'},{scope_id:'scope-company:arqueoproject',module_id:'strategy',action:'read',effect:'deny'}];
 assert.equal(evaluateAccess(director,'strategy','read',true,['scope-company:arqueoproject','scope-unit:arqueo','scope-holding'],grants,'DIRETORES'),false);
});
test('concessão unitária não amplia outros módulos ou unidades',()=>{
 const grant:Grant={scope_id:'scope-unit:africa',module_id:'strategy',action:'read',effect:'allow'};
 assert.equal(evaluateAccess(operator,'strategy','read',true,['scope-company:utu','scope-unit:africa','scope-holding'],[grant]),true);
 assert.equal(evaluateAccess(operator,'strategy','read',true,['scope-company:vinho-24','scope-unit:vinho','scope-holding'],[grant]),false);
 assert.equal(evaluateAccess(operator,'finance','read',true,['scope-unit:africa','scope-holding'],[grant]),false);
});
test('ações de exportação, anexos, jobs e IA negadas sem concessão explícita',()=>{
 for(const action of ['export','attachments','jobs','ai','approve','reopen'])assert.equal(evaluateAccess(director,'strategy',action,true,['scope-holding'],[],'DIRETORES'),false);
});
test('diretor de governança requer vínculo corporativo autorizado',()=>{
 assert.equal(evaluateAccess(operator,'strategy','grants',true,['scope-holding'],[],'DIRETORES'),false);
 assert.equal(evaluateAccess(director,'strategy','grants',true,['scope-holding'],[],'DIRETORES'),true);
 assert.ok(actions.includes('reopen'));
 const reopen:Grant={scope_id:'scope-holding',module_id:'strategy',action:'reopen',effect:'allow'};
 assert.equal(evaluateAccess(operator,'strategy','reopen',true,['scope-holding'],[reopen],'OPERADORES'),false);
 assert.equal(evaluateAccess(director,'strategy','reopen',true,['scope-holding'],[reopen],'DIRETORES'),true);
});
