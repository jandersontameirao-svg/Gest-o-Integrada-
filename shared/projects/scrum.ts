import type {ProjectRecord} from './model.ts';
export type SprintObservation={id:string;sprintId:string;projectRevision:number;recordedAt:string;actorId:string;reason:string;totalPoints:number;remainingPoints:number;taskCount:number;doneCount:number};
export function sprintTotals(records:ProjectRecord[],id:string){
 const tasks=records.filter(r=>r.kind==='task'&&r.payload.sprintId===id);
 const points=(r:ProjectRecord)=>{const n=r.payload.storyPoints;if(typeof n!=='number'||!Number.isInteger(n)||n<0||n>10000)throw Error('Pontos inválidos; corrija a tarefa antes de iniciar.');return n;};
 const totalPoints=tasks.reduce((n,r)=>n+points(r),0),done=tasks.filter(r=>r.payload.status==='done');
 return {totalPoints,remainingPoints:totalPoints-done.reduce((n,r)=>n+points(r),0),taskCount:tasks.length,doneCount:done.length};
}
/** No interpolation, backfill or simulated actual values. Last persisted observation per UTC day. */
export function sprintBurndown(sprint:ProjectRecord,observations:SprintObservation[]){
 const start=String(sprint.payload.startDate),end=String(sprint.payload.endDate),day=86400000;
 const daysTotal=Math.round((Date.parse(end)-Date.parse(start))/day);
 if(!Number.isInteger(daysTotal)||daysTotal<0||daysTotal>366)throw Error('Sprint deve ter até 366 dias.');
 const ordered=[...observations].sort((a,b)=>a.projectRevision-b.projectRevision),baseline=ordered[0]??null;
 const last=ordered.at(-1),lastDate=last?.recordedAt.slice(0,10)??start;
 const lastDay=Math.max(daysTotal,Math.round((Date.parse(lastDate)-Date.parse(start))/day));
 if(lastDay>3660)throw Error('Período excede o limite de visualização; consulte o histórico.');
 const actual=new Map(ordered.map(o=>[o.recordedAt.slice(0,10),o]));
 const idealLine=Array.from({length:lastDay+1},(_,i)=>({day:i,date:new Date(Date.parse(start)+i*day).toISOString().slice(0,10),points:baseline?Math.round(baseline.totalPoints*(daysTotal===0?0:Math.max(0,1-i/daysTotal))*100)/100:null}));
 return {totalPoints:last?.totalPoints??null,remainingPoints:last?.remainingPoints??null,baselinePoints:baseline?.totalPoints??null,scopeChange:baseline&&last?last.totalPoints-baseline.totalPoints:null,daysTotal,daysElapsed:last?Math.max(0,Math.round((Date.parse(lastDate)-Date.parse(start))/day)):null,idealLine,actualLine:idealLine.map(d=>({day:d.day,points:actual.get(d.date)?.remainingPoints??null})),observations:ordered,limitation:baseline?'Dias sem observação permanecem vazios. Ideal é referência de planejamento, não execução.':'Sem observação histórica; nenhum valor real foi estimado.'};
}
export function assertTaskSprintMutable(records:ProjectRecord[],old:ProjectRecord|undefined,payload:Record<string,unknown>){
 for(const id of [old?.payload.sprintId,payload.sprintId])if(id&&records.some(r=>r.id===id&&r.kind==='sprint'&&r.payload.status==='completed'))throw Error('Sprint encerrada: reabertura explícita de diretor obrigatória, inclusive para retirar tarefas.');
}
