import {test,after,before} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server/app.ts';
import {pool,rows} from '../server/db.ts';
import type {AddressInfo} from 'node:net';
if (!process.env.DB_NAME?.endsWith('_demo')) throw new Error('Testes de integração exigem banco *_demo.');
const server=createApp().listen(0,'127.0.0.1');
let base:string;
before(async()=>{
 if(!server.listening) await new Promise<void>(resolve=>server.once('listening',resolve));
 base='http://127.0.0.1:'+(server.address() as AddressInfo).port+'/api/v1';
});
after(async()=>{await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));await pool.end();});
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
