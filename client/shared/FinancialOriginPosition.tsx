import {useEffect,useRef,useState} from 'react';
import {scopedJson} from './requests.ts';
import type {OriginKind,OriginPosition} from '../../shared/finance/origin-position.ts';
export function FinancialOriginPosition({token,companyId,kind,sourceId,sourceRevision,label}:{token:string;companyId:string;kind:OriginKind;sourceId:string;sourceRevision:number;label:string}){
 const identity=JSON.stringify([token,companyId,kind,sourceId,sourceRevision]);
 const current=useRef(identity);current.current=identity;
 const sequence=useRef(0);const [state,setState]=useState<{identity:string;busy?:boolean;data?:OriginPosition;error?:string}|null>(null);
 useEffect(()=>()=>{sequence.current++;},[]);
 const shown=state?.identity===identity?state:null;
 async function load(){const own=++sequence.current,key=identity;setState({identity:key,busy:true});try{
  const query=new URLSearchParams({companyId,kind,sourceId});const data=await scopedJson<OriginPosition>(token,'/finance/origin-position?'+query);
  if(current.current===key&&sequence.current===own)setState({identity:key,data});
 }catch(error){if(current.current===key&&sequence.current===own)setState({identity:key,error:(error as Error).message});}}
 const p=shown?.data?.position;
 return <section aria-label={'Posição financeira de '+label} className="border rounded p-3 space-y-2">
  <button disabled={shown?.busy} onClick={()=>void load()}>{shown?.busy?'Consultando posição financeira…':'Consultar posição financeira de '+label}</button>
  {shown?.error&&<p role="alert">Consulta não disponível: {shown.error} Nenhum valor foi presumido.</p>}
  {shown?.data&&<>{p?<><p>Título financeiro {p.titleId} · revisão {p.revision} · estado {p.status}</p><p>{p.currency} · Valor {p.amount} · Liquidado {p.paid} · Pendente {p.pending}</p><p>{p.originStatus==='current'?'Origem conciliada.':'Origem exige reconciliação no Financeiro; a posição existente foi preservada.'}</p></>:<p>Nenhum título financeiro preparado para esta origem. Isso não significa pagamento ou recebimento zero.</p>}<p>Faturamento fiscal não acompanhado nesta consulta. Aprovação operacional não gera liquidação automática.</p><p>Consulta em {shown.data.checkedAt}. Use o botão para atualizar após decisões no Financeiro.</p></>}
 </section>;
}
