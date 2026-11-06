export const methodologies=['porter','stakeholders','vrio','bsc','okr','swot','pestel','tows'] as const;
export type Method=typeof methodologies[number];
export type Plan={id:string;scope_id:string;title:string;start_year:number;end_year:number;version:number;status:'draft'|'approved'|'closed'};
export type Cycle={id:string;kind:'annual'|'quarterly'|'monthly';year:number;period:number;closed:number};
export type Entry={id:string;kind:'objective'|'target'|'kpi'|'kpi-value'|'project'|'action';parent_id:string|null;revision:number;payload:Record<string,unknown>};
export type StrategyDocument={kind:Method;cycle_id:string;payload:unknown;revision:number};
export type PlanData={plan:Plan;cycles:Cycle[];entries:Entry[];documents:StrategyDocument[];capabilities:{edit:boolean;approve:boolean;reopen:boolean;export:boolean};name:string};
// SGE formulas: preserve thresholds, guard mathematically undefined denominators.
export function attainment(actual:number,target:number){return target>0?(actual/target)*100:null;}
export function rag(percent:number|null){return percent===null?null:percent>=90?'verde':percent>=70?'amarelo':'vermelho';}
export function calendar(start:number,end:number){
 const cycles:{kind:Cycle['kind'];year:number;period:number}[]=[];
 for(let year=start;year<=end;year++){cycles.push({kind:'annual',year,period:1});for(let p=1;p<=4;p++)cycles.push({kind:'quarterly',year,period:p});for(let p=1;p<=12;p++)cycles.push({kind:'monthly',year,period:p});}return cycles;
}
