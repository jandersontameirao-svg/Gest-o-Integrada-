import type {CompendiumReference} from './compendium.ts';
export const families=['contract','service_order','measurement','amendment','indicators'] as const;
export type Family=typeof families[number];
export const familyLabels:Record<Family,string>={contract:'Contrato de prestador',service_order:'Ordem de Serviço',measurement:'Boletim de Medição',amendment:'Termo Aditivo',indicators:'Metodologia de Indicadores'};
export const remunerationModels=['unset','delivery','daily','monthly'] as const;
export type ReviewStatus='draft'|'in_review';
export const reviewGate={sourceStatus:'authorized_for_development',developmentBlocked:false,blockedReason:'draft_document_not_operational_instrument',legalApprovalGranted:false,operationallyEffective:false,financialEffect:false,blockedActions:['approve','issue','sign','mobilize','demobilize','calculate','settle']} as const;
export const componentCatalog:Record<Family,string[]>={contract:['identity','service_scope','beneficiary','remuneration_parameters','term','authority','obligations','annexes','versions'],service_order:['contract_reference','project_activity','professional_reference','planned_period','deliverables','remuneration_parameters','issuer','technical_verification'],measurement:['order_reference','competence','evidence','quantities','technical_verification','billing_authorization'],amendment:['contract_reference','scope_change','term_change','price_parameters','effective_date','signatories','versions'],indicators:['scope_reference','objective_metrics','evidence','measurement_period','reviewer','versions']};
export const stages=['reservation','contract_order','confirmed_mobilization','execution','demobilization','operational_validation','future_finance_event'] as const;
export type SupplierDetails={tradeName:string;stateRegistration:string;municipalRegistration:string;email:string;phone:string;website:string;street:string;number:string;complement:string;neighborhood:string;city:string;state:string;zipCode:string;country:string;notes:string};
export type Supplier={id:string;companyId:string;companyName:string;cnpj:string;kind:'individual'|'organization';details:SupplierDetails;revision:number;status:'draft'};
export type TemplatePayload={sourceModelId?:string|null;compendium?:CompendiumReference|null;title:string;serviceScope:string;remunerationModel:typeof remunerationModels[number];notes:string};
export type DraftPayload={sourceModelId?:string|null;compendium?:CompendiumReference|null;title:string;serviceScope:string;notes:string;plannedFrom:string;plannedTo:string;beneficiaryScopeId:string|null;remunerationModel:typeof remunerationModels[number]};
export type Template={id:string;companyId:string;family:Family;payload:TemplatePayload;revision:number;status:ReviewStatus};
export type Draft={id:string;companyId:string;supplierId:string;family:Family;templateId:string;templateRevision:number;parentId:string|null;projectId:string|null;taskId:string|null;payload:DraftPayload;revision:number;status:ReviewStatus};
export const draftParents:Record<Family,Family|null>={contract:null,service_order:'contract',measurement:'service_order',amendment:'contract',indicators:'contract'};
export function statusForReview(v:unknown):ReviewStatus{if(v!=='draft'&&v!=='in_review')throw Error('Esta etapa permite apenas rascunho ou em revisão.');return v;}
