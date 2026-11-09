/** Adapted from arqueo-gestao Reports.tsx / server/reports.ts: four report families,
 * phase/task breakdown, status and priority labels. All filters now apply server-side. */
import type {Project,ProjectRecord} from './model.ts';
import {dateOnly} from '../contracts/model.ts';
export const reportTypes=[{id:'project_progress',title:'Progresso de Projetos',description:'Fases, atividades, progresso declarado e datas.'},{id:'tasks_summary',title:'Resumo de Tarefas',description:'Atividades, prioridades, responsáveis e atrasos.'},{id:'executive_summary',title:'Resumo Executivo',description:'Posição gerencial dos projetos da empresa.'},{id:'company_overview',title:'Visão por Empresa',description:'Resumo da empresa sem misturar moedas ou custos.'}] as const;
export type ReportFilter={type:typeof reportTypes[number]['id'];projectId:string|null;from:string|null;to:string|null};
export function reportFilter(input:unknown):ReportFilter{
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Filtros obrigatórios.');const b=input as Record<string,unknown>;
 if(Object.keys(b).some(k=>!['type','projectId','from','to'].includes(k)))throw Error('Filtro desconhecido.');
 if(!reportTypes.some(t=>t.id===b.type))throw Error('Tipo de relatório inválido.');
 const date=(v:unknown)=>v===null||v===undefined||v===''?null:dateOnly(String(v));
 const from=date(b.from),to=date(b.to);if(from&&to&&from>to)throw Error('Período invertido.');
 const projectId=b.projectId===null||b.projectId===undefined||b.projectId===''?null:String(b.projectId);
 if(projectId&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId))throw Error('Projeto inválido.');
 return {type:b.type as ReportFilter['type'],projectId,from,to};
}
const status:Record<string,string>={todo:'A fazer',in_progress:'Em andamento',review:'Em revisão',done:'Concluída',planning:'Planejamento',on_hold:'Pausado',completed:'Concluído',cancelled:'Cancelado'};
const priority:Record<string,string>={low:'Baixa',medium:'Média',high:'Alta',urgent:'Urgente'};
export type ReportSource={project:Project;records:ProjectRecord[]};
export type ProjectReport={schemaVersion:1;companyId:string;companyName:string;generatedAt:string;filter:ReportFilter;title:string;columns:string[];rows:string[][];summary:{projects:number;tasks:number;completed:number;overdue:number;completionPercent:number|null};sources:{projectId:string;revision:number;originKey:string;currency:string;recordRevisions:{id:string;revision:number}[]}[];limitations:string[]};
export function buildProjectReport(companyId:string,companyName:string,input:ReportSource[],filter:ReportFilter,generatedAt:string,labels:Record<string,string>={}):ProjectReport{
 const today=dateOnly(generatedAt.slice(0,10)),projects=input.filter(s=>s.project.companyId===companyId&&(!filter.projectId||s.project.id===filter.projectId));
 if(input.some(s=>s.project.companyId!==companyId))throw Error('Fonte de outra empresa.');
 const overlap=(p:Record<string,unknown>)=>{const start=String(p.startDate??''),end=String(p.endDate??'');return (!filter.from||end>=filter.from)&&(!filter.to||start<=filter.to);};
 const selected=projects.map(s=>({...s,tasks:s.records.filter(r=>r.kind==='task'&&overlap(r.payload))}));
 const leaves=(s:typeof selected[number])=>{const parents=new Set(s.records.filter(r=>r.kind==='task').map(r=>r.payload.parentTaskId).filter(Boolean));return s.tasks.filter(t=>!parents.has(t.id));};
 const all=selected.flatMap(leaves),completed=all.filter(t=>t.payload.status==='done').length,overdue=(t:ProjectRecord)=>t.payload.status!=='done'&&String(t.payload.endDate)<today;
 const summary={projects:projects.length,tasks:all.length,completed,overdue:all.filter(overdue).length,completionPercent:all.length?Math.round(completed*10000/all.length)/100:null};
 const taskRows=selected.flatMap(s=>s.tasks.map(t=>{const p=t.payload,phase=s.records.find(r=>r.kind==='phase'&&r.id===p.phaseId);return [s.project.id,s.project.payload.name,String(t.id),phase?String(phase.payload.title):'Sem fase',String(p.title),status[String(p.status)]??String(p.status),priority[String(p.priority)]??String(p.priority),p.assigneeId?(labels[String(p.assigneeId)]??'Responsável indisponível neste escopo'):'Não atribuído',String(p.startDate),String(p.endDate),String(p.progress??0),overdue(t)?'Sim':'Não',s.records.some(r=>r.kind==='task'&&r.payload.parentTaskId===t.id)?'Resumo (não contado nos totais)':'Atividade folha',String(t.revision)];}));
 const projectRows=selected.map(s=>{const tasks=leaves(s),done=tasks.filter(t=>t.payload.status==='done').length;return [s.project.id,s.project.payload.internalCode,s.project.payload.name,status[s.project.payload.status]??s.project.payload.status,s.project.payload.currency,String(tasks.length),String(done),String(tasks.filter(overdue).length),tasks.length?String(Math.round(done*10000/tasks.length)/100):'Não disponível',String(s.project.revision)];});
 const detailed=['project_progress','tasks_summary'].includes(filter.type);
 return {schemaVersion:1,companyId,companyName,generatedAt,filter,title:reportTypes.find(t=>t.id===filter.type)!.title,columns:detailed?['ID projeto','Projeto','ID atividade','Fase','Atividade','Estado','Prioridade','Responsável','Início planejado','Fim planejado','Progresso declarado (%)','Atrasada na emissão','Tipo de linha','Revisão']:['ID projeto','Número','Projeto','Estado','Moeda','Atividades folha','Concluídas','Atrasadas na emissão','Conclusão por contagem (%)','Revisão'],rows:detailed?taskRows:projectRows,summary,sources:projects.map(s=>({projectId:s.project.id,revision:s.project.revision,originKey:s.project.originKey,currency:s.project.payload.currency,recordRevisions:s.records.filter(r=>['phase','task'].includes(r.kind)).map(r=>({id:r.id,revision:r.revision}))})),limitations:['Posição congelada na emissão; não reconstrói saldos ou execução de datas passadas.','Período filtra sobreposição inclusiva das datas planejadas das atividades; projetos sem atividades no período permanecem com contagem zero.','Percentual de conclusão por contagem de atividades folha; não equivale a avanço físico ponderado. Pais são exibidos, sem dupla contagem nos totais.','Atraso considera o dia civil UTC da emissão; atividade com fim hoje não está atrasada.','Sem consolidação financeira, conversão de moedas, anexos privados ou autoridade de faturamento.']};
}
export function reportTable(r:ProjectReport):string[][]{return [['Empresa',r.companyName,'ID',r.companyId],['Relatório',r.title,'Emissão UTC',r.generatedAt],['Período planejado',r.filter.from??'Sem início',r.filter.to??'Sem fim'],['Projetos',String(r.summary.projects),'Atividades folha',String(r.summary.tasks),'Concluídas',String(r.summary.completed),'Atrasadas',String(r.summary.overdue)],r.columns,...r.rows,...r.limitations.map(l=>['Limitação',l]),...r.sources.map(s=>['Proveniência',s.projectId,String(s.revision),s.originKey,s.currency])];}
export function reportCsv(table:string[][]){return '\uFEFF'+table.map(row=>row.map(v=>'"'+(/^[\s]*[=+\-@\t\r]/.test(v)?"'"+v:v).replaceAll('"','""')+'"').join(';')).join('\r\n');}

/** Canonical JSON independent of MySQL JSON object key ordering. */
export function canonicalReport(value:unknown):string {if(Array.isArray(value))return "["+value.map(canonicalReport).join(",")+"]";if(value!==null&&typeof value==="object")return "{"+Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>JSON.stringify(k)+":"+canonicalReport(v)).join(",")+"}";return JSON.stringify(value);}
