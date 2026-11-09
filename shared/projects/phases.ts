import type {Project,ProjectRecord} from './model.ts';
export type PhaseSummary={projectId:string;projectName:string;phaseId:string|null;phaseName:string;phaseRevision:number|null;todo:number;inProgress:number;review:number;done:number;total:number};
/** Counts executable leaves exactly once. No physical-progress averaging or inferred actuals. */
export function summarizePhases(project:Project,records:ProjectRecord[],from:string|null,to:string|null):PhaseSummary[]{
 const tasks=records.filter(r=>r.kind==='task'),parents=new Set(tasks.map(r=>r.payload.parentTaskId).filter(Boolean)),phases=records.filter(r=>r.kind==='phase');
 const ids=new Set<string|null>([...phases.map(p=>p.id),...tasks.map(t=>t.payload.phaseId?String(t.payload.phaseId):null)]);
 return [...ids].sort((a,b)=>(a??'').localeCompare(b??'')).map(id=>{const phase=phases.find(p=>p.id===id),leaves=tasks.filter(t=>!parents.has(t.id)&&(t.payload.phaseId?String(t.payload.phaseId):null)===id&&(!from||String(t.payload.endDate)>=from)&&(!to||String(t.payload.startDate)<=to));
  if(leaves.some(t=>!['todo','in_progress','review','done'].includes(String(t.payload.status))))throw Error('Estado de atividade não reconhecido; corrija a fonte antes de consolidar.');
  return {projectId:project.id,projectName:project.payload.name,phaseId:id,phaseName:phase?String(phase.payload.title):id?'Fase indisponível (origem preservada)':'Sem fase',phaseRevision:phase?.revision??null,todo:leaves.filter(t=>t.payload.status==='todo').length,inProgress:leaves.filter(t=>t.payload.status==='in_progress').length,review:leaves.filter(t=>t.payload.status==='review').length,done:leaves.filter(t=>t.payload.status==='done').length,total:leaves.length};
 });
}
export function phaseSection(phases:PhaseSummary[]){return {title:'Execução por fase — atividades folha',columns:['Projeto','ID fase','Fase','A fazer','Em andamento','Em revisão','Concluídas','Total','Revisão fase'],rows:phases.map(p=>[p.projectName,p.phaseId??'',p.phaseName,String(p.todo),String(p.inProgress),String(p.review),String(p.done),String(p.total),p.phaseRevision===null?'Não disponível':String(p.phaseRevision)])};}
