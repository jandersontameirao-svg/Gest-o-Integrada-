import {buildSpecialReport,type BudgetRevision,type SpecializedData} from '../../shared/projects/special-reports.ts';
import {workCalendar} from './schedule.ts';
import {observations} from './scrum.ts';
import {projectSupplierCostSnapshot} from '../suppliers/project-costs.ts';
import {randomUUID,createHash} from 'node:crypto';
import type {Router} from 'express';
import type {PoolConnection} from 'mysql2/promise';
import {jsPDF} from 'jspdf';
import {drawReportVisual} from './report-visuals.ts';
import {autoTable} from 'jspdf-autotable';
import {pool,rows} from '../db.ts';
import {HttpError} from '../policy.ts';
import {text,uuid,obj} from '../contracts/validation.ts';
import {project,records,access,write} from './router.ts';
import {canonicalReport,reportFilter,buildProjectReport,reportTable,reportCsv,type ProjectReport,type ReportSource} from '../../shared/projects/reports.ts';
import {exportXlsx} from '../finance/export-files.ts';
import type {Principal} from '../../shared/catalog.ts';
const json=JSON.stringify,hash=(v:unknown)=>createHash('sha256').update(canonicalReport(v)).digest('hex'),decode=(v:unknown)=>typeof v==='string'?JSON.parse(v):v;
async function audit(c:PoolConnection,u:Principal,company:string,action:string){await c.execute('INSERT INTO audit_events(id,actor_id,company_id,module_id,action,outcome) VALUES (?,?,?,?,?,?)',[randomUUID(),u.id,company,'projects',action,'allowed']);}
async function saved(id:unknown,u:Principal,c:PoolConnection){const [s]=await rows<{id:string;companyId:string;payload:unknown;sha256:string}>('SELECT id,company_id companyId,payload,sha256 FROM project_report_snapshots WHERE id=?',[uuid(id)],c);if(!s)throw new HttpError(404,'Relatório inexistente.');await access(u,s.companyId,'read',c);await access(u,s.companyId,'export',c);const report=decode(s.payload) as ProjectReport;if(hash(report)!==s.sha256||report.companyId!==s.companyId)throw new HttpError(409,'Checksum ou escopo do relatório divergente.');for(const source of report.sources){const p=await project(source.projectId,u,'export',c);if(p.companyId!==s.companyId)throw new HttpError(403,'Proveniência fora do escopo.');}return {id:s.id,sha256:s.sha256,report};}
// Table structure and jsPDF/autoTable export adapted from source client/src/lib/export-utils.ts.
function pdf(report:ProjectReport,id:string,sha256:string){const doc=new jsPDF({orientation:'landscape'});doc.setFontSize(15);doc.text('Grupo Arqueo - '+report.title,14,15);doc.setFontSize(9);doc.text(doc.splitTextToSize(report.companyName+' | '+report.generatedAt+' | '+id,265),14,23);autoTable(doc,{startY:34,head:[report.columns],body:report.rows,styles:{fontSize:7},headStyles:{fillColor:[139,21,56]},margin:{bottom:17},didDrawPage:({pageNumber})=>{doc.setFontSize(7);doc.text('Snapshot '+id+' | página '+pageNumber,14,201);}});for(const section of report.sections??[]){doc.addPage();doc.setFontSize(12);doc.text(doc.splitTextToSize(section.title,260),14,15);autoTable(doc,{startY:30,head:[section.columns],body:section.rows,styles:{fontSize:7},headStyles:{fillColor:[36,84,129]}});}drawReportVisual(doc,report);doc.addPage();doc.setFontSize(10);const details=reportTable(report).filter(r=>r[0]==='Limitação'||r[0]==='Proveniência');autoTable(doc,{startY:15,head:[['Metadados','Detalhes']],body:[['SHA-256',sha256],['Resumo',json(report.summary)],['Filtros',json(report.filter)],...Object.entries(report.metadata??{}).filter(([,v])=>v===null||typeof v!=='object').map(([k,v])=>[k,String(v??'Não disponível')]),...details.map(r=>[r[0],r.slice(1).join(' | ')])],styles:{fontSize:8}});return Buffer.from(doc.output('arraybuffer'));}
export function registerReports(router:Router){
 router.get('/reports/sprint-options',async(req,res)=>{const c=await pool.getConnection();try{await c.beginTransaction();const company=text(req.query.companyId,40),p=await project(req.query.projectId,res.locals.user,'export',c,true);if(p.companyId!==company)throw new HttpError(403,'Projeto de outra empresa.');const list=(await records(p.id,c)).filter(r=>r.kind==='sprint').map(r=>({id:r.id,title:String(r.payload.title),status:String(r.payload.status),revision:r.revision}));await c.commit();res.set('Cache-Control','no-store').json(list);}catch(e){await c.rollback();throw e;}finally{c.release();}});
 router.post('/reports/snapshots',async(req,res)=>{const b=obj(req.body),company=text(b.companyId,40);let filter:ReturnType<typeof reportFilter>;try{filter=reportFilter(b.filter);}catch(e){throw new HttpError(400,(e as Error).message);}res.status(201).json(await write(req,res.locals.user,company,'export',async c=>{
  const u=res.locals.user as Principal;await access(u,company,'read',c);
  const ids=filter.projectId?[{id:filter.projectId}]:await rows<{id:string}>('SELECT id FROM operational_projects WHERE company_id=? ORDER BY id LIMIT 101',[company],c);
  if(ids.length>100)throw new HttpError(400,'Selecione um projeto: limite de 100 projetos por relatório.');
  const source:ReportSource[]=[];let count=0;for(const {id} of ids){const p=await project(id,u,'export',c,true);if(p.companyId!==company)throw new HttpError(403,'Projeto de outra empresa.');const all=await records(id,c);count+=all.length;if(count>5000)throw new HttpError(400,'Selecione um projeto: limite de 5000 registros por relatório.');source.push({project:p,records:all});}
  const [co]=await rows<{name:string}>('SELECT name FROM companies WHERE id=?',[company],c);const people=await rows<{id:string;name:string}>('SELECT DISTINCT u.id,u.name FROM users u JOIN memberships m ON m.user_id=u.id WHERE u.active=1 AND (m.company_id=? OR m.corporate=1)',[company],c);
  const specialized=['gantt_schedule','scrum_sprint','project_budget'].includes(filter.type),data:SpecializedData={},labels=Object.fromEntries(people.map(p=>[p.id,p.name]));
  if(specialized){
   if(source.length!==1)throw new HttpError(400,'Selecione exatamente um projeto.');
   const id=source[0].project.id;
   if(filter.type==='gantt_schedule')data.calendar=await workCalendar(id,c);
   if(filter.type==='scrum_sprint')data.observations=await observations(id,filter.sprintId!,c);
   if(filter.type==='project_budget'){
    data.budgets=(await rows<BudgetRevision>('SELECT kind,allocations,total,project_revision,currency,reason,actor_id actorId,DATE_FORMAT(created_at,"%Y-%m-%dT%H:%i:%s.%fZ") createdAt FROM operational_project_budgets WHERE project_id=? ORDER BY project_revision LIMIT 1001',[id],c)).map(b=>({...b,allocations:decode(b.allocations)}));
    if(data.budgets.length>1000)throw new HttpError(400,'Limite de 1000 revisões orçamentárias por relatório.');
    try{Object.assign(data,await projectSupplierCostSnapshot(id,c));}catch(e){throw new HttpError(400,(e as Error).message);}
   }
  }
  let report:ProjectReport;try{report=specialized?buildSpecialReport(company,co.name,source[0],filter,new Date().toISOString(),data,labels):buildProjectReport(company,co.name,source,filter,new Date().toISOString(),labels);}catch(e){throw new HttpError(400,(e as Error).message);}
  if(reportTable(report).length>10000)throw new HttpError(400,'Relatório excede 10000 linhas com seções; reduza o intervalo ou o acervo.');
  const id=randomUUID(),sha256=hash(report);
  await c.execute('INSERT INTO project_report_snapshots(id,company_id,actor_id,report_type,payload,sha256) VALUES (?,?,?,?,?,?)',[id,company,u.id,filter.type,json(report),sha256]);await audit(c,u,company,'report.snapshot.create');await audit(c,u,company,'report.snapshot:'+id);return {id,sha256,report};
 },async c=>{await access(res.locals.user,company,'read',c);if(filter.projectId){const p=await project(filter.projectId,res.locals.user,'export',c,true);if(p.companyId!==company)throw new HttpError(403,'Projeto de outra empresa.');}}));});
 router.get('/reports/history',async(req,res)=>{const company=text(req.query.companyId,40),c=await pool.getConnection();try{await c.beginTransaction();await access(res.locals.user,company,'read',c);await access(res.locals.user,company,'export',c);const history=await rows('SELECT id,report_type reportType,sha256,created_at createdAt FROM project_report_snapshots WHERE company_id=? ORDER BY created_at DESC,id LIMIT 50',[company],c);await audit(c,res.locals.user,company,'report.history.read');await c.commit();res.json(history);}catch(e){await c.rollback();throw e;}finally{c.release();}});
 router.get('/reports/snapshots/:reportId',async(req,res)=>{const format=String(req.query.format??'json');if(!['json','pdf','csv','xlsx'].includes(format))throw new HttpError(400,'Formato inválido.');const c=await pool.getConnection();let s:Awaited<ReturnType<typeof saved>>;try{await c.beginTransaction();s=await saved(req.params.reportId,res.locals.user,c);await audit(c,res.locals.user,s.report.companyId,'report.download.'+format);await audit(c,res.locals.user,s.report.companyId,'report.file:'+s.id+':'+format);await c.commit();}catch(e){await c.rollback();throw e;}finally{c.release();}res.set('Cache-Control','no-store').set('X-Report-SHA256',s.sha256);const filename='projetos-'+s.id+'.'+format;if(format==='json')res.attachment(filename).json(s);else if(format==='csv')res.type('text/csv; charset=utf-8').attachment(filename).send(reportCsv(reportTable(s.report)));else if(format==='xlsx')res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').attachment(filename).send(exportXlsx(reportTable(s.report)));else res.type('application/pdf').attachment(filename).send(pdf(s.report,s.id,s.sha256));});
}
