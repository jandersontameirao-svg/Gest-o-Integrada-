import {randomUUID} from 'node:crypto';
import type {PoolConnection} from 'mysql2/promise';
import type {Router} from 'express';
import type {Principal} from '../../shared/catalog.ts';
import type {Project,ProjectRecord} from '../../shared/projects/model.ts';
import {sprintTotals,sprintBurndown,type SprintObservation} from '../../shared/projects/scrum.ts';
import {pool,rows} from '../db.ts';
import {HttpError} from '../policy.ts';
import {uuid,text} from '../contracts/validation.ts';
import {project,records,write,cas,bump,history,access,director} from './router.ts';
export async function observeSprints(c:PoolConnection,p:Project,u:Principal,list:ProjectRecord[],ids:string[],reason:string){
 for(const id of new Set(ids)){
  const sprint=list.find(r=>r.id===id&&r.kind==='sprint');if(!sprint||!['active','completed'].includes(String(sprint.payload.status)))continue;
  const totals=sprintTotals(list,id);
  await c.execute('INSERT INTO project_sprint_observations(id,project_id,sprint_id,project_revision,actor_id,recorded_at,reason,total_points,remaining_points,task_count,done_count) VALUES (?,?,?,?,?,UTC_TIMESTAMP(6),?,?,?,?,?)',[randomUUID(),p.id,id,p.revision,u.id,reason,totals.totalPoints,totals.remainingPoints,totals.taskCount,totals.doneCount]);
 }
}
async function observations(projectId:string,sprintId:string,c?:PoolConnection){
 return rows<SprintObservation>('SELECT id,sprint_id sprintId,project_revision projectRevision,actor_id actorId,DATE_FORMAT(recorded_at,"%Y-%m-%dT%H:%i:%s.%fZ") recordedAt,reason,total_points totalPoints,remaining_points remainingPoints,task_count taskCount,done_count doneCount FROM project_sprint_observations WHERE project_id=? AND sprint_id=? ORDER BY project_revision',[projectId,sprintId],c);
}
export function registerScrum(router:Router){
 router.get('/:id/scrum/:sprintId',async(req,res)=>{
  const c=await pool.getConnection();
  try{
   await c.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');await c.beginTransaction();
   const p=await project(req.params.id,res.locals.user,'read',c,true),id=uuid(req.params.sprintId),sprint=(await records(p.id,c)).find(r=>r.id===id&&r.kind==='sprint');
   if(!sprint)throw new HttpError(404,'Sprint não pertence ao projeto.');
   if(req.query.export==='json')await access(res.locals.user,p.companyId,'export',c);
   const data=sprintBurndown(sprint,await observations(p.id,id,c));
   await c.execute('INSERT INTO audit_events(id,actor_id,company_id,module_id,action,outcome) VALUES (?,?,?,?,?,?)',[randomUUID(),res.locals.user.id,p.companyId,'projects',req.query.export==='json'?'scrum.export':'scrum.read','allowed']);
   await c.commit();
   if(req.query.export==='json')res.setHeader('Content-Disposition','attachment; filename="sprint-historico.json"');
   res.json({projectId:p.id,companyId:p.companyId,projectRevision:p.revision,sprint,...data});
  }catch(e){await c.rollback();throw e;}finally{c.release();}
 });
 router.post('/:id/scrum/:sprintId/:action',async(req,res)=>{
  const u=res.locals.user as Principal,p=await project(req.params.id,u,'edit'),id=uuid(req.params.sprintId),action=String(req.params.action);
  if(!['start','complete','reopen'].includes(action))throw new HttpError(404,'Ação Scrum inexistente.');
  res.json(await write(req,u,p.companyId,'edit',async(c,b)=>{
   const current=await project(p.id,u,'edit',c,true);cas(b,current);
   const list=await records(p.id,c),sprint=list.find(r=>r.id===id&&r.kind==='sprint');if(!sprint)throw new HttpError(404,'Sprint não pertence ao projeto.');
   if(b.recordRevision!==sprint.revision)throw new HttpError(409,'Sprint alterada; recarregue.');
   const reason=text(b.reason,3000),before={...sprint,payload:{...sprint.payload}},status=sprint.payload.status,now=new Date().toISOString(),today=now.slice(0,10);
   if(action==='start'){
    if(status!=='planned')throw new HttpError(409,'Somente sprint planejada pode iniciar.');
    if(today<String(sprint.payload.startDate)||today>String(sprint.payload.endDate))throw new HttpError(409,'Ajuste o planejamento: início deve ocorrer dentro das datas planejadas.');
    if(Date.parse(String(sprint.payload.endDate))-Date.parse(String(sprint.payload.startDate))>366*86400000)throw new HttpError(409,'Sprint deve ter até 366 dias.');
    sprint.payload={...sprint.payload,status:'active',startedAt:now};
   }else if(action==='complete'){
    await access(u,p.companyId,'approve',c);if(status!=='active')throw new HttpError(409,'Somente sprint ativa pode encerrar.');
    const totals=sprintTotals(list,id);if(totals.taskCount!==totals.doneCount&&b.acceptIncomplete!==true)throw new HttpError(409,'Tarefas pendentes: decisão explícita de encerramento incompleto obrigatória.');
    sprint.payload={...sprint.payload,status:'completed',completedAt:now,closureReason:reason,incompleteAccepted:totals.taskCount!==totals.doneCount};
   }else{
    await director(u,c);await access(u,p.companyId,'reopen',c);if(status!=='completed')throw new HttpError(409,'Somente sprint encerrada pode reabrir.');
    sprint.payload={...sprint.payload,status:'active',reopenedAt:now,reopeningReason:reason};
   }
   if(action!=='complete'&&list.some(r=>r.kind==='sprint'&&r.id!==id&&r.payload.status==='active'))throw new HttpError(409,'Já existe sprint ativa no projeto.');
   sprint.revision++;await c.execute('UPDATE operational_project_records SET payload=?,revision=? WHERE id=? AND project_id=?',[JSON.stringify(sprint.payload),sprint.revision,id,p.id]);
   await bump(c,current);await history(c,current,u,'scrum.'+action,before,{...sprint,reason});await observeSprints(c,current,u,list,[id],'scrum.'+action);
   return {id,revision:current.revision,recordRevision:sprint.revision,financialCommitment:false};
  },async c=>{if(action==='complete')await access(u,p.companyId,'approve',c);if(action==='reopen'){await director(u,c);await access(u,p.companyId,'reopen',c);}}));
 });
}
