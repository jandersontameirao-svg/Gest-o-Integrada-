// Finite compatibility facade for the source SGE hooks. No RPC, OAuth or external service.
import {useState,useMemo} from 'react';
import {useStrategy,request} from './context.tsx';
import type {Entry} from '../../shared/strategy/model.ts';
type Payload=Record<string,unknown>;
type Callback={onSuccess?:(result:unknown,variables:Payload)=>void;onError?:(error:Error)=>void};
type Objective={id:string;titulo:string;descricao:string;perspectivaBSC:string;prazo:string;status:string;impacto:string;probabilidade:string;responsavelOrganoId:string|null;responsavelOrganoNome:string|null;responsavelOrganoCargo:string|null};
type KPI={id:string;nome:string;unidadeMedida:string;tipo:string;frequencia:string;perspectivaBSC:string;responsavel:string};
type Value={id:string;kpiId:string;ano:number;mes:number;meta:string|null;realizado:string|null;percentualAtingimento:string|null;statusRag:string|null};
type BSC={id:string;empresaId:string;perspectiva:string;nome:string;meta:number;valorAtual:number};
function list<T>(kind:Entry['kind']){const c=useStrategy();return {data:c.data.entries.filter(e=>e.kind===kind).map(e=>({...e.payload,id:e.id} as T)),refetch:c.refresh,isLoading:false};}
function mutation(kind:Entry['kind'],remove=false){return {useMutation(options:Callback={}){const c=useStrategy(),[isPending,setPending]=useState(false);return {isPending,mutate(input:Payload,callbacks:Callback={}){setPending(true);void(async()=>{try{let id=typeof input.id==='string'?input.id:undefined;const old=c.data.entries.find(e=>e.id===id);if(kind==='kpi-value'){const existing=c.data.entries.find(e=>e.kind===kind&&e.parent_id===input.kpiId&&e.payload.ano===input.ano&&e.payload.mes===input.mes);id=existing?.id;}
 const found=c.data.entries.find(e=>e.id===id);const result=await request(c.token,'/plans/'+c.data.plan.id+'/entries/'+(remove?id:kind),remove?'DELETE':'POST',{...(id?{id}:{}),data:input,revision:(found??old)?.revision,planVersion:c.data.plan.version});await c.refresh();options.onSuccess?.(result,input);callbacks.onSuccess?.(result,input);}catch(e){options.onError?.(e as Error);callbacks.onError?.(e as Error);}finally{setPending(false);}})();}};}};}
function valueRows(){const {data}=useStrategy();return useMemo(()=>data.entries.filter(e=>e.kind==='kpi-value').map(e=>({...e.payload,id:e.id,meta:e.payload.meta===undefined?null:String(e.payload.meta),realizado:e.payload.realizado===undefined?null:String(e.payload.realizado),percentualAtingimento:e.payload.percentualAtingimento===null?null:String(e.payload.percentualAtingimento)} as Value)),[data.entries]);}
function methodRows(kind:string){const c=useStrategy();const value=c.data.documents.find(d=>d.kind===kind&&d.cycle_id===c.cycleId)?.payload;if(Array.isArray(value))return value as Payload[];if(kind==='swot'&&value)return Object.values(value as Record<string,unknown[]>).flat() as Payload[];return [];}
function bsc(){const c=useStrategy();const perspectives=methodRows('bsc');return perspectives.flatMap(p=>(p.indicadores as {id:string;nome:string;meta:number;atual:number}[]).map(i=>({id:i.id,empresaId:c.data.plan.scope_id,perspectiva:String(p.id),nome:i.nome,meta:i.meta,valorAtual:i.atual} satisfies BSC)));}
const query=(kind:string)=>({useQuery(_input?:unknown){const c=useStrategy();return {data:methodRows(kind),refetch:c.refresh,isLoading:false};}});
export function useAuth(){const {data}=useStrategy();return {user:{role:data.capabilities.edit&&data.plan.status==='draft'?'gestor':'user'}};}
export const trpc={
 empresas:{getById:{useQuery(_input:unknown){const c=useStrategy();return {data:{id:c.data.plan.scope_id,nome:c.data.name,status:'ativa',tipoAtuacao:'servicos'},refetch:c.refresh};}},list:{useQuery(){const c=useStrategy();return {data:[{id:c.data.plan.scope_id,nome:c.data.name,status:'ativa',tipoAtuacao:'servicos'}]};}}},
 objetivosGrupo:{listByEmpresa:{useQuery(_input:unknown){return list<Objective>('objective');}},create:mutation('objective'),update:mutation('objective'),delete:mutation('objective',true),vincularLider:mutation('objective')},
 projetosGrupo:{listByEmpresa:{useQuery(_input:unknown){return list<{id:string;nome:string;status:string}>('project');}}},
 acoesGrupo:{listByEmpresa:{useQuery(_input:unknown){return list<{id:string;descricao:string;status:string}>('action');}}},
 kpis:{listByEmpresa:{useQuery(_input:unknown){return list<KPI>('kpi');}},create:mutation('kpi')},
 kpiValores:{listByKpi:{useQuery(input:{kpiId:string},_options?:unknown){const c=useStrategy();return {data:valueRows().filter(v=>v.kpiId===input.kpiId).sort((a,b)=>b.ano-a.ano||b.mes-a.mes),refetch:c.refresh};}},getByPeriodo:{useQuery(input:{kpiId:string;ano:number;mes:number},_options?:unknown){const c=useStrategy();return {data:valueRows().find(v=>v.kpiId===input.kpiId&&v.ano===input.ano&&v.mes===input.mes),refetch:c.refresh};}},upsert:mutation('kpi-value')},
 organograma:{leaders:{useQuery(){return {data:{leaders:[] as {id:number;title:string;person:{name:string}|null}[]}};}}},
 metodologias:{getByEmpresa:{useQuery(_input?:unknown,_options?:unknown){const c=useStrategy();return {data:['identidade','pestel','5forcas','stakeholders','vrio','swot','okr','bsc','orcamento'],refetch:c.refresh};}}},
 identidade:{getByEmpresa:{useQuery(_input:unknown){return {data:undefined as {missao:string;visao:string;valores:string;politica:string}|undefined};}}},
 analises:{getPestel:query('pestel'),getSwot:query('swot'),getOkr:query('okr')},
 bsc:{getAll:{useQuery(){return {data:bsc()};}},getByEmpresa:{useQuery(_input?:unknown){return {data:bsc()};}}},
};
