// Contracts only: future consumers/providers are NOT mounted or activated by 03B.
export type ModuleAuthority='core'|'contracts'|'projects'|'suppliers'|'strategy'|'finance-future';
export type CanonicalReference={authority:ModuleAuthority;entityType:'customer-contract'|'supplier-contract'|'supplier-order'|'operational-project'|'strategic-project'|'party'|'person';id:string;revision:number};
export type EventEnvelopeV1={eventId:string;schemaVersion:1;eventType:string;sourceModule:ModuleAuthority;entityId:string;entityRevision:number;companyId:string;unitAtEffectiveDate:string;effectiveAt:string;recordedAt:string;actorId:string;correlationId:string;idempotencyKey:string;currency?:string;payload:Record<string,unknown>};
export type SupplierRequestV1={schemaVersion:1;requestId:string;companyId:string;project:CanonicalReference;partyId?:string;professionalIds:string[];requestedPeriod:{from:string;to:string};state:'provisional-reservation'|'engagement-request';reservationGeneratesCost:false};
export type MobilizationV1={schemaVersion:1;eventId:string;companyId:string;projectId:string;supplierOrderId:string;professionalId:string;effectiveDate:string;recordedAt:string;unitAtEffectiveDate:string;currency:string;conditionsRevision:number;operationalValidation:{actorId:string;action:'mobilize'|'demobilize-retroactive';reason:string};reservationGeneratesCost:false};
export type EvaluationV1={schemaVersion:1;evaluationId:string;revision:number;companyId:string;supplierId:string;projectId:string;orderId:string;periodStart:string;periodEnd:string;scores:Record<string,number>;actorId:string;idempotencyKey:string};
export const futureEndpointsV1=[
 {method:'GET',path:'/api/v1/contracts/:id/project-reference',authority:'contracts',state:'specified-not-mounted'},
 {method:'POST',path:'/api/v1/projects/supplier-requests',authority:'projects',state:'specified-not-mounted'},
 {method:'POST',path:'/api/v1/suppliers/orders',authority:'suppliers',state:'specified-not-mounted'},
 {method:'POST',path:'/api/v1/suppliers/mobilizations',authority:'suppliers',state:'specified-not-mounted'},
 {method:'POST',path:'/api/v1/suppliers/demobilizations',authority:'suppliers',state:'specified-not-mounted'},
 {method:'POST',path:'/api/v1/suppliers/evaluations',authority:'suppliers',state:'specified-not-mounted'},
] as const;
