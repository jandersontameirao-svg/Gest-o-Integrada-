import {test} from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {pool,rows} from '../server/db.ts';
export function registerStrategyFinanceTests(base:()=>string,token:()=>Promise<string>){
 const company='arqueogis-geo',date=(new Date().getUTCFullYear()-4)+'-01-15',scope='scope-company:'+company;let account='',income='',expense='',payment='';
 async function api(path:string,method='GET',body?:Record<string,unknown>,co=company){return fetch(base()+'/finance'+path+(path.includes('?')?'&':'?')+'companyId='+co,{method,headers:{Authorization:'Bearer '+await token(),'Content-Type':'application/json'},...(body?{body:JSON.stringify({companyId:co,requestId:randomUUID(),reason:'Indicadores estratégicos sintéticos',...body})}:{})});}
 async function ok(r:Response,status=200){assert.equal(r.status,status,await r.clone().text());return r.json();}
 const query='/strategy-indicators?scopeId='+scope+'&from='+date+'&to='+date+'&asOf='+date+'&horizon=90&currency=BRL';
 test('07B finance to strategy: canonical results, balances, provenance and no published duplication',async()=>{
  account=(await ok(await api('/accounts','POST',{data:{name:'07B indicador sintético',kind:'Carteira',currency:'BRL',openingBalance:'500.00',openingDate:date}}),201)).id;
  for(const [bucket,nature,amount,name] of [['income','revenue','1000.00','Receita07B'],['variable','opex','300.00','Despesa07B']]){
   const cat=(await ok(await api('/categories','POST',{data:{name,bucket,nature}}),201)).id;const title=(await ok(await api('/titles','POST',{data:{description:name,bucket,amount,currency:'BRL',dueDate:date,competenceDate:date,categoryId:cat,accountId:null,contactId:null,projectId:null,contractId:null,documentNumber:'',paymentMethod:'',costCenterId:null,tagIds:[],notes:'Privado sintético'}}),201)).id;
   await ok(await api('/titles/'+title+'/decisions/approve','POST',{revision:1,evidence:'Conferido'}));const paid=(await ok(await api('/titles/'+title+'/settlements','POST',{revision:2,data:{accountId:account,date,amount:bucket==='income'?'400.00':'100.00',method:'PIX'}}),201)).id;if(bucket==='income'){income=title;payment=paid;}else expense=title;
  }
  const before=(await rows<{n:number}>('SELECT COUNT(*) n FROM strategy_facts'))[0].n;
  for(let i=0;i<2;i++){const v=await ok(await api(query));assert.equal(v.metrics.ebitda,'700.00');assert.equal(v.metrics.netRevenue,'1000.00');assert.equal(v.metrics.ebitdaMargin,70);assert.equal(v.metrics.currentBalance,'800.00');assert.equal(v.metrics.receivable,'600.00');assert.equal(v.metrics.payable,'200.00');assert.equal(v.metrics.projectedBalance,'1200.00');assert.equal(v.provenance.titles.filter((t:any)=>t.id===income).length,1);assert.equal(v.provenance.titles[0].notes,undefined);assert.equal(v.unitAggregation,false);assert.equal(v.publishedToStrategy,false);}
  assert.equal((await rows<{n:number}>('SELECT COUNT(*) n FROM strategy_facts'))[0].n,before);await ok(await api(query+'&export=true'));
  await ok(await api('/settlements/'+payment+'/reverse','POST',{revision:3,evidence:'Estorno sintético'}));const reversed=await ok(await api(query));assert.equal(reversed.metrics.currentBalance,'400.00');assert.equal(reversed.metrics.receivable,'1000.00');assert.equal(reversed.metrics.ebitda,'700.00');
 });
 test('07B strategy/finance grants, scopes, strategic-only companies, currency and exports',async()=>{
  assert.equal((await api(query.replace(scope,'scope-holding'))).status,400);assert.equal((await api(query+'&accountId='+randomUUID())).status,400);
  for(const co of ['utu','vinho-24'])assert.equal((await api(query.replace(scope,'scope-company:'+co),'GET',undefined,co)).status,403);
  const other=await ok(await api(query.replace('currency=BRL','currency=MZN')));assert.equal(other.hasFinancialData,false);assert.equal(other.provenance.titles.length,0);
  const [u]=await rows<{id:string}>('SELECT id FROM users WHERE email=?',['holding@example.test']);
  for(const [module,action,suffix] of [['strategy','read',''],['finance','income.read',''],['finance','variable.read',''],['finance','balances',''],['finance','export','&export=true'],['strategy','export','&export=true']]){
   const old=await rows<{effect:string}>('SELECT effect FROM scope_grants WHERE user_id=? AND scope_id=? AND module_id=? AND action=?',[u.id,scope,module,action]);
   try{await pool.execute('INSERT INTO scope_grants VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE effect=?',[u.id,scope,module,action,'deny','deny']);assert.equal((await api(query+suffix)).status,403);}
   finally{if(old.length)await pool.execute('UPDATE scope_grants SET effect=? WHERE user_id=? AND scope_id=? AND module_id=? AND action=?',[old[0].effect,u.id,scope,module,action]);else await pool.execute('DELETE FROM scope_grants WHERE user_id=? AND scope_id=? AND module_id=? AND action=?',[u.id,scope,module,action]);}
  }
  assert.equal((await api(query)).status,200);
 });
}
