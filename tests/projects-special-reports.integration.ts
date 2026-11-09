import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {pool,rows} from '../server/db.ts';
import {unzipSync,strFromU8} from 'fflate';
export function registerSpecialReportTests(base:()=>string,director:()=>Promise<string>,manager:()=>Promise<string>){
 let id='',foreign='',a='',b='',sprint='',foreignSprint='';const saved=new Map<string,any>();
 const today=new Date().toISOString().slice(0,10),end=new Date(Date.parse(today)+6*86400000).toISOString().slice(0,10);
 const data={name:'Relatório especializado sintético 08E',internalCode:'RPT-08E',description:'Sem dados reais',managerId:null,status:'planning',methodology:'scrum',priority:'medium',currency:'BRL',proposedValue:'0.00',decisionReason:'Planejamento sintético autorizado pelo diretor'};
 async function api(path:string,method='GET',body?:Record<string,unknown>,token?:string){return fetch(base()+path,{method,headers:{Authorization:'Bearer '+(token??await director()),'Content-Type':'application/json'},...(body?{body:JSON.stringify({requestId:randomUUID(),...body})}:{})});}
 const state=async(project=id)=>{const r=await api('/projects/'+project);assert.equal(r.status,200);return r.json();};
 async function record(kind:string,payload:Record<string,unknown>,project=id,old?:{id:string;revision:number}){const s=await state(project),r=await api('/projects/'+project+'/records/'+kind,'POST',{revision:s.project.revision,data:payload,...(old?{id:old.id,recordRevision:old.revision}:{})});assert.equal(r.status,200,await r.clone().text());return (await r.json()).id as string;}
 const task=(title:string)=>({title,description:'',status:'todo',priority:'medium',startDate:today,endDate:today,durationDays:1,progress:0,storyPoints:5,estimatedHours:0});
 test('08E fontes reais: planejamento, sprint observada/encerrada, orçamento revisado e fato validado',async()=>{
  for(const companyId of ['arqueoproject','arqueocean']){const r=await api('/projects','POST',{companyId,explicitDirectorDecision:true,data});assert.equal(r.status,201);if(companyId==='arqueoproject')id=(await r.json()).id;else foreign=(await r.json()).id;}
  a=await record('task',task('A especializada'));b=await record('task',task('B especializada'));await record('dependency',{predecessorId:a,successorId:b,type:'FS',lagDays:0});
  sprint=await record('sprint',{title:'Sprint especializada',goal:'Objetivo sintético preservado',startDate:today,endDate:end,status:'planned'});foreignSprint=await record('sprint',{title:'Sprint alheia',goal:'Sintético',startDate:today,endDate:end,status:'planned'},foreign);
  let s=await state(),t=s.records.find((r:any)=>r.id===a);await record('task',{...t.payload,sprintId:sprint},id,t);
  s=await state();let r=await api('/projects/'+id+'/scrum/'+sprint+'/start','POST',{revision:s.project.revision,recordRevision:1,reason:'Início sintético'});assert.equal(r.status,200,await r.clone().text());
  s=await state();t=s.records.find((r:any)=>r.id===a);await record('task',{...t.payload,status:'done',progress:100},id,t);s=await state();const sp=s.records.find((r:any)=>r.id===sprint);r=await api('/projects/'+id+'/scrum/'+sprint+'/complete','POST',{revision:s.project.revision,recordRevision:sp.revision,reason:'Fechamento sintético'});assert.equal(r.status,200);
  for(const [kind,allocations] of [['original',{[a]:'60.00',[b]:'40.00'}],['reallocate',{[a]:'70.00',[b]:'30.00'}]] as const){s=await state();r=await api('/projects/'+id+'/budget','POST',{revision:s.project.revision,kind,allocations,reason:'Decisão orçamentária sintética'});assert.equal(r.status,200,await r.clone().text());}
  const fact=await record('work_fact',{taskId:b,value:'10.10',date:today,evidence:'Fato sintético autorizado'});s=await state();r=await api('/projects/'+id+'/facts/'+fact+'/validate','POST',{revision:s.project.revision,recordRevision:1,reason:'Validação sintética sem pagamento'});assert.equal(r.status,200);
 });
 test('08E relatórios especializados congelam calendário, observações e posição sem alterar projeto/Financeiro',async()=>{
  const before=await state(),[n]=await rows<{n:number}>('SELECT COUNT(*) n FROM finance_titles');
  for(const type of ['gantt_schedule','scrum_sprint','project_budget']){const filter={type,projectId:id,...(type==='scrum_sprint'?{sprintId:sprint}:{})},r=await api('/projects/reports/snapshots','POST',{companyId:'arqueoproject',filter});assert.equal(r.status,201,await r.clone().text());const v=await r.json();saved.set(type,v);assert.equal(v.report.sources[0].revision,before.project.revision);const loaded=await api('/projects/reports/snapshots/'+v.id);assert.equal(loaded.status,200,await loaded.clone().text());assert.deepEqual(await loaded.json(),v);}
  const gantt=saved.get('gantt_schedule').report,scrum=saved.get('scrum_sprint').report,budget=saved.get('project_budget').report;assert.equal(gantt.visual.bars.length,2);assert.equal(gantt.sections[0].rows[0][3],'FS');assert.equal(scrum.metadata.completedObservedPoints,5);assert.equal(scrum.metadata.remainingPoints,0);assert.equal(scrum.visual.points.find((p:any)=>p.date===today).actual,0);assert.deepEqual(budget.sections[0].rows[0],['BRL','100.00','100.00','0.00','10.10','89.90']);assert.equal(budget.sections[1].rows.length,2);assert.equal((await state()).project.revision,before.project.revision);assert.equal((await rows<{n:number}>('SELECT COUNT(*) n FROM finance_titles'))[0].n,n.n);
 });
 test('08E formatos reais incluem tabelas, valores, gráfico PDF e proveniência auditada por ID',async()=>{
  for(const [type,v] of saved){for(const format of ['pdf','csv','xlsx','json']){const r=await api('/projects/reports/snapshots/'+v.id+'?format='+format);assert.equal(r.status,200,await r.clone().text());assert.equal(r.headers.get('x-report-sha256'),v.sha256);const bytes=Buffer.from(await r.arrayBuffer());if(format==='pdf'){assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.ok(bytes.length>2000);}if(format==='xlsx'){const xml=strFromU8(unzipSync(bytes)['xl/worksheets/sheet1.xml']);assert.ok(xml.includes(type==='project_budget'?'89.90':'A especializada'));}if(format==='json')assert.deepEqual(JSON.parse(bytes.toString()),v);if(format==='csv')assert.ok(bytes.toString().includes(type==='scrum_sprint'?'Observações persistidas':'Revisão'));}assert.equal((await rows('SELECT id FROM audit_events WHERE action=?',['report.file:'+v.id+':pdf'])).length,1);}
 });
 test('08E segurança: escopo forjado até por diretor, sprint de outro projeto, permissões revogadas e UTU/Vinho',async()=>{
  const create=(companyId:string,filter:Record<string,unknown>,token?:string)=>api('/projects/reports/snapshots','POST',{companyId,filter},token);
  assert.equal((await create('arqueoproject',{type:'gantt_schedule',projectId:foreign})).status,403);
  assert.equal((await create('arqueoproject',{type:'scrum_sprint',projectId:id,sprintId:foreignSprint})).status,400);
  assert.equal((await api('/projects/reports/sprint-options?companyId=arqueoproject&projectId='+foreign)).status,403);
  assert.equal((await api('/projects/reports/sprint-options?companyId=arqueocean&projectId='+foreign,'GET',undefined,await manager())).status,403);
  for(const companyId of ['utu','vinho-24'])assert.equal((await create(companyId,{type:'gantt_schedule',projectId:id})).status,403);
  const [u]=await rows<{id:string}>('SELECT id FROM users WHERE email="holding@example.test"');await pool.execute('INSERT INTO scope_grants VALUES (?,?,?,?,?)',[u.id,'scope-company:arqueoproject','projects','export','deny']);try{for(const v of saved.values())assert.equal((await api('/projects/reports/snapshots/'+v.id)).status,403);}finally{await pool.execute('DELETE FROM scope_grants WHERE user_id=? AND scope_id=? AND module_id=? AND action=?',[u.id,'scope-company:arqueoproject','projects','export']);}
 });
 test('08E emissão concorrente idempotente não duplica; revisão do orçamento preserva emissão anterior',async()=>{
  const body={companyId:'arqueoproject',filter:{type:'project_budget',projectId:id},requestId:randomUUID()},rs=await Promise.all([api('/projects/reports/snapshots','POST',body),api('/projects/reports/snapshots','POST',body)]);for(const r of rs)assert.equal(r.status,201);assert.deepEqual(await rs[0].json(),await rs[1].json());
  let s=await state(),r=await api('/projects/'+id+'/budget','POST',{revision:s.project.revision,kind:'ceiling',allocations:{[a]:'80.00',[b]:'40.00'},reason:'Novo teto sintético por diretor'});assert.equal(r.status,200);const original=saved.get('project_budget');r=await api('/projects/reports/snapshots/'+original.id);assert.deepEqual(await r.json(),original);r=await api('/projects/reports/snapshots','POST',{companyId:'arqueoproject',filter:{type:'project_budget',projectId:id}});assert.equal(r.status,201);const revised=await r.json();assert.equal(revised.report.sections[0].rows[0][2],'120.00');assert.equal(revised.report.sections[0].rows[0][5],'109.90');assert.notEqual(revised.sha256,original.sha256);
 });
 test('08E período de orçamento, ausência de projeto/sprint e datas inválidas não geram emissão',async()=>{
  const [before]=await rows<{n:number}>('SELECT COUNT(*) n FROM project_report_snapshots');for(const filter of [{type:'project_budget',projectId:id,from:today},{type:'gantt_schedule'},{type:'scrum_sprint',projectId:id},{type:'gantt_schedule',projectId:id,to:'2026-02-30'}])assert.equal((await api('/projects/reports/snapshots','POST',{companyId:'arqueoproject',filter})).status,400);assert.equal((await rows<{n:number}>('SELECT COUNT(*) n FROM project_report_snapshots'))[0].n,before.n);
  const r=await api('/projects/reports/sprint-options?companyId=arqueoproject&projectId='+id);assert.equal(r.status,200);assert.ok((await r.json()).every((s:any)=>s.id===sprint));
 });
}
