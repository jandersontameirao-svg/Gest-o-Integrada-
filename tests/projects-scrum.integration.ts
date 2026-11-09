import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {rows,pool} from '../server/db.ts';
export function registerScrumTests(base:()=>string,director:()=>Promise<string>,manager:()=>Promise<string>){
 let id='',sprintId='',taskId='',foreign='';const today=new Date().toISOString().slice(0,10);
 const payload={name:'Scrum sintético 08A',internalCode:'SCRUM-08A',description:'Sem dados reais',managerId:null,status:'planning',methodology:'scrum',priority:'medium',currency:'BRL',proposedValue:'0.00',decisionReason:'Diretor autoriza planejamento, sem despesa'};
 async function api(path:string,method='GET',data?:Record<string,unknown>,token?:string){return fetch(base()+path,{method,headers:{Authorization:'Bearer '+(token??await director()),'Content-Type':'application/json'},...(data?{body:JSON.stringify({requestId:randomUUID(),...data})}:{})});}
 const state=async()=>{const r=await api('/projects/'+id);assert.equal(r.status,200,await r.clone().text());return r.json();};
 async function record(kind:string,data:Record<string,unknown>,old?:{id:string;revision:number}){const s=await state();return api('/projects/'+id+'/records/'+kind,'POST',{revision:s.project.revision,data,...(old?{id:old.id,recordRevision:old.revision}:{})});}
 async function lifecycle(action:string,extra:Record<string,unknown>={}){const s=await state(),r=s.records.find((r:{id:string})=>r.id===sprintId);return api('/projects/'+id+'/scrum/'+sprintId+'/'+action,'POST',{revision:s.project.revision,recordRevision:r.revision,reason:'Decisão sintética '+action,...extra});}
 test('08A Scrum original: criar sprint/backlog, recarregar e impedir ativação por DTO genérico',async()=>{
  let r=await api('/projects','POST',{companyId:'arqueoproject',explicitDirectorDecision:true,data:payload});assert.equal(r.status,201,await r.clone().text());id=(await r.json()).id;
  r=await api('/projects','POST',{companyId:'arqueocean',explicitDirectorDecision:true,data:{...payload,internalCode:'SCRUM-OCEAN'}});assert.equal(r.status,201);foreign=(await r.json()).id;
  r=await record('sprint',{title:'Sprint sintética',goal:'Persistência',startDate:today,endDate:today,status:'planned'});assert.equal(r.status,200,await r.clone().text());sprintId=(await r.json()).id;
  r=await record('task',{title:'Tarefa zero',description:'',startDate:today,endDate:today,status:'todo',priority:'medium',progress:0,storyPoints:0,estimatedHours:0,sprintId});assert.equal(r.status,200);taskId=(await r.json()).id;
  const s=await state(),sp=s.records.find((r:{id:string})=>r.id===sprintId);
  assert.equal((await record('sprint',{...sp.payload,status:'active'},sp)).status,409);
  r=await api('/projects/'+id+'/scrum/'+sprintId);assert.equal(r.status,200);assert.equal((await r.json()).totalPoints,null);
 });
 test('08A start é concorrente/idempotente, mantém datas e baseline zero; bloqueia segunda sprint ativa',async()=>{
  let s=await state(),sp=s.records.find((r:{id:string})=>r.id===sprintId);const input={revision:s.project.revision,recordRevision:sp.revision,reason:'Decisão sintética concorrente',requestId:randomUUID()};const pair=await Promise.all([api('/projects/'+id+'/scrum/'+sprintId+'/start','POST',input),api('/projects/'+id+'/scrum/'+sprintId+'/start','POST',input)]);assert.deepEqual(pair.map(r=>r.status),[200,200]);
  let r=await api('/projects/'+id+'/scrum/'+sprintId);let b=await r.json();assert.equal(b.observations.length,1);assert.equal(b.baselinePoints,0);assert.equal(b.remainingPoints,0);assert.equal(b.sprint.payload.startDate,today);assert.ok(b.sprint.payload.startedAt);
  s=await state();sp=s.records.find((r:{id:string})=>r.id===sprintId);const {startedAt,...dto}=sp.payload;assert.equal((await record('sprint',{...dto,startDate:'2026-01-01'},sp)).status,409);
  r=await record('sprint',{title:'Segunda sprint',goal:'',startDate:today,endDate:today,status:'planned'});assert.equal(r.status,200);const second=(await r.json()).id;s=await state();assert.equal((await api('/projects/'+id+'/scrum/'+second+'/start','POST',{revision:s.project.revision,recordRevision:1,reason:'Negar segunda ativa'})).status,409);
 });
 test('08A editar pontos/status por API canônica registra observações e preserva baseline e autoria',async()=>{
  let s=await state(),t=s.records.find((r:{id:string})=>r.id===taskId);assert.equal((await record('task',{...t.payload,storyPoints:5},t)).status,200);s=await state();t=s.records.find((r:{id:string})=>r.id===taskId);assert.equal((await record('task',{...t.payload,status:'done',progress:100},t)).status,200);
  const r=await api('/projects/'+id+'/scrum/'+sprintId),b=await r.json();assert.equal(b.observations.length,3);assert.equal(b.baselinePoints,0);assert.equal(b.totalPoints,5);assert.equal(b.remainingPoints,0);assert.equal(b.scopeChange,5);assert.equal(b.actualLine.at(-1).points,0);assert.ok(b.observations.every((o:{actorId:string})=>o.actorId));
  const [n]=await rows<{n:number}>('SELECT COUNT(*) n FROM operational_project_budgets WHERE project_id=?',[id]);assert.equal(n.n,0);
 });
 test('08A encerramento preserva história, impede retirada pelo endpoint genérico e reabertura exige diretor',async()=>{
  assert.equal((await lifecycle('complete')).status,200);let s=await state(),t=s.records.find((r:{id:string})=>r.id===taskId);assert.equal((await record('task',{...t.payload,sprintId:null},t)).status,409);
  const sp=s.records.find((r:{id:string})=>r.id===sprintId);assert.equal((await api('/projects/'+id+'/scrum/'+sprintId+'/reopen','POST',{revision:s.project.revision,recordRevision:sp.revision,reason:'Gerente não pode reabrir'},await manager())).status,403);
  assert.equal((await lifecycle('reopen')).status,200);s=await state();t=s.records.find((r:{id:string})=>r.id===taskId);assert.equal((await record('task',{...t.payload,status:'review',progress:80},t)).status,200);assert.equal((await lifecycle('complete')).status,409);assert.equal((await lifecycle('complete',{acceptIncomplete:true})).status,200);
  const r=await api('/projects/'+id+'/scrum/'+sprintId+'?export=json');assert.equal(r.status,200);const b=await r.json();assert.equal(b.sprint.payload.incompleteAccepted,true);assert.equal(b.remainingPoints,5);assert.equal(b.observations.length,7);
 });
 test('08A segurança em leituras, exportação, IDs estrangeiros, UTU/Vinho e período de projeto encerrado',async()=>{
  assert.equal((await fetch(base()+'/projects/'+id+'/scrum/'+sprintId)).status,401);
  assert.equal((await api('/projects/'+foreign+'/scrum/'+sprintId)).status,404);
  assert.equal((await api('/projects/'+foreign+'/scrum/'+sprintId,'GET',undefined,await manager())).status,403);
  assert.equal((await api('/projects/'+id+'/scrum/'+sprintId+'?export=json','GET',undefined,await manager())).status,403);
  for(const companyId of ['utu','vinho-24'])assert.equal((await api('/projects','POST',{companyId,explicitDirectorDecision:true,data:payload})).status,403);
  let s=await state();assert.equal((await api('/projects/'+id,'PUT',{revision:s.project.revision,data:{...s.project.payload,status:'completed'}})).status,200);assert.equal((await lifecycle('reopen')).status,409);
  const [out]=await rows<{n:number}>('SELECT COUNT(*) n FROM module_event_outbox WHERE source_module="projects" AND entity_id=? AND event_type LIKE "operational_project.scrum.%"',[id]);assert.equal(out.n,4);
  const [count]=await rows<{n:number}>('SELECT COUNT(*) n FROM project_sprint_observations WHERE project_id=?',[id]);assert.equal(count.n,7);
 });
}
