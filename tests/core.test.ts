import {test} from 'node:test';
import assert from 'node:assert/strict';
import {authorize,canCorporate,visibleCompanyIds,HttpError} from '../server/policy.ts';
import {hashPassword,verifyPassword,digestToken,newToken} from '../server/crypto.ts';
import {companies,modules,type Principal,type Membership} from '../shared/catalog.ts';
const member=(changes:Partial<Membership>={}):Membership=>({companyId:'arqueoproject',roleId:'company-reader',corporate:false,isHolding:false,permissions:['projects:read'],...changes});
const user=(memberships:Membership[]):Principal=>({id:'synthetic',name:'Demonstração',memberships});
test('cadastro contém somente as cinco empresas e cinco módulos previstos',()=>{
 assert.equal(companies.length,5);assert.equal(modules.length,5);
 assert.equal(companies.filter(c=>c.isHolding).length,1);
 assert.ok(!companies.some(c=>/utu/i.test(c.name)));
});
test('leitor acessa exclusivamente sua empresa',()=>{
 const u=user([member()]);
 assert.deepEqual(authorize(u,'arqueoproject','projects'),{corporate:false,companyId:'arqueoproject'});
 for(const id of companies.filter(c=>c.id!=='arqueoproject').map(c=>c.id))assert.throws(()=>authorize(u,id,'projects'),HttpError);
 assert.throws(()=>authorize(u,'corporate','projects'),HttpError);
 assert.deepEqual(visibleCompanyIds(u),['arqueoproject']);
});
test('trocar ou omitir companyId nunca amplia acesso',()=>{
 const u=user([member()]);
 for(const id of [undefined,'','unknown',"' OR 1=1 --"])assert.throws(()=>authorize(u,id,'projects'),HttpError);
});
test('somente Holding com concessão explícita recebe acesso corporativo',()=>{
 assert.equal(canCorporate(user([member({corporate:true})])),false);
 assert.equal(canCorporate(user([member({companyId:'holding',isHolding:true})])),false);
 const u=user([member({companyId:'holding',isHolding:true,corporate:true})]);
 assert.equal(canCorporate(u),true);assert.equal(visibleCompanyIds(u),null);
 assert.equal(authorize(u,'corporate','projects').corporate,true);
 assert.doesNotThrow(()=>authorize(u,'arqueocean','projects'));
});
test('cargo corporativo não herda módulos ou ações não concedidos',()=>{
 const u=user([member({companyId:'holding',isHolding:true,corporate:true})]);
 assert.throws(()=>authorize(u,'corporate','finance'),HttpError);
 assert.throws(()=>authorize(u,'arqueocean','projects','write'),HttpError);
});
test('múltiplos vínculos mantêm as permissões de cada empresa',()=>{
 const u=user([member(),member({companyId:'arqueocean',permissions:['finance:read']})]);
 assert.doesNotThrow(()=>authorize(u,'arqueocean','finance'));
 assert.throws(()=>authorize(u,'arqueoproject','finance'),HttpError);
 assert.throws(()=>authorize(u,'arqueocean','projects'),HttpError);
});
test('ausência de vínculos ou permissões nega acesso',()=>{
 for(const u of [user([]),user([member({permissions:[]})])])assert.throws(()=>authorize(u,'arqueoproject','projects'),HttpError);
});
test('senhas usam salt aleatório e validação resistente a comparação direta',async()=>{
 const a=await hashPassword('senha-sintetica-longa');
 const b=await hashPassword('senha-sintetica-longa');
 assert.notEqual(a,b);assert.ok(await verifyPassword('senha-sintetica-longa',a));
 assert.equal(await verifyPassword('errada',a),false);
 assert.equal(await verifyPassword('x','invalido'),false);
});
test('tokens não são previsíveis e o banco recebe somente digest',()=>{
 const a=newToken();const b=newToken();assert.notEqual(a,b);
 assert.equal(a.length,43);assert.equal(digestToken(a).length,64);assert.notEqual(a,digestToken(a));
});
