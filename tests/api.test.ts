import {registerFinancePlanningTests} from './finance-planning.integration.ts';
import {registerFinanceSourceTests} from './finance-sources.integration.ts';
import {registerFinanceTests} from './finance.integration.ts';
import {registerSupplierExecutionTests} from './suppliers-execution.integration.ts';
import {registerSupplierBindingTests} from './suppliers-integration-bindings.integration.ts';
import {registerSupplierOrderChangeTests} from './suppliers-integration-orders.integration.ts';
import {registerSupplierLifecycleTests} from './suppliers-lifecycle.integration.ts';
import {registerSupplierLegalTests} from './suppliers-legal.integration.ts';
import {registerSupplierDocumentTests} from './suppliers-documents.integration.ts';
import {registerSupplierReviewTests} from './suppliers-reviews.integration.ts';
import {registerSupplierOperationsTests} from './suppliers-operations.integration.ts';
import {registerSupplierStructureTests} from './suppliers-structure.integration.ts';
import {registerProjectTests} from './projects.integration.ts';
import {register03dTests} from './contracts-03d.integration.ts';
import {register03cTests} from './contracts-03c.integration.ts';
import {registerContractTests} from './contracts.integration.ts';
import {register02cTests} from './strategy-02c.integration.ts';
import {registerStrategyTests} from './strategy.integration.ts';
import {test,after,before} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server/app.ts';
import {pool,rows} from '../server/db.ts';
import type {AddressInfo} from 'node:net';
if (!process.env.DB_NAME?.endsWith('_demo')) throw new Error('Testes de integração exigem banco *_demo.');
const server=createApp().listen(0,'127.0.0.1');
const strategyServer=createApp().listen(0,'127.0.0.1');
const alignmentServer=createApp().listen(0,'127.0.0.1');
const supplierOperationsServer=createApp().listen(0,'127.0.0.1');let supplierOperationsBase:string;
const supplierBindingServer=createApp().listen(0,'127.0.0.1');let supplierBindingBase:string;
const supplierExecutionServer=createApp().listen(0,'127.0.0.1');let supplierExecutionBase:string;
const financeSourceServer=createApp().listen(0,'127.0.0.1');let financeSourceBase:string;
const financePlanningServer=createApp().listen(0,'127.0.0.1');let financePlanningBase:string;
const financeServer=createApp().listen(0,'127.0.0.1');let financeBase:string;
const supplierChangeServer=createApp().listen(0,'127.0.0.1');let supplierChangeBase:string;
const supplierLifecycleServer=createApp().listen(0,'127.0.0.1');let supplierLifecycleBase:string;
const supplierLegalServer=createApp().listen(0,'127.0.0.1');let supplierLegalBase:string;
const supplierDocumentsServer=createApp().listen(0,'127.0.0.1');let supplierDocumentsBase:string;
const supplierReviewsServer=createApp().listen(0,'127.0.0.1');let supplierReviewsBase:string;
const suppliersServer=createApp().listen(0,'127.0.0.1');let suppliersBase:string;
const projectsServer=createApp().listen(0,'127.0.0.1');let projectsBase:string;
const integrityServer=createApp().listen(0,'127.0.0.1'),filesServer=createApp().listen(0,'127.0.0.1');
let integrityBase:string,filesBase:string;
const consolidationServer=createApp().listen(0,'127.0.0.1');
let consolidationBase:string;
const contractServer=createApp().listen(0,'127.0.0.1');
let contractBase:string;
let alignmentBase:string;
let strategyBase:string;
let base:string;
before(async()=>{
 if(!financePlanningServer.listening)await new Promise<void>(resolve=>financePlanningServer.once('listening',resolve));financePlanningBase='http://127.0.0.1:'+(financePlanningServer.address() as AddressInfo).port+'/api/v1';
 for(const instance of [supplierBindingServer,supplierChangeServer,supplierExecutionServer,financePlanningServer,financeServer,financeSourceServer])if(!instance.listening)await new Promise<void>(resolve=>instance.once('listening',resolve));financeSourceBase='http://127.0.0.1:'+(financeSourceServer.address() as AddressInfo).port+'/api/v1';financeBase='http://127.0.0.1:'+(financeServer.address() as AddressInfo).port+'/api/v1';supplierExecutionBase='http://127.0.0.1:'+(supplierExecutionServer.address() as AddressInfo).port+'/api/v1';supplierBindingBase='http://127.0.0.1:'+(supplierBindingServer.address() as AddressInfo).port+'/api/v1';supplierChangeBase='http://127.0.0.1:'+(supplierChangeServer.address() as AddressInfo).port+'/api/v1';
 if(!supplierLifecycleServer.listening)await new Promise<void>(resolve=>supplierLifecycleServer.once('listening',resolve));supplierLifecycleBase='http://127.0.0.1:'+(supplierLifecycleServer.address() as AddressInfo).port+'/api/v1';
 if(!supplierLegalServer.listening)await new Promise<void>(resolve=>supplierLegalServer.once('listening',resolve));supplierLegalBase='http://127.0.0.1:'+(supplierLegalServer.address() as AddressInfo).port+'/api/v1';
 if(!supplierDocumentsServer.listening)await new Promise<void>(resolve=>supplierDocumentsServer.once('listening',resolve));supplierDocumentsBase='http://127.0.0.1:'+(supplierDocumentsServer.address() as AddressInfo).port+'/api/v1';
 if(!supplierReviewsServer.listening)await new Promise<void>(resolve=>supplierReviewsServer.once('listening',resolve));supplierReviewsBase='http://127.0.0.1:'+(supplierReviewsServer.address() as AddressInfo).port+'/api/v1';
 if(!supplierOperationsServer.listening)await new Promise<void>(resolve=>supplierOperationsServer.once('listening',resolve));supplierOperationsBase='http://127.0.0.1:'+(supplierOperationsServer.address() as AddressInfo).port+'/api/v1';
 if(!suppliersServer.listening)await new Promise<void>(resolve=>suppliersServer.once('listening',resolve));suppliersBase='http://127.0.0.1:'+(suppliersServer.address() as AddressInfo).port+'/api/v1';
 if(!projectsServer.listening)await new Promise<void>(resolve=>projectsServer.once('listening',resolve));projectsBase='http://127.0.0.1:'+(projectsServer.address() as AddressInfo).port+'/api/v1';
 for(const instance of [integrityServer,filesServer])if(!instance.listening)await new Promise<void>(resolve=>instance.once('listening',resolve));
 integrityBase='http://127.0.0.1:'+(integrityServer.address() as AddressInfo).port+'/api/v1';filesBase='http://127.0.0.1:'+(filesServer.address() as AddressInfo).port+'/api/v1';
 if(!consolidationServer.listening)await new Promise<void>(resolve=>consolidationServer.once('listening',resolve));
 consolidationBase='http://127.0.0.1:'+(consolidationServer.address() as AddressInfo).port+'/api/v1';
 if(!server.listening) await new Promise<void>(resolve=>server.once('listening',resolve));
 if(!strategyServer.listening)await new Promise<void>(resolve=>strategyServer.once('listening',resolve));
 if(!alignmentServer.listening)await new Promise<void>(resolve=>alignmentServer.once('listening',resolve));
 alignmentBase='http://127.0.0.1:'+(alignmentServer.address() as AddressInfo).port+'/api/v1';
 if(!contractServer.listening)await new Promise<void>(resolve=>contractServer.once('listening',resolve));
 contractBase='http://127.0.0.1:'+(contractServer.address() as AddressInfo).port+'/api/v1';
 strategyBase='http://127.0.0.1:'+(strategyServer.address() as AddressInfo).port+'/api/v1';
 base='http://127.0.0.1:'+(server.address() as AddressInfo).port+'/api/v1';
});
after(async()=>{for(const instance of [supplierBindingServer,supplierChangeServer,supplierExecutionServer,financePlanningServer,financeServer,financeSourceServer])await new Promise<void>((resolve,reject)=>instance.close(error=>error?reject(error):resolve()));await new Promise<void>((resolve,reject)=>supplierLifecycleServer.close(error=>error?reject(error):resolve()));await new Promise<void>((resolve,reject)=>supplierLegalServer.close(error=>error?reject(error):resolve()));await new Promise<void>((resolve,reject)=>supplierDocumentsServer.close(error=>error?reject(error):resolve()));await new Promise<void>((resolve,reject)=>supplierReviewsServer.close(error=>error?reject(error):resolve()));await new Promise<void>((resolve,reject)=>supplierOperationsServer.close(error=>error?reject(error):resolve()));await new Promise<void>((resolve,reject)=>suppliersServer.close(error=>error?reject(error):resolve()));await new Promise<void>((resolve,reject)=>projectsServer.close(error=>error?reject(error):resolve()));for(const instance of [integrityServer,filesServer])await new Promise<void>((resolve,reject)=>instance.close(error=>error?reject(error):resolve()));await new Promise<void>((resolve,reject)=>consolidationServer.close(error=>error?reject(error):resolve()));await new Promise<void>((resolve,reject)=>contractServer.close(error=>error?reject(error):resolve()));await new Promise<void>((resolve,reject)=>alignmentServer.close(error=>error?reject(error):resolve()));await new Promise<void>((resolve,reject)=>strategyServer.close(error=>error?reject(error):resolve()));await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));await pool.end();});
async function login(email:string){
 const response=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:process.env.DEMO_PASSWORD})});
 assert.equal(response.status,200);return (await response.json()).token as string;
}
const get=(path:string,token:string)=>fetch(base+path,{headers:{Authorization:'Bearer '+token}});
test('API exige autenticação e rejeita token forjado',async()=>{
 assert.equal((await fetch(base+'/companies')).status,401);
 assert.equal((await get('/companies','forjado')).status,401);
});
test('isolamento real: lista e registros, companyId adulterado e visão corporativa',async()=>{
 const token=await login('projetos@example.test');
 const companies=await (await get('/companies',token)).json();
 assert.deepEqual(companies.map((c:{id:string})=>c.id),['arqueoproject']);
 const response=await get('/modules/projects/overview?companyId=arqueoproject',token);
 assert.equal(response.status,200);
 const data=await response.json();assert.equal(data.records.length,1);
 assert.ok(data.records.every((r:{companyId:string})=>r.companyId==='arqueoproject'));
 for(const id of ['arqueocean','holding','corporate',"' OR 1=1 --"])assert.equal((await get('/modules/projects/overview?companyId='+encodeURIComponent(id),token)).status,403);
 assert.equal((await get('/modules/projects/overview',token)).status,400);
});
test('Holding autorizada consolida empresas e permite contexto individual',async()=>{
 const token=await login('holding@example.test');
 assert.equal((await (await get('/companies',token)).json()).length,5);
 const data=await (await get('/modules/finance/overview?companyId=corporate',token)).json();
 assert.equal(new Set(data.records.map((r:{companyId:string})=>r.companyId)).size,5);
 const scoped=await (await get('/modules/finance/overview?companyId=arqueocean',token)).json();
 assert.equal(scoped.records.length,1);assert.equal(scoped.records[0].companyId,'arqueocean');
});
test('cargo sem permissão é negado no backend',async()=>{
 const token=await login('restrito@example.test');
 assert.equal((await get('/modules/projects/overview?companyId=arqueoproject',token)).status,403);
});
test('revogação de vínculo passa a valer em sessão existente',async()=>{
 const token=await login('oceano@example.test');
 const [u]=await rows<{id:string}>('SELECT id FROM users WHERE email=?',['oceano@example.test']);
 await pool.execute('UPDATE memberships SET role_id=? WHERE user_id=?',['restricted',u.id]);
 try {assert.equal((await get('/modules/projects/overview?companyId=arqueocean',token)).status,403);}
 finally {await pool.execute('UPDATE memberships SET role_id=? WHERE user_id=?',['company-reader',u.id]);}
});
test('logout e expiração invalidam sessão e auditoria registra acesso negado',async()=>{
 const token=await login('projetos@example.test');
 assert.equal((await fetch(base+'/auth/logout',{method:'POST',headers:{Authorization:'Bearer '+token}})).status,204);
 assert.equal((await get('/me',token)).status,401);
 const expiring=await login('oceano@example.test');
 await pool.execute('UPDATE sessions SET expires_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 SECOND) WHERE user_id=(SELECT id FROM users WHERE email=?)',['oceano@example.test']);
 assert.equal((await get('/me',expiring)).status,401);
 const denied=await rows('SELECT id FROM audit_events WHERE outcome=? AND action=?',['denied','module.overview']);
 assert.ok(denied.length>0);
});
test('erros não expõem SQL, senha ou stack',async()=>{
 const response=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:"' OR 1=1 --",password:'invalid'})});
 assert.equal(response.status,401);assert.deepEqual(await response.json(),{error:'Credenciais inválidas.'});
});


