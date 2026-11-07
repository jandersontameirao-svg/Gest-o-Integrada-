import type {PoolConnection} from 'mysql2/promise';
import {pool,rows} from '../db.ts';
import {orderCosts,type ServiceOrder} from '../../shared/suppliers/operations.ts';
export async function projectSupplierCosts(projectId:string,c:PoolConnection|typeof pool=pool){return (await rows<ServiceOrder>('SELECT task_id taskId,payload,status FROM supplier_service_orders WHERE project_id=?',[projectId],c)).map(o=>({taskId:(o as ServiceOrder&{taskId:string}).taskId,...orderCosts({...o,payload:typeof o.payload==='string'?JSON.parse(o.payload):o.payload})}));}
