import type {OrderTerms} from './operations.ts';
export type BoundLegalInstrument={documentId:string;documentRevision:number;templateId:string;templateRevision:number;sha256:string;provenance:unknown;bindings:Record<string,string>;scope:{projectId:string|null;taskId:string|null;beneficiaryScopeId:string|null};actorId:string;recordedAt:string};
export type OrderChange={id:string;companyId:string;orderId:string;baseOrderRevision:number;baseContractRevision:number;baseBudgetId:string;payload:OrderTerms;status:'draft'|'in_review'|'approved'|'applied'|'cancelled';revision:number;decision:unknown};
