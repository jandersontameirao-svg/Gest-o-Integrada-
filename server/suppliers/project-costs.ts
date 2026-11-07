import type {PoolConnection} from 'mysql2/promise';
import {pool,rows} from '../db.ts';
import type {ServiceOrder} from '../../shared/suppliers/operations.ts';
import {allocatedOrderCosts} from '../../shared/suppliers/execution.ts';
export async function projectSupplierCosts(projectId:string,c:PoolConnection|typeof pool=pool){const orders=await rows<ServiceOrder>('SELECT id,project_id projectId,task_id taskId,payload,status FROM supplier_service_orders WHERE company_id=(SELECT company_id FROM operational_projects WHERE id=?)',[projectId],c);return orders.flatMap(o=>allocatedOrderCosts({...o,payload:typeof o.payload==='string'?JSON.parse(o.payload):o.payload},projectId));}
