/** Adapted from original exportGanttToPDF / exportSprintReportToPDF.
 * Uses the GI calendar, observed burndown and canonical budget rules. No IO or estimates of actuals. */
import {budgetSummary,type ProjectRecord} from './model.ts';
import {analyseSchedule,type WorkCalendar} from './schedule.ts';
import {sprintBurndown,type SprintObservation} from './scrum.ts';
import {buildProjectReport,reportTypes,type ReportFilter,type ReportSource,type ProjectReport} from './reports.ts';
import {cents,amount} from '../contracts/model.ts';
export type BudgetRevision={kind:string;allocations:Record<string,string>;total:string;project_revision:number;currency:string;reason:string;actorId:string;createdAt:string};
export type SupplierCost={taskId:string;orderId:string;committed:string;realized:string};
export type SpecializedData={calendar?:{revision:number;calendar:WorkCalendar};observations?:SprintObservation[];budgets?:BudgetRevision[];costs?:SupplierCost[];orderSources?:{id:string;revision:number;currency:string;status:string}[]};
const str=(v:unknown)=>v===null||v===undefined?'Não disponível':String(v);
const inPeriod=(start:string,end:string,f:ReportFilter)=>(!f.from||end>=f.from)&&(!f.to||start<=f.to);
export function buildSpecialReport(companyId:string,companyName:string,source:ReportSource,filter:ReportFilter,generatedAt:string,data:SpecializedData,labels:Record<string,string>={}):ProjectReport{
 if(source.project.companyId!==companyId||filter.projectId!==source.project.id)throw Error('Projeto fora do escopo do relatório.');
 const p=source.project,all=source.records,tasks=all.filter(r=>r.kind==='task');
 const base=buildProjectReport(companyId,companyName,[source],{...filter,type:'tasks_summary'},generatedAt,labels);
 const report:ProjectReport={...base,title:reportTypes.find(t=>t.id===filter.type)!.title,filter,limitations:[],sections:[],metadata:{projectId:p.id,projectRevision:p.revision,currency:p.payload.currency}};
 report.sources[0].recordRevisions=all.map(r=>({id:r.id,revision:r.revision}));
 if(filter.type==='gantt_schedule'){
  if(!data.calendar)throw Error('Calendário canônico indisponível.');
  const analysis=analyseSchedule(all,data.calendar.calendar),selected=tasks.filter(t=>inPeriod(String(t.payload.startDate),String(t.payload.endDate),filter)),ids=new Set(selected.map(t=>t.id));
  report.columns=['ID atividade','Atividade','Fase','Início planejado','Fim planejado','Progresso declarado (%)','Esforço (dias)','Início CPM','Fim CPM','Folga (dias corridos)','Crítica','Revisão'];
  report.rows=selected.map(t=>{const a=analysis.tasks.find(a=>a.id===t.id),phase=all.find(r=>r.kind==='phase'&&r.id===t.payload.phaseId);return [t.id,str(t.payload.title),phase?str(phase.payload.title):'Sem fase',str(t.payload.startDate),str(t.payload.endDate),str(t.payload.progress),a?str(a.durationDays):'Resumo',a?.earlyStart??'Resumo',a?.earlyFinish??'Resumo',a?str(a.totalFloat):'Resumo',a?(a.isCritical?'Sim':'Não'):'Resumo',str(t.revision)];});
  report.sections!.push({title:'Dependências entre atividades exibidas',columns:['ID','Predecessora','Sucessora','Tipo','Lag (dias corridos)','Revisão'],rows:all.filter(r=>r.kind==='dependency'&&ids.has(String(r.payload.predecessorId))&&ids.has(String(r.payload.successorId))).map(r=>[r.id,str(r.payload.predecessorId),str(r.payload.successorId),str(r.payload.type),str(r.payload.lagDays),str(r.revision)])});
  const parents=new Set(tasks.map(t=>t.payload.parentTaskId));
  report.sections!.push({title:'Fases — contagem de atividades folha no período',columns:['ID fase','Fase','Atividades folha','Concluídas'],rows:[...all.filter(r=>r.kind==='phase').map(r=>({id:r.id,title:str(r.payload.title)})),{id:'',title:'Sem fase'}].map(phase=>{const leaves=selected.filter(t=>!parents.has(t.id)&&String(t.payload.phaseId??'')===phase.id);return [phase.id,phase.title,str(leaves.length),str(leaves.filter(t=>t.payload.status==='done').length)];})});
  report.visual={kind:'gantt',bars:selected.map(t=>({id:t.id,label:str(t.payload.title),start:str(t.payload.startDate),end:str(t.payload.endDate),progress:Number(t.payload.progress),critical:analysis.criticalPath.includes(t.id)}))};
  report.metadata={...report.metadata,calendarRevision:data.calendar.revision,calendar:analysis.calendar,criticalPath:analysis.criticalPath,criticalEdges:analysis.criticalEdges};
  report.limitations=[...analysis.limitations,'Barras mostram datas planejadas persistidas; colunas CPM são prévia calculada no grafo completo e não alteram o projeto.','Período seleciona sobreposição das datas planejadas; dependências fora da seleção continuam influenciando o CPM, mas não aparecem na seção de arestas.','Progresso é declarado na atividade; não é avanço físico ponderado nem execução inferida.'];
 }else if(filter.type==='scrum_sprint'){
  const sprint=all.find(r=>r.kind==='sprint'&&r.id===filter.sprintId);if(!sprint)throw Error('Sprint não pertence ao projeto.');
  if(!data.observations||data.observations.some(o=>o.sprintId!==sprint.id))throw Error('Observações fora da sprint.');
  const curve=sprintBurndown(sprint,data.observations),selected=tasks.filter(t=>t.payload.sprintId===sprint.id),display=selected.filter(t=>inPeriod(String(t.payload.startDate),String(t.payload.endDate),filter));
  const stats=buildProjectReport(companyId,companyName,[{project:p,records:all.filter(r=>r.kind!=='task'||selected.includes(r))}],{...filter,type:'tasks_summary'},generatedAt,labels).summary;report.summary=stats;
  report.columns=['ID atividade','Atividade','Estado','Story points','Início planejado','Fim planejado','Progresso declarado (%)','Revisão'];
  report.rows=display.map(t=>[t.id,str(t.payload.title),str(t.payload.status),str(t.payload.storyPoints),str(t.payload.startDate),str(t.payload.endDate),str(t.payload.progress),str(t.revision)]);
  const observations=curve.observations.filter(o=>inPeriod(o.recordedAt.slice(0,10),o.recordedAt.slice(0,10),filter));
  report.sections!.push({title:'Observações persistidas da sprint no período UTC',columns:['ID observação','Revisão projeto','Registro UTC','Pontos totais','Pontos restantes','Tarefas','Concluídas','Motivo','Autor'],rows:observations.map(o=>[o.id,str(o.projectRevision),o.recordedAt,str(o.totalPoints),str(o.remainingPoints),str(o.taskCount),str(o.doneCount),o.reason,o.actorId])});
  const points=curve.idealLine.map((d,i)=>({date:d.date,ideal:d.points,actual:curve.actualLine[i].points})).filter(d=>inPeriod(d.date,d.date,filter));
  report.sections!.push({title:'Burndown — referência versus observação',columns:['Dia UTC','Ideal (referência)','Restante observado'],rows:points.map(d=>[d.date,str(d.ideal),str(d.actual)])});
  const last=curve.observations.at(-1),velocity=sprint.payload.status==='completed'&&last?.reason==='scrum.complete'?last.totalPoints-last.remainingPoints:null;
  report.visual={kind:'burndown',points};report.metadata={...report.metadata,sprintId:sprint.id,sprintRevision:sprint.revision,sprintTitle:sprint.payload.title??null,goal:sprint.payload.goal??null,status:sprint.payload.status??null,plannedStart:sprint.payload.startDate,plannedEnd:sprint.payload.endDate,startedAt:sprint.payload.startedAt??null,completedAt:sprint.payload.completedAt??null,baselinePoints:curve.baselinePoints,totalPoints:curve.totalPoints,remainingPoints:curve.remainingPoints,scopeChange:curve.scopeChange,completedObservedPoints:velocity};
  report.limitations=[curve.limitation,'Pontos concluídos na última observação de fechamento são exibidos somente para sprint encerrada; não são previsão de velocidade futura.','Período filtra datas planejadas das tarefas e datas UTC das observações. Metadados de posição/baseline referem-se à sprint completa, não a soma do intervalo.','Dias sem observação permanecem indisponíveis; zeros reais são preservados. Pontos seguem as regras canônicas do Scrum, não avanço físico ponderado.'];
 }else if(filter.type==='project_budget'){
  if(!data.budgets||!data.costs||!data.orderSources)throw Error('Posição orçamentária canônica indisponível.');
  if(data.budgets.some(b=>b.currency!==p.payload.currency)||data.orderSources.some(o=>o.currency!==p.payload.currency))throw Error('Moeda da origem incompatível; consolidação bloqueada.');
  const keys=new Set([...tasks.map(t=>t.id),...data.budgets.flatMap(b=>Object.keys(b.allocations)),...data.costs.map(c=>c.taskId),...all.filter(r=>r.kind==='work_fact'&&r.payload.status==='validated').map(r=>String(r.payload.taskId))]);
  const zeros=Object.fromEntries([...keys].map(k=>[k,'0.00'])),enriched=data.budgets.map(b=>({...b,allocations:{...zeros,...b.allocations}})),summary=budgetSummary(enriched,all,data.costs);
  // No original budget yet: preserve unknown budget fields while still reporting known actuals.
  const lines=summary.activities.length?summary.activities:[...keys].map(id=>{const facts=all.filter(r=>r.kind==='work_fact'&&r.payload.status==='validated'&&r.payload.taskId===id),costs=data.costs!.filter(c=>c.taskId===id);return {id,original:'0.00',updated:'0.00',committed:amount(costs.reduce((n,c)=>n+cents(c.committed),0n)),realized:amount(facts.reduce((n,r)=>n+cents(String(r.payload.value)),0n)+costs.reduce((n,c)=>n+cents(c.realized),0n)),availableAfterKnownFacts:'0.00'};});
  report.columns=['ID atividade','Atividade','Moeda','Orçamento original','Atualizado','Comprometido pendente','Realizado validado','Saldo disponível'];
  report.rows=lines.map(l=>[l.id,tasks.find(t=>t.id===l.id)?str(tasks.find(t=>t.id===l.id)!.payload.title):'Atividade indisponível (origem preservada)',p.payload.currency,str(summary.original===null?null:l.original),str(summary.updated===null?null:l.updated),str(l.committed),l.realized,str(summary.updated===null?null:l.availableAfterKnownFacts)]);
  report.sections!.push({title:'Totais canônicos do projeto',columns:report.columns.slice(2),rows:[[p.payload.currency,str(summary.original),str(summary.updated),str(summary.committed),summary.realized,str(summary.available)]]});
  report.sections!.push({title:'Revisões orçamentárias',columns:['Revisão projeto','Tipo','Teto','Moeda','Justificativa','Autor','Registro UTC'],rows:data.budgets.map(b=>[str(b.project_revision),b.kind,b.total,b.currency,b.reason,b.actorId,b.createdAt])});
  report.sections!.push({title:'Custos canônicos por origem — não somar novamente aos totais',columns:['OS','Atividade','Comprometido pendente','Realizado validado'],rows:data.costs.map(c=>[c.orderId,c.taskId,c.committed,c.realized])});
  report.sections!.push({title:'Fatos operacionais validados — já incluídos no realizado',columns:['ID fato','Atividade','Data efetiva','Valor','Revisão'],rows:all.filter(r=>r.kind==='work_fact'&&r.payload.status==='validated').map(r=>[r.id,str(r.payload.taskId),str(r.payload.date),str(r.payload.value),str(r.revision)])});
  report.sections!.push({title:'Revisões das OS de origem',columns:['ID OS','Revisão','Estado','Moeda'],rows:data.orderSources.map(o=>[o.id,str(o.revision),o.status,o.currency])});
  report.metadata={...report.metadata,budget:summary,budgetRevisions:data.budgets.map(b=>b.project_revision),orderSources:data.orderSources};
  report.limitations=['Posição atual congelada na emissão. Não reconstrói competência nem saldo histórico; filtro de datas é rejeitado.','Original e revisões seguem o orçamento canônico de Projetos. Comprometido pendente e realizado usam Arq Fornecedores e fatos operacionais validados; reservas não geram custo.','Não somar detalhamento de origens aos totais novamente. Projetos não cria livro financeiro, pagamento ou recebimento.','Valores em decimal exato e moeda única do projeto. Orçamento ausente é indisponível, não zero. Saldo pode ser negativo e deve ser analisado, sem mascaramento.'];
 }else throw Error('Relatório especializado inválido.');
 return report;
}
