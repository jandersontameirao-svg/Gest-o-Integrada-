import {HttpError} from './policy.ts';
import {methodologies,type Method} from '../shared/strategy/model.ts';
export function invalid(message='Dados estratégicos inválidos.'):never{throw new HttpError(400,message);}
export function object(v:unknown):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v))invalid();return v as Record<string,unknown>;}
export function str(v:unknown,max=3000){if(typeof v!=='string'||!v.trim()||v.length>max)invalid();return v.trim();}
export function integer(v:unknown,min:number,max:number){if(typeof v!=='number'||!Number.isInteger(v)||v<min||v>max)invalid();return v;}
function score(v:unknown){return integer(v,1,5);}
function number(v:unknown,positive=false){if(typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>1e12||(positive&&v<=0))invalid();return v;}
function list(v:unknown){if(!Array.isArray(v)||v.length>100)invalid();return v as unknown[];}
function unique(items:Record<string,unknown>[]){const ids=items.map(i=>str(i.id,80));if(new Set(ids).size!==ids.length)invalid('IDs duplicados.');}
export function validateMethod(kind:string,value:unknown):Method{
 if(!methodologies.some(m=>m===kind))invalid('Metodologia inválida.');
 const validateItems=(v:unknown,check:(x:Record<string,unknown>)=>void)=>{const items=list(v).map(object);unique(items);items.forEach(check);};
 if(kind==='swot'){const v=object(value);for(const key of ['forcas','fraquezas','oportunidades','ameacas'])validateItems(v[key],i=>str(i.descricao));}
 else validateItems(value,i=>{
  if(kind==='porter'){str(i.tipo,40);if(!['Rivalidade','Fornecedores','Clientes','Novos Entrantes','Substitutos'].includes(String(i.tipo)))invalid();score(i.intensidade);str(i.descricao);}
  if(kind==='stakeholders'){str(i.nome,160);score(i.poder);score(i.interesse);if(i.descricao!==undefined&&typeof i.descricao!=='string')invalid();}
  if(kind==='vrio'){str(i.nome,160);for(const k of ['valioso','raro','imitavel','organizado'])integer(i[k],0,5);}
  if(kind==='bsc'){str(i.nome,160);str(i.icone,40);if(!/^#[0-9a-fA-F]{6}$/.test(str(i.cor,7)))invalid();validateItems(i.indicadores,n=>{str(n.nome,160);number(n.meta,true);number(n.atual);});}
  if(kind==='okr'){str(i.objetivo);validateItems(i.keyResults,k=>{str(k.descricao);number(k.meta,true);number(k.atual);});}
  if(kind==='pestel'){if(!['politico','economico','social','tecnologico','ambiental','legal'].includes(str(i.categoria,40).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()))invalid();str(i.descricao);score(i.impacto);score(i.probabilidade);}
 });
 if(kind==='bsc'&&!['financeira','cliente','processos','aprendizado'].every(id=>(value as Record<string,unknown>[]).some(v=>v.id===id)))invalid('Preserve as quatro perspectivas BSC.');
 return kind as Method;
}
export function validateEntry(kind:string,data:unknown){const d=object(data);
 if(kind==='objective'){str(d.titulo,160);if(!['financeira','clientes','processos','aprendizado'].includes(String(d.perspectivaBSC)))invalid();if(!['planejado','em_andamento','concluido','cancelado'].includes(String(d.status)))invalid();}
 else if(kind==='kpi'){str(d.nome,160);if(!['mensal','trimestral','anual'].includes(String(d.frequencia)))invalid();str(d.unidadeMedida,50);}
 else if(kind==='target'){str(d.objetivoId,36);integer(d.ano,2000,2100);number(d.metaAnual);if(!['faturamento','clientes','producao','outros'].includes(String(d.tipo)))invalid();}
 else if(kind==='kpi-value'){str(d.kpiId,36);integer(d.ano,2000,2100);integer(d.mes,1,12);if(d.meta!==undefined)number(d.meta);if(d.realizado!==undefined)number(d.realizado);}
 else invalid('Tipo de registro inválido.');
 if(JSON.stringify(d).length>12000)invalid();return d;
}
