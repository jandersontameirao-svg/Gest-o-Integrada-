import {amount,cents,effectiveValue,type ContractRecord} from './model.ts';
export type MeasurementItem={milestoneId:string;description:string;value:string};
export type Glosa={item:number;value:string;reason:string};
const reserved=new Set(['submitted','approved','billable']);
export function netItems(r:ContractRecord){const glosas=(r.payload.glosas??[]) as Glosa[];return (r.payload.items as MeasurementItem[]).map((i,index)=>({...i,net:amount(cents(i.value)-glosas.filter(g=>g.item===index).reduce((n,g)=>n+cents(g.value),0n))}));}
/** Drafts do not consume balances. Submitted values reserve capacity; approval reserves net accepted values. */
export function assertBalances(base:string,records:ContractRecord[]){
 const used=new Map<string,bigint>();let total=0n;
 for(const r of records.filter(r=>r.kind==='measurement'&&reserved.has(String(r.payload.status)))){
  for(const i of netItems(r)){const n=cents(i.net);if(n<0n)throw Error('Glosa superior ao item.');const m=records.find(m=>m.id===i.milestoneId&&m.kind==='milestone');if(!m||m.payload.status==='cancelled')throw Error('Marco cancelado ou inexistente possui medição reservada.');used.set(m.id,(used.get(m.id)??0n)+n);total+=n;}
 }
 for(const [id,n] of used){const m=records.find(r=>r.id===id)!;if(n>cents(String(m.payload.valorPrevisto)))throw Error('Saldo do marco insuficiente.');}
 if(total>cents(effectiveValue(base,records)))throw Error('Saldo contratual vigente insuficiente.');
 // Identical active submissions cannot be presented twice with a different request key.
 const seen=new Set<string>();for(const r of records.filter(r=>r.kind==='measurement'&&reserved.has(String(r.payload.status)))){const key=JSON.stringify([r.payload.periodStart,r.payload.periodEnd,(r.payload.items as MeasurementItem[]).map(i=>[i.milestoneId,i.description.trim().toLocaleLowerCase('pt-BR'),i.value]).sort()]);if(seen.has(key))throw Error('Medição idêntica já apresentada; utilize correção ou revisão.');seen.add(key);}
}
export function measurementSummary(base:string,records:ContractRecord[]){let presented=0n,approved=0n,billable=0n,glosa=0n;const used=new Map<string,bigint>();for(const r of records.filter(r=>r.kind==='measurement'&&reserved.has(String(r.payload.status)))){const net=netItems(r).reduce((n,i)=>{used.set(i.milestoneId,(used.get(i.milestoneId)??0n)+cents(i.net));return n+cents(i.net);},0n);presented+=cents(String(r.payload.total));if(['approved','billable'].includes(String(r.payload.status))){approved+=net;glosa+=cents(String(r.payload.total))-net;}if(r.payload.status==='billable')billable+=net;}return {presented:amount(presented),approved:amount(approved),billable:amount(billable),glosa:amount(glosa),available:amount(cents(effectiveValue(base,records))-[...used.values()].reduce((a,b)=>a+b,0n)),milestones:records.filter(r=>r.kind==='milestone').map(r=>({id:r.id,reserved:amount(used.get(r.id)??0n),available:amount(cents(String(r.payload.valorPrevisto))-(used.get(r.id)??0n))})),invoiced:null,received:null,financialAuthority:'finance-future' as const};}
