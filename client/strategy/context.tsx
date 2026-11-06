import {createContext,useContext,useEffect,useRef,useState,type Dispatch,type SetStateAction,type ReactNode} from 'react';
import {toast} from 'sonner';
import type {PlanData,Method} from '../../shared/strategy/model.ts';
export type StrategyContextValue={data:PlanData;cycleId:string;token:string;refresh:()=>Promise<void>;navigate:(path:string)=>void;dirty:Set<string>};
export const StrategyContext=createContext<StrategyContextValue|null>(null);
export function useStrategy(){const ctx=useContext(StrategyContext);if(!ctx)throw Error('Contexto estratégico necessário.');return ctx;}
export async function request<T>(token:string,path:string,method='GET',body?:unknown):Promise<T>{const r=await fetch('/api/v1/strategy'+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})});const json=await r.json();if(!r.ok)throw Error(json.error??'Falha na operação estratégica.');return json;}
export function useDocument<T>(kind:Method,initial:T){
 const ctx=useStrategy(),doc=ctx.data.documents.find(d=>d.kind===kind&&d.cycle_id===ctx.cycleId);
 const [value,state]=useState<T>(()=>(doc?.payload as T)??initial),[status,setStatus]=useState<'idle'|'saving'|'saved'|'error'>('idle'),[generation,bump]=useState(0);
 const revision=useRef(doc?.revision??0),current=useRef(value),inFlight=useRef(false),mounted=useRef(true);
 const key=ctx.data.plan.id+':'+ctx.cycleId+':'+kind;
 const canEdit=ctx.data.capabilities.edit&&ctx.data.plan.status==='draft'&&!ctx.data.cycles.find(c=>c.id===ctx.cycleId)?.closed;
 const setValue:Dispatch<SetStateAction<T>>=next=>{if(!canEdit)return;const v=typeof next==='function'?(next as (v:T)=>T)(current.current):next;if(JSON.stringify(v)===JSON.stringify(current.current))return;current.current=v;state(v);ctx.dirty.add(key);setStatus('idle');bump(n=>n+1);};
 async function save(){if(inFlight.current||!canEdit)return false;const snapshot=current.current;inFlight.current=true;if(mounted.current)setStatus('saving');try{const result=await request<{revision:number}>(ctx.token,'/plans/'+ctx.data.plan.id+'/documents/'+kind,'PUT',{value:snapshot,revision:revision.current,cycleId:ctx.cycleId,planVersion:ctx.data.plan.version});revision.current=result.revision;if(JSON.stringify(current.current)===JSON.stringify(snapshot))ctx.dirty.delete(key);if(mounted.current){setStatus('saved');if(ctx.dirty.has(key))bump(n=>n+1);}await ctx.refresh();return true;}catch(e){if(mounted.current)setStatus('error');toast.error((e as Error).message);return false;}finally{inFlight.current=false;}}
 const saveRef=useRef(save);saveRef.current=save;
 useEffect(()=>{if(!ctx.dirty.has(key))return;const t=setTimeout(()=>{void saveRef.current();},1200);return()=>clearTimeout(t);},[generation]);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;if(ctx.dirty.has(key))void saveRef.current();};},[]);
 return {value,setValue,status,save,loaded:true};
}
export function ReadOnly({children}:{children:ReactNode}){const {data,cycleId}=useStrategy();const cycle=data.cycles.find(c=>c.id===cycleId);return <fieldset disabled={!data.capabilities.edit||data.plan.status!=='draft'||!!cycle?.closed} style={{border:0,padding:0,minWidth:0}}>{children}</fieldset>;}
