import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer} from 'recharts';
import {graphNumber} from '../../../shared/strategy/financial-series.ts';
export type KpiChartPoint={period:string;label:string;meta:string|null;actual:string|null};
// Extracted from the original SGE KpiValoresDialog evolution chart; exact text stays outside Number.
export function KpiEvolutionChart({points,showMeta=true,actualName='Realizado'}:{points:KpiChartPoint[];showMeta?:boolean;actualName?:string}){
 const drawing=points.map(p=>({...p,metaNumber:graphNumber(p.meta),actualNumber:graphNumber(p.actual)}));
 return <div aria-label="Gráfico de evolução temporal" className="mb-6"><ResponsiveContainer width="100%" height={250}><LineChart data={drawing} accessibilityLayer><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="label" tick={{fontSize:12}}/><YAxis tick={{fontSize:12}}/><Tooltip content={({active,payload})=>{const p=payload?.[0]?.payload as KpiChartPoint|undefined;return active&&p?<div className="border rounded bg-background p-2"><p>{p.label}</p>{showMeta&&<p>Meta: {p.meta??'—'}</p>}<p>{actualName}: {p.actual??'—'}</p></div>:null;}}/><Legend/>{showMeta&&<Line type="monotone" dataKey="metaNumber" name="Meta" stroke="#f97316" strokeWidth={2} dot={{r:4}} connectNulls={false}/>}<Line type="monotone" dataKey="actualNumber" name={actualName} stroke="#3b82f6" strokeWidth={2} dot={{r:4}} connectNulls={false}/></LineChart></ResponsiveContainer></div>;
}
