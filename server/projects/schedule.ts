import type {Router} from 'express';
import type {PoolConnection} from 'mysql2/promise';
import {createHash,randomUUID} from 'node:crypto';
import {pool,rows} from '../db.ts';
import {HttpError} from '../policy.ts';
import {text} from '../contracts/validation.ts';
import {analyseSchedule,validateCalendar,defaultCalendar,type WorkCalendar} from '../../shared/projects/schedule.ts';
import {project,records,write,cas,bump,history,access} from './router.ts';
export async function workCalendar(id:string,c:PoolConnection|typeof pool=pool){const [r]=await rows<{revision:number;payload:unknown}>('SELECT revision,payload FROM project_work_calendars WHERE project_id=?',[id],c);return {revision:r?.revision??0,calendar:r?validateCalendar(typeof r.payload==='string'?JSON.parse(r.payload):r.payload):defaultCalendar,configured:!!r};}
export function previewHash(revision:number,calendarRevision:number,analysis:ReturnType<typeof analyseSchedule>){return createHash('sha256').update(JSON.stringify({revision,calendarRevision,analysis})).digest('hex');}
function analyse(list:Awaited<ReturnType<typeof records>>,calendar:WorkCalendar){try{return analyseSchedule(list,calendar);}catch(e){throw new HttpError(409,(e as Error).message);}}
export function registerSchedule(router:Router){
 router.get('/:id/schedule',async(req,res)=>{
  const c=await pool.getConnection();try{await c.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');await c.beginTransaction();const p=await project(req.params.id,res.locals.user,'read',c,true),config=await workCalendar(p.id,c);if(req.query.export==='json')await access(res.locals.user,p.companyId,'export',c);
   const analysis=analyse(await records(p.id,c),config.calendar),hash=previewHash(p.revision,config.revision,analysis);
   await c.execute('INSERT INTO audit_events(id,actor_id,company_id,module_id,action,outcome) VALUES (?,?,?,?,?,?)',[randomUUID(),res.locals.user.id,p.companyId,'projects',req.query.export==='json'?'schedule.export':'schedule.preview','allowed']);await c.commit();
   if(req.query.export==='json')res.setHeader('Content-Disposition','attachment; filename="planejamento-calendario.json"');res.json({projectId:p.id,companyId:p.companyId,projectRevision:p.revision,config,analysis,previewHash:hash});
  }catch(e){await c.rollback();throw e;}finally{c.release();}
 });
 router.post('/:id/schedule/calendar',async(req,res)=>{const u=res.locals.user,p=await project(req.params.id,u,'approve');res.json(await write(req,u,p.companyId,'approve',async(c,b)=>{
  const current=await project(p.id,u,'approve',c,true);cas(b,current);const before=await workCalendar(p.id,c);if(b.calendarRevision!==before.revision)throw new HttpError(409,'Calendário alterado; recarregue.');let calendar:WorkCalendar;try{calendar=validateCalendar(b.calendar);}catch(e){throw new HttpError(400,(e as Error).message);}const reason=text(b.reason,3000);
  await c.execute('INSERT INTO project_work_calendars(project_id,revision,payload,actor_id,updated_at) VALUES (?,?,?,?,UTC_TIMESTAMP(6)) ON DUPLICATE KEY UPDATE revision=VALUES(revision),payload=VALUES(payload),actor_id=VALUES(actor_id),updated_at=UTC_TIMESTAMP(6)',[p.id,before.revision+1,JSON.stringify(calendar),u.id]);await bump(c,current);await history(c,current,u,'calendar.configure',before,{calendar,calendarRevision:before.revision+1,reason});return {revision:current.revision,calendarRevision:before.revision+1,scheduleChanged:false};
 }));});
 router.post('/:id/schedule/apply',async(req,res)=>{const u=res.locals.user,p=await project(req.params.id,u,'edit');res.json(await write(req,u,p.companyId,'edit',async(c,b)=>{
  const current=await project(p.id,u,'edit',c,true);cas(b,current);const config=await workCalendar(p.id,c);if(b.calendarRevision!==config.revision)throw new HttpError(409,'Calendário alterado; gere nova prévia.');if(b.confirmed!==true)throw new HttpError(400,'Confirmação humana da prévia obrigatória.');const reason=text(b.reason,3000),list=await records(p.id,c),analysis=analyse(list,config.calendar);
  if(b.previewHash!==previewHash(current.revision,config.revision,analysis))throw new HttpError(409,'Prévia desatualizada; nenhuma alteração gravada.');
  for(const change of analysis.changes){const old=list.find(r=>r.id===change.id)!;if(list.some(r=>r.kind==='sprint'&&r.id===old.payload.sprintId&&r.payload.status==='completed'))throw new HttpError(409,'Prévia altera sprint encerrada; reabertura explícita necessária.');}
  if(analysis.changes.length){for(const change of analysis.changes)await c.execute('UPDATE operational_project_records SET payload=?,revision=revision+1 WHERE id=? AND project_id=?',[JSON.stringify(change.after),change.id,p.id]);await bump(c,current);await history(c,current,u,'schedule.calendar.apply',{calendarRevision:config.revision,previewHash:b.previewHash,changes:analysis.changes.map(x=>({id:x.id,before:x.before}))},{reason,changes:analysis.changes.map(x=>({id:x.id,after:x.after})),financialCommitment:false});}
  return {revision:current.revision,calendarRevision:config.revision,changed:analysis.changes.length,financialCommitment:false};
 }));});
}
