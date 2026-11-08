/** Port of the original gantt-engine calendar and routers.calculateCriticalPath passes.
 * Uses canonical GI IDs, inclusive dates, exact half-day capacities and all dependency edges.
 * No database/SDK calls; no inferred costs or resource levelling. */
import {assertGraph,type ProjectRecord} from './model.ts';
export type WorkCalendar={name:string;workingDays:number[];exceptions:{date:string;type:'HOLIDAY'|'WORKING_DAY'|'HALF_DAY';reason:string}[]};
export const defaultCalendar:WorkCalendar={name:'Dias corridos — padrão compatível',workingDays:[0,1,2,3,4,5,6],exceptions:[]};
const day=86400000,ordinal=(date:unknown)=>{if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw Error('Data de planejamento inválida.');return Date.parse(date)/day;},date=(n:number)=>new Date(n*day).toISOString().slice(0,10);
export function validateCalendar(v:unknown):WorkCalendar{
 if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Calendário inválido.');const d=v as Record<string,unknown>;
 if(Object.keys(d).some(k=>!['name','workingDays','exceptions'].includes(k))||typeof d.name!=='string'||!d.name.trim()||d.name.length>120)throw Error('Nome/campos do calendário inválidos.');
 if(!Array.isArray(d.workingDays)||!d.workingDays.length||d.workingDays.length>7||d.workingDays.some(x=>!Number.isInteger(x)||x<0||x>6)||new Set(d.workingDays).size!==d.workingDays.length)throw Error('Informe dias de trabalho únicos, entre 0 e 6.');
 if(!Array.isArray(d.exceptions)||d.exceptions.length>1000)throw Error('Até 1000 exceções por calendário.');
 const seen=new Set<string>(),exceptions=d.exceptions.map((v:unknown)=>{if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Exceção inválida.');const e=v as Record<string,unknown>;ordinal(e.date);if(Object.keys(e).some(k=>!['date','type','reason'].includes(k))||!['HOLIDAY','WORKING_DAY','HALF_DAY'].includes(String(e.type))||typeof e.reason!=='string'||!e.reason.trim()||e.reason.length>1000||seen.has(String(e.date)))throw Error('Exceção duplicada ou sem justificativa.');seen.add(String(e.date));return {date:String(e.date),type:e.type as WorkCalendar['exceptions'][number]['type'],reason:e.reason};});
 return {name:d.name.trim(),workingDays:[...d.workingDays].sort(),exceptions:exceptions.sort((a,b)=>a.date.localeCompare(b.date))};
}
export function taskEffort(record:ProjectRecord){if(record.payload.isMilestone===true)return 0;const effort=record.payload.durationDays??(ordinal(record.payload.endDate)-ordinal(record.payload.startDate)+1);if(typeof effort!=='number'||!Number.isFinite(effort)||effort<=0||effort>3660||!Number.isInteger(effort*2))throw Error('Duração deve ser de 0,5 a 3660 dias, em meios dias.');return effort;}
export function analyseSchedule(records:ProjectRecord[],input:WorkCalendar=defaultCalendar){
 const calendar=validateCalendar(input);const tasks=records.filter(r=>r.kind==='task'),deps=records.filter(r=>r.kind==='dependency');
 if(tasks.length>500||deps.length>2000)throw Error('Prévia limitada a 500 atividades e 2000 dependências; particione o planejamento.');assertGraph(records);
 if(!tasks.length)return {calendar,tasks:[],criticalPath:[] as string[],criticalEdges:[] as string[],changes:[] as {id:string;before:Record<string,unknown>;after:Record<string,unknown>}[],totalCalendarDays:0,startDate:null,endDate:null,limitations:['Sem tarefas para analisar.']};
 const parents=new Set(tasks.filter(t=>t.payload.parentTaskId).map(t=>String(t.payload.parentTaskId)));
 if(deps.some(d=>parents.has(String(d.payload.predecessorId))||parents.has(String(d.payload.successorId))))throw Error('Dependência em tarefa resumo exige revisão: vincule as atividades executáveis, sem dupla contagem.');
 const leaves=tasks.filter(t=>!parents.has(t.id));const base=Math.min(...leaves.map(t=>ordinal(t.payload.startDate))),top=base+36600;
 const exceptions=new Map(calendar.exceptions.map(e=>[ordinal(e.date),e.type])),capacity=Array.from({length:top-base+1},(_,i)=>{const d=base+i,e=exceptions.get(d);return e==='HOLIDAY'?0:e==='HALF_DAY'?1:e==='WORKING_DAY'?2:calendar.workingDays.includes(new Date(d*day).getUTCDay())?2:0;});
 const prefix=[0];for(const c of capacity)prefix.push(prefix.at(-1)!+c);
 function next(n:number){n=Math.max(base,n);while(n<=top&&!capacity[n-base])n++;if(n>top)throw Error('Planejamento excede horizonte técnico de 100 anos.');return n;}
 function previous(n:number){n=Math.min(top,n);while(n>=base&&!capacity[n-base])n--;if(n<base)throw Error('Restrição sem data de trabalho viável.');return n;}
 function first(lo:number,hi:number,predicate:(n:number)=>boolean){while(lo<hi){const mid=Math.floor((lo+hi)/2);if(predicate(mid))hi=mid;else lo=mid+1;}return lo;}
 function last(lo:number,hi:number,predicate:(n:number)=>boolean){let result=lo-1;while(lo<=hi){const mid=Math.floor((lo+hi)/2);if(predicate(mid)){result=mid;lo=mid+1;}else hi=mid-1;}return result;}
 const nodes=new Map(leaves.map(t=>{ordinal(t.payload.endDate);return [t.id,{record:t,durationDays:taskEffort(t),earlyStart:ordinal(t.payload.startDate),earlyFinish:0,lateStart:0,lateFinish:0,totalFloat:0,isCritical:false}];}));
 type Node=ReturnType<typeof nodes.get> & {};
 const normalize=(n:number,node:Node)=>node.durationDays===0?n:next(n);
 function finish(start:number,node:Node){if(start>top)return Infinity;if(node.durationDays===0)return start;start=next(start);const wanted=prefix[start-base]+node.durationDays*2;if(prefix.at(-1)!<wanted)return Infinity;return base+first(start-base,capacity.length-1,i=>prefix[i+1]>=wanted);}
 const incoming=new Map(leaves.map(t=>[t.id,deps.filter(d=>d.payload.successorId===t.id)])),outgoing=new Map(leaves.map(t=>[t.id,deps.filter(d=>d.payload.predecessorId===t.id)]));
 const degree=new Map(leaves.map(t=>[t.id,incoming.get(t.id)!.length])),queue=leaves.filter(t=>!degree.get(t.id)).map(t=>t.id),order:string[]=[];
 while(queue.length){const id=queue.shift()!;order.push(id);for(const edge of outgoing.get(id)!){const to=String(edge.payload.successorId);degree.set(to,degree.get(to)!-1);if(degree.get(to)===0)queue.push(to);}}
 if(order.length!==leaves.length)throw Error('Dependências cíclicas.');
 // Forward pass: all parallel dependency types/lag constraints are respected, not just find(first edge).
 for(const id of order){const n=nodes.get(id)!;let start=normalize(n.earlyStart,n);for(const d of incoming.get(id)!){const p=nodes.get(String(d.payload.predecessorId))!,lag=Number(d.payload.lagDays);if(!Number.isInteger(lag)||Math.abs(lag)>3650||!['FS','SS','FF','SF'].includes(String(d.payload.type)))throw Error('Dependência inválida.');
   if(d.payload.type==='FS')start=normalize(Math.max(start,p.earlyFinish+1+lag),n);
   else if(d.payload.type==='SS')start=normalize(Math.max(start,p.earlyStart+lag),n);
   else {const target=(d.payload.type==='FF'?p.earlyFinish:p.earlyStart)+lag;start=normalize(first(start,top,s=>finish(s,n)>=target),n);}
  }n.earlyStart=start;n.earlyFinish=finish(start,n);if(!Number.isFinite(n.earlyFinish))throw Error('Planejamento excede horizonte técnico de 100 anos.');
 }
 const horizon=Math.max(...[...nodes.values()].map(n=>n.earlyFinish));
 function latestFinish(bound:number,n:Node){const start=last(base,Math.min(top,bound),s=>finish(s,n)<=bound);if(start<base)throw Error('Dependências sem solução de planejamento.');return normalize(start,n);}
 // Backward pass: fixed horizon from this preview, integer dates; release dates are explicit floors.
 for(const id of [...order].reverse()){const n=nodes.get(id)!;let start=latestFinish(horizon,n);for(const d of outgoing.get(id)!){const s=nodes.get(String(d.payload.successorId))!,lag=Number(d.payload.lagDays);if(d.payload.type==='FS')start=Math.min(start,latestFinish(s.lateStart-1-lag,n));else if(d.payload.type==='SS')start=Math.min(start,n.durationDays===0?s.lateStart-lag:previous(s.lateStart-lag));else if(d.payload.type==='FF')start=Math.min(start,latestFinish(s.lateFinish-lag,n));else start=Math.min(start,n.durationDays===0?s.lateFinish-lag:previous(s.lateFinish-lag));}
  n.lateStart=start;n.lateFinish=finish(start,n);n.totalFloat=start-n.earlyStart;if(n.totalFloat<0)throw Error('Restrições de datas inconsistentes.');n.isCritical=n.totalFloat===0;
 }
 const result=tasks.map(t=>({...t,payload:{...t.payload}}));for(const n of nodes.values()){const r=result.find(t=>t.id===n.record.id)!;Object.assign(r.payload,{startDate:date(n.earlyStart),endDate:date(n.earlyFinish),durationDays:n.durationDays});}
 function rollup(id:string){const children=result.filter(t=>t.payload.parentTaskId===id);for(const child of children)if(parents.has(child.id))rollup(child.id);const parent=result.find(t=>t.id===id)!;parent.payload.startDate=date(Math.min(...children.map(t=>ordinal(t.payload.startDate))));parent.payload.endDate=date(Math.max(...children.map(t=>ordinal(t.payload.endDate))));}
 for(const t of result.filter(t=>parents.has(t.id)&&!t.payload.parentTaskId))rollup(t.id);
 const rows=[...nodes.values()].map(n=>({id:n.record.id,title:String(n.record.payload.title),durationDays:n.durationDays,earlyStart:date(n.earlyStart),earlyFinish:date(n.earlyFinish),lateStart:date(n.lateStart),lateFinish:date(n.lateFinish),totalFloat:n.totalFloat,isCritical:n.isCritical,releaseDate:String(n.record.payload.startDate)}));
 const criticalEdges=deps.filter(d=>{const a=nodes.get(String(d.payload.predecessorId))!,b=nodes.get(String(d.payload.successorId))!,lag=Number(d.payload.lagDays);return a.isCritical&&b.isCritical&&(d.payload.type==='FS'?b.earlyStart===normalize(a.earlyFinish+1+lag,b):d.payload.type==='SS'?b.earlyStart===normalize(a.earlyStart+lag,b):b.earlyStart===normalize(first(base,b.earlyStart,s=>finish(s,b)>=(d.payload.type==='FF'?a.earlyFinish:a.earlyStart)+lag),b));}).map(d=>d.id);
 return {calendar,tasks:rows,criticalPath:rows.filter(t=>t.isCritical).map(t=>t.id),criticalEdges,changes:result.filter(t=>JSON.stringify(t.payload)!==JSON.stringify(tasks.find(a=>a.id===t.id)!.payload)).map(t=>({id:t.id,before:tasks.find(a=>a.id===t.id)!.payload,after:t.payload})),startDate:date(base),endDate:date(horizon),totalCalendarDays:horizon-base+1,limitations:['Datas inclusivas; lag em dias corridos; duração em dias de capacidade de trabalho (meio dia permitido).','Folga medida em datas/dias corridos; sem precisão de horas, nivelamento de recursos ou calendário por profissional.','Data atual da tarefa é limite mínimo explícito da prévia. Resumos não duplicam duração; dependências em resumos são rejeitadas.','Análise de planejamento, não prazo contratual homologado nem autorização de custo.']};
}
