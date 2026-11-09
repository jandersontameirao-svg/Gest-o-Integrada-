import {paid,pending,type Title,type Settlement} from './model.ts';
export type OriginKind='customer_measurement'|'supplier_measurement';
export type OriginPosition={schemaVersion:1;companyId:string;source:{kind:OriginKind;id:string;revision:number;status:string};checkedAt:string;position:null|{titleId:string;revision:number;status:Title['status'];amount:string;currency:string;paid:string;pending:string;originStatus:string};invoicingStatus:'not_tracked';automaticSettlement:false};
// Read projection deliberately excludes bank accounts, payment methods, notes and attachments.
export function originProjection(companyId:string,source:OriginPosition['source'],title:Title|null,settlements:Settlement[],originStatus:string,checkedAt:string):OriginPosition{
 return {schemaVersion:1,companyId,source,checkedAt,position:title?{titleId:title.id,revision:title.revision,status:title.status,amount:title.payload.amount,currency:title.payload.currency,paid:paid(title,settlements),pending:pending(title,settlements),originStatus}:null,invoicingStatus:'not_tracked',automaticSettlement:false};
}
