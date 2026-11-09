import type {PoolConnection} from 'mysql2/promise';
import {pool,rows} from '../db.ts';
import type {ServiceOrder} from '../../shared/suppliers/operations.ts';
import {allocatedOrderCosts} from '../../shared/suppliers/execution.ts';
export async function projectSupplierCosts(projectId:string,c:PoolConnection|typeof pool=pool){const orders=await rows<ServiceOrder>('SELECT id,project_id projectId,task_id taskId,payload,status FROM supplier_service_orders WHERE company_id=(SELECT company_id FROM operational_projects WHERE id=?)',[projectId],c);return orders.flatMap(o=>allocatedOrderCosts({...o,payload:typeof o.payload==='string'?JSON.parse(o.payload):o.payload},projectId));}
/** Read-only canonical cost snapshot for an authorized Projects report.
 * Shared row locks keep OS revisions/amounts consistent until the report commits. */
export async function projectSupplierCostSnapshot(projectId:string,c:PoolConnection){
 const orders=await rows<ServiceOrder>('SELECT id,project_id projectId,task_id taskId,payload,status,revision FROM supplier_service_orders WHERE company_id=(SELECT company_id FROM operational_projects WHERE id=?) ORDER BY id LIMIT 5001 FOR SHARE',[projectId],c);
 if(orders.length>5000)throw Error('Até 5000 OS por empresa para emissão; particione o acervo.');
 const decoded=orders.map(o=>({...o,payload:typeof o.payload==='string'?JSON.parse(o.payload):o.payload})),costs=decoded.flatMap(o=>allocatedOrderCosts(o,projectId)),ids=new Set(costs.map(c=>c.orderId));
 if(costs.length>5000)throw Error('Até 5000 parcelas canônicas por relatório.');
 return {costs,orderSources:decoded.filter(o=>ids.has(o.id)).map(o=>({id:o.id,revision:o.revision,currency:o.payload.currency,status:o.status}))};
}
