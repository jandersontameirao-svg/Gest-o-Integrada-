import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {pool,rows} from '../server/db.ts';
import {unzipSync,strFromU8} from 'fflate';
export function registerReportTests(base:()=>string,director:()=>Promise<string>,manager:()=>Promise<string>){
 let id='',foreign='',taskId='',reportId='',snapshot:any;
 const data={name:'Relatório sintético 08D',internalCode:'RPT-08D',description:'Dados fictícios',managerId:null,status:'planning',methodology:'kanban',priority:'medium',currency:'BRL',proposedValue:'0.00',decisionReason:'Diretor autoriza planejamento sintético'};
 async function api(path:string,method='GET',body?:Record<string,unknown>,token?:string){return fetch(base()+path,{method,headers:{Authorization:'Bearer '+(token??await director()),'Content-Type':'application/json'},...(body?{body:JSON.stringify({requestId:randomUUID(),...body})}:{})});}
 const filter={type:'project_progress',from:'2026-11-01',to:'2026-11-30'};
 const state=async()=>{const r=await api('/projects/'+id);assert.equal(r.status,200);return r.json();};
 test('08D relatório gera snapshot real, filtros e revisões, com concorrência idempotente',async()=>{
  for(const companyId of ['arqueoproject','arqueocean']){const r=await api('/projects','POST',{companyId,explicitDirectorDecision:true,data});assert.equal(r.status,201);if(companyId==='arqueoproject')id=(await r.json()).id;else foreign=(await r.json()).id;}
  const s=await state(),r=await api('/projects/'+id+'/records/task','POST',{revision:s.project.revision,data:{title:'Atividade sintética relatório',description:'',status:'todo',priority:'medium',startDate:'2026-11-09',endDate:'2026-11-09',progress:0}});assert.equal(r.status,200);taskId=(await r.json()).id;
  const body={companyId:'arqueoproject',filter:{...filter,projectId:id},requestId:randomUUID()},responses=await Promise.all([api('/projects/reports/snapshots','POST',body),api('/projects/reports/snapshots','POST',body)]);for(const r of responses)assert.equal(r.status,201,await r.clone().text());const a=await responses[0].json(),b=await responses[1].json();assert.deepEqual(a,b);reportId=a.id;snapshot=a;assert.equal(a.report.rows[0][10],'0');assert.equal(a.report.summary.tasks,1);assert.equal((await rows('SELECT id FROM project_report_snapshots WHERE id=?',[reportId])).length,1);
 });
 test('08D recarrega snapshot/checksum normalizado pelo MySQL, edição não reescreve emissão antiga',async()=>{
  let r=await api('/projects/reports/snapshots/'+reportId);assert.equal(r.status,200,await r.clone().text());assert.deepEqual(await r.json(),snapshot);const s=await state(),t=s.records.find((r:any)=>r.id===taskId);r=await api('/projects/'+id+'/records/task','POST',{revision:s.project.revision,id:taskId,recordRevision:t.revision,data:{...t.payload,title:'Título revisado sintético'}});assert.equal(r.status,200);r=await api('/projects/reports/snapshots/'+reportId);assert.deepEqual(await r.json(),snapshot);
  r=await api('/projects/reports/snapshots','POST',{companyId:'arqueoproject',filter:{...filter,projectId:id}});assert.equal(r.status,201);const latest=await r.json();assert.notEqual(latest.sha256,snapshot.sha256);assert.equal(latest.report.rows[0][4],'Título revisado sintético');assert.equal(latest.report.sources[0].revision,snapshot.report.sources[0].revision+1);
 });
 test('08D PDF, CSV, XLSX e JSON são arquivos reais do mesmo snapshot; downloads auditados',async()=>{
  for(const format of ['pdf','csv','xlsx','json']){const r=await api('/projects/reports/snapshots/'+reportId+'?format='+format);assert.equal(r.status,200,await r.clone().text());assert.equal(r.headers.get('x-report-sha256'),snapshot.sha256);assert.equal(r.headers.get('cache-control'),'no-store');const bytes=Buffer.from(await r.arrayBuffer());if(format==='pdf')assert.equal(bytes.subarray(0,5).toString(),'%PDF-');if(format==='xlsx')assert.ok(strFromU8(unzipSync(bytes)['xl/worksheets/sheet1.xml']).includes('Atividade sintética relatório'));if(format==='csv')assert.ok(bytes.toString().includes('Atividade sintética relatório'));if(format==='json')assert.deepEqual(JSON.parse(bytes.toString()),snapshot);}
  assert.ok((await rows('SELECT id FROM audit_events WHERE company_id=? AND action="report.download.pdf"',['arqueoproject'])).length>0);
 });
 test('08D escopos, IDs adulterados, UTU/Vinho e exportação revogada negam criação e download',async()=>{
  const token=await manager();assert.equal((await api('/projects/reports/snapshots','POST',{companyId:'arqueoproject',filter:{...filter,projectId:foreign}},token)).status,403);assert.equal((await api('/projects/reports/history?companyId=arqueocean','GET',undefined,token)).status,403);
  for(const companyId of ['utu','vinho-24'])assert.equal((await api('/projects/reports/snapshots','POST',{companyId,filter})).status,403);
  assert.equal((await api('/projects/reports/snapshots/forged')).status,400);assert.equal((await api('/projects/reports/snapshots/'+reportId+'?format=html')).status,400);
  const [u]=await rows<{id:string}>('SELECT id FROM users WHERE email="holding@example.test"');await pool.execute('INSERT INTO scope_grants VALUES (?,?,?,?,?)',[u.id,'scope-company:arqueoproject','projects','export','deny']);try{assert.equal((await api('/projects/reports/snapshots/'+reportId)).status,403);}finally{await pool.execute('DELETE FROM scope_grants WHERE user_id=? AND scope_id=? AND module_id=? AND action=?',[u.id,'scope-company:arqueoproject','projects','export']);}
 });
 test('08D todas famílias e vazio aplicam filtros; emissão falha não grava nem registra sucesso',async()=>{
  for(const type of ['project_progress','tasks_summary','executive_summary','company_overview']){const r=await api('/projects/reports/snapshots','POST',{companyId:'arqueoproject',filter:{type,projectId:id,from:'2099-01-01',to:'2099-12-31'}});assert.equal(r.status,201);const s=await r.json();assert.equal(s.report.summary.tasks,0);assert.equal(s.report.summary.completionPercent,null);}
  assert.equal((await api('/projects/reports/snapshots','POST',{companyId:'arqueoproject',filter:{...filter,from:'2026-02-30'}})).status,400);const r=await api('/projects/reports/history?companyId=arqueoproject');assert.equal(r.status,200);assert.ok((await r.json()).some((v:any)=>v.id===reportId));
 });
}