let governanceDirector='';let governanceManager='';
async function directorToken(){return governanceDirector||=await login('holding@example.test');}
async function managerToken(){return governanceManager||=await login('projetos@example.test');}
async function mutate(path:string,token:string,body:unknown,method='POST'){
 return fetch(base+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
}
test('governança exige sessão e nega gestão a gerente',async()=>{
 assert.equal((await fetch(base+'/governance/snapshot')).status,401);
 assert.equal((await mutate('/governance/units',await managerToken(),{name:'Unidade sintética proibida'})).status,403);
 assert.equal((await get('/governance/grants',await managerToken())).status,403);
});
test('Holding unificada preserva proveniência e inclui somente estratégia para UTU/Vinho',async()=>{
 const token=await directorToken();
 const provenance=await rows<{scope_id:string}>('SELECT scope_id FROM scope_provenance ORDER BY source_scope');
 assert.equal(provenance.length,2);assert.ok(provenance.every(p=>p.scope_id==='scope-holding'));
 const list=await(await get('/companies?module=strategy',token)).json();assert.equal(list.length,7);
 for(const company of ['utu','vinho-24'])for(const module of ['projects','contracts','suppliers','finance'])assert.equal((await get('/modules/'+module+'/overview?companyId='+company,token)).status,403);
 const snapshot=await(await get('/governance/snapshot',token)).json();assert.equal(snapshot.companies.length,7);assert.equal(snapshot.profile,'DIRETORES');assert.equal(snapshot.units.length,3);
 assert.equal((await get('/governance/snapshot?scopeId=-1',token)).status,403);
});
test('permissão pessoal, unitária e revogação são verificadas em sessão já aberta',async()=>{
 const director=await directorToken(),manager=await managerToken();
 const [u]=await rows<{id:string}>('SELECT id FROM users WHERE email=?',['projetos@example.test']);
 const permission={userId:u.id,scopeId:'scope-unit:africa',module:'strategy',action:'read',effect:'allow'};
 assert.equal((await mutate('/governance/grants',director,permission,'PUT')).status,200);
 assert.equal((await get('/modules/strategy/overview?companyId=utu',manager)).status,200);
 assert.equal((await get('/modules/strategy/overview?companyId=vinho-24',manager)).status,403);
 assert.equal((await mutate('/governance/grants',director,{...permission,scopeId:'scope-company:utu',effect:'deny'},'PUT')).status,200);
 assert.equal((await get('/modules/strategy/overview?companyId=utu',manager)).status,403);
 // Even an explicit operational grant cannot enable UTU finance.
 assert.equal((await mutate('/governance/grants',director,{...permission,scopeId:'scope-company:utu',module:'finance'},'PUT')).status,200);
 assert.equal((await get('/modules/finance/overview?companyId=utu',manager)).status,403);
 await pool.execute('DELETE FROM scope_grants WHERE user_id=?',[u.id]);
});
test('negação pessoal também remove registros da consolidação corporativa',async()=>{
 const token=await directorToken();const [u]=await rows<{id:string}>('SELECT id FROM users WHERE email=?',['holding@example.test']);
 await pool.execute('INSERT INTO scope_grants VALUES (?,?,?,?,?)',[u.id,'scope-company:arqueocean','finance','read','deny']);
 try{const data=await(await get('/modules/finance/overview?companyId=corporate',token)).json();assert.ok(data.records.every((r:{companyId:string})=>r.companyId!=='arqueocean'));assert.equal(data.records.length,4);}finally{await pool.execute('DELETE FROM scope_grants WHERE user_id=? AND scope_id=? AND module_id=? AND action=?',[u.id,'scope-company:arqueocean','finance','read']);}
});
test('transferências concorrentes mantêm uma unidade ativa, histórico e auditoria',async()=>{
 const token=await directorToken();const today=new Date().toISOString().slice(0,10);
 const results=await Promise.all(['africa','vinho'].map(unitId=>mutate('/governance/transfer',token,{companyId:'arqueoproject',unitId,effectiveDate:today})));
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 const history=await(await get('/governance/history/arqueoproject',token)).json();assert.equal(history.length,2);assert.equal(history[0].unit_id,'arqueo');assert.equal(history[0].valid_to,today);assert.equal(history[1].valid_from,today);assert.equal(history[1].valid_to,null);
 const old=await(await get('/governance/snapshot?scopeId=scope-unit:arqueo&asOf=2000-01-01',token)).json();assert.ok(old.companies.some((c:{id:string})=>c.id==='arqueoproject'));
 const current=await(await get('/governance/snapshot?scopeId=scope-unit:arqueo',token)).json();assert.ok(!current.companies.some((c:{id:string})=>c.id==='arqueoproject'));
 assert.equal((await mutate('/governance/transfer',token,{companyId:'utu',unitId:'arqueo',effectiveDate:'2000-01-01'})).status,400);
 await assert.rejects(pool.execute('INSERT INTO company_unit_history(id,company_id,unit_id,valid_from) VALUES (UUID(),?,?,?)',['arqueoproject','arqueo',today]));
 assert.equal((await rows('SELECT id FROM governance_events WHERE action=?',['company.transfer'])).length,1);
});
test('unidades futuras e perfis possuem persistência e auditoria',async()=>{
 const token=await directorToken();const response=await mutate('/governance/units',token,{name:'Expansão sintética'});assert.equal(response.status,201);const unit=await response.json();
 assert.ok((await(await get('/governance/snapshot',token)).json()).units.some((u:{id:string})=>u.id===unit.id));
 const [u]=await rows<{id:string}>('SELECT id FROM users WHERE email=?',['oceano@example.test']);
 assert.equal((await mutate('/governance/profile',token,{userId:u.id,profile:'GERENTES'},'PUT')).status,200);
 assert.equal((await rows<{profile:string}>('SELECT profile FROM user_profiles WHERE user_id=?',[u.id]))[0].profile,'GERENTES');
 assert.ok((await rows('SELECT id FROM governance_events WHERE action=?',['profile.configure'])).length>0);
});
registerStrategyTests(()=>strategyBase,directorToken,managerToken);
register02cTests(()=>alignmentBase,directorToken,managerToken);
registerSupplierStructureTests(()=>suppliersBase,directorToken,managerToken);
registerProjectTests(()=>projectsBase,directorToken,managerToken);
register03dTests(()=>integrityBase,()=>filesBase,directorToken,managerToken);
register03cTests(()=>consolidationBase,directorToken,managerToken);
registerContractTests(()=>contractBase,directorToken,managerToken);
registerSupplierOperationsTests(()=>supplierOperationsBase,directorToken,managerToken);
registerSupplierReviewTests(()=>supplierReviewsBase,directorToken,managerToken);
registerSupplierDocumentTests(()=>supplierDocumentsBase,directorToken,managerToken);
registerSupplierLegalTests(()=>supplierLegalBase,directorToken,managerToken);
registerSupplierLifecycleTests(()=>supplierLifecycleBase,directorToken,managerToken);
registerSupplierBindingTests(()=>supplierBindingBase,directorToken);
registerSupplierOrderChangeTests(()=>supplierChangeBase,directorToken);
registerSupplierExecutionTests(()=>supplierExecutionBase,directorToken);
registerFinanceTests(()=>financeBase,directorToken,managerToken);
registerFinanceSourceTests(()=>financeSourceBase,directorToken);
registerFinancePlanningTests(()=>financePlanningBase,directorToken);
test('migrações validam checksum/dirty e rollback 002 preserva 001 e usuários',async()=>{
 const {migrate}=await import('../scripts/migration-engine.ts');const c=await pool.getConnection();
 try{
 const before=(await rows<{n:number}>('SELECT COUNT(*) n FROM users'))[0].n;
 const [legacy]=await rows<{checksum:string}>('SELECT checksum FROM schema_migrations WHERE version=?',['001_foundation']);
 await pool.execute('UPDATE schema_migrations SET checksum=NULL WHERE version=?',['001_foundation']);
 try{await assert.rejects(migrate(c,'up'),/Adoção/);process.env.ADOPT_LEGACY_001='yes';await migrate(c,'up');}finally{delete process.env.ADOPT_LEGACY_001;await pool.execute('UPDATE schema_migrations SET checksum=? WHERE version=?',[legacy.checksum,'001_foundation']);}
 const [m]=await rows<{checksum:string}>('SELECT checksum FROM schema_migrations WHERE version=?',['002_governance']);
 await pool.execute('UPDATE schema_migrations SET checksum=? WHERE version=?',['0'.repeat(64),'002_governance']);
 try{await assert.rejects(migrate(c,'up'),/Checksum/);}finally{await pool.execute('UPDATE schema_migrations SET checksum=? WHERE version=?',[m.checksum,'002_governance']);}
 await pool.execute('UPDATE schema_migrations SET dirty=TRUE WHERE version=?',['002_governance']);
 try{await assert.rejects(migrate(c,'up'),/incompleta/);}finally{await pool.execute('UPDATE schema_migrations SET dirty=FALSE WHERE version=?',['002_governance']);}
 const old=process.env.ALLOW_DESTRUCTIVE_ROLLBACK;process.env.ALLOW_DESTRUCTIVE_ROLLBACK='yes';
 try{await migrate(c,'down','002_governance');}finally{if(old===undefined)delete process.env.ALLOW_DESTRUCTIVE_ROLLBACK;else process.env.ALLOW_DESTRUCTIVE_ROLLBACK=old;}
 assert.equal((await rows<{n:number}>('SELECT COUNT(*) n FROM users'))[0].n,before);
 assert.equal((await rows('SELECT version FROM schema_migrations')).length,1);
 await migrate(c,'up');await migrate(c,'up');
 assert.equal((await rows('SELECT version FROM schema_migrations')).length,18);
 }finally{c.release();}
});
