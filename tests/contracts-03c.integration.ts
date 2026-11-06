import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
export function register03cTests(base:()=>string,director:()=>Promise<string>,manager:()=>Promise<string>){
 async function api(path:string,method='GET',body?:Record<string,unknown>,token?:string){return fetch(base()+'/contracts'+path,{method,headers:{Authorization:'Bearer '+(token??await director()),'Content-Type':'application/json'},...(body?{body:JSON.stringify({requestId:randomUUID(),...body})}:{})});}
 let id='',milestone='',measurement='';
 const state=async()=>{const r=await api('/'+id);assert.equal(r.status,200);return r.json();};
 const save=async(kind:string,data:Record<string,unknown>,old?:{id:string;revision:number})=>{const s=await state();return api('/'+id+'/records/'+kind,'POST',{revision:s.contract.revision,data,...(old?{id:old.id,recordRevision:old.revision}:{})});};
 const decision=async(rid:string,action:string,extra:Record<string,unknown>={})=>{const s=await state();const r=s.records.find((r:{id:string})=>r.id===rid);return api('/'+id+'/measurements/'+rid+'/state','POST',{revision:s.contract.revision,recordRevision:r.revision,action,reason:'Decisão sintética 03C',...extra});};
 const data=(value:string,title='Medição 03C')=>({title,periodStart:'2026-08-01',periodEnd:'2026-08-31',items:[{milestoneId:milestone,description:title,value}],observations:'Sintético'});
 test('03C integração: medição parcial, glosa, recarga, faturabilidade e autorização',async()=>{
  let r=await api('/customers','POST',{companyId:'arqueoproject',name:'Cliente sintético 03C',taxId:'90000000000199',contact:{}});assert.equal(r.status,201);const partyId=(await r.json()).id;
  r=await api('/','POST',{companyId:'arqueoproject',partyId,reference:'DEMO-03C',data:{title:'Contrato 03C',description:'',totalValue:'100.00',currency:'BRL',startDate:'2026-01-01',endDate:'',status:'draft',observations:''}});assert.equal(r.status,201);id=(await r.json()).id;
  r=await save('milestone',{description:'Marco parcial',valorPrevisto:'100.00',dueDate:'2026-12-31',prazoPagamento:0,status:'pending'});assert.equal(r.status,200);milestone=(await r.json()).id;
  r=await save('measurement',data('80.00'));assert.equal(r.status,200);measurement=(await r.json()).id;
  assert.equal((await decision(measurement,'submit')).status,200);
  assert.equal((await decision(measurement,'approve',{glosas:[{item:0,value:'81.00',reason:'Inválida'}]})).status,400);
  assert.equal((await decision(measurement,'approve',{glosas:[{item:0,value:'20.00',reason:'Entrega parcial comprovada'}],evidence:'Aceite sintético registrado'})).status,200);
  let s=await state();assert.equal(s.measurements.available,'40.00');assert.equal(s.measurements.approved,'60.00');assert.equal(s.measurements.glosa,'20.00');assert.equal(s.measurements.received,null);
  const m=s.records.find((r:{id:string})=>r.id===measurement);assert.equal((await api('/'+id+'/measurements/'+measurement+'/state','POST',{revision:s.contract.revision,recordRevision:m.revision,action:'mark_billable',reason:'Proibido ao leitor'},await manager())).status,403);
  assert.equal((await decision(measurement,'mark_billable',{evidence:'Decisão humana de faturabilidade'})).status,200);s=await state();assert.equal(s.measurements.billable,'60.00');assert.equal(s.measurements.invoiced,null);
 });
 test('03C integração: excesso, duplicidade semântica, correção, rejeição, histórico e revisão negativa',async()=>{
  let r=await save('measurement',data('40.01','Parcela excedente'));assert.equal(r.status,200);const excess=(await r.json()).id;assert.equal((await decision(excess,'submit')).status,409);
  r=await save('measurement',data('40.00','Parcela complementar'));assert.equal(r.status,200);const second=(await r.json()).id;assert.equal((await decision(second,'submit')).status,200);
  const s=await state();const old=s.records.find((r:{id:string})=>r.id===milestone);r=await save('milestone',{...old.payload,valorPrevisto:'99.99'},old);assert.equal(r.status,400);
  assert.equal((await decision(second,'request_changes')).status,200);let loaded=await state();let current=loaded.records.find((r:{id:string})=>r.id===second);r=await save('measurement',data('30.00','Parcela corrigida'),current);assert.equal(r.status,200);assert.equal((await decision(second,'submit')).status,200);assert.equal((await decision(second,'reject')).status,200);assert.equal((await decision(second,'request_changes')).status,200);
  loaded=await state();assert.equal(loaded.measurements.available,'40.00');const history=await(await api('/'+id+'/history')).json();for(const action of ['measurement.approve','measurement.mark_billable','measurement.reject','measurement.request_changes'])assert.ok(history.some((h:{action:string})=>h.action===action));
  // Equal submissions below the cap are rejected independently of total balance.
  r=await save('measurement',data('10.00','Duplicada'));const a=(await r.json()).id;r=await save('measurement',data('10.00','Duplicada'));const b=(await r.json()).id;assert.equal((await decision(a,'submit')).status,200);assert.equal((await decision(b,'submit')).status,409);
  assert.equal((await api('/'+id+'/project-reference/v1?proposedValue=20.00')).status,200);const boundary=await(await api('/'+id+'/project-reference/v1?proposedValue=20.00')).json();assert.equal(boundary.grantsExpenseAuthority,false);assert.equal(boundary.eligibleForProjectLink,false);assert.equal(boundary.operationalProjectCreated,false);
 });
 test('03C documentos: versões imutáveis, vínculo e relatório PDF autorizado',async()=>{
  let s=await state();let r=await api('/'+id+'/documents','POST',{revision:s.contract.revision,fileName:'boletim.txt',content:'Versão sintética inicial',recordId:measurement});assert.equal(r.status,201);const first=(await r.json()).id;
  s=await state();r=await api('/'+id+'/documents','POST',{revision:s.contract.revision,fileName:'boletim.txt',content:'Versão sintética revisada',recordId:measurement,previousDocumentId:first});assert.equal(r.status,201);const second=(await r.json()).id;
  assert.equal(await(await api('/'+id+'/documents/'+first)).text(),'Versão sintética inicial');assert.equal(await(await api('/'+id+'/documents/'+second)).text(),'Versão sintética revisada');s=await state();assert.equal(s.documents.filter((d:{record_id:string})=>d.record_id===measurement).length,2);
  assert.equal((await api('/'+id+'/documents','POST',{revision:s.contract.revision,fileName:'boletim.txt',content:'Versão obsoleta',recordId:measurement,previousDocumentId:first})).status,409);
  assert.equal((await api('/'+id+'/documents','POST',{revision:s.contract.revision,fileName:'invalido.html',content:'<script>demo</script>'})).status,400);
  assert.equal((await api('/'+id+'/documents','POST',{revision:s.contract.revision,fileName:'outro.txt',content:'Sintético',recordId:randomUUID()})).status,400);
  r=await api('/'+id+'/report.pdf');assert.equal(r.status,200);assert.match(r.headers.get('content-type')!,/application\/pdf/);const bytes=Buffer.from(await r.arrayBuffer());assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.equal((await api('/'+id+'/report.pdf','GET',undefined,await manager())).status,403);assert.equal((await api('/'+id+'/report.pdf?recordId='+randomUUID())).status,404);
 });

}
