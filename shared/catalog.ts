export const modules = [
  { id: 'projects', name: 'Gestão de Projetos e Portfólio', description: 'Organização de projetos, prioridades e portfólio.' },
  { id: 'contracts', name: 'Gestão de Contratos e Marcos', description: 'Acompanhamento de contratos e entregas.' },
  { id: 'suppliers', name: 'Arq Fornecedores', description: 'Relacionamento e qualificação de fornecedores.' },
  { id: 'finance', name: 'Gestão Financeira', description: 'Visibilidade financeira por empresa.' },
  { id: 'strategy', name: 'Gestão e Planejamento Estratégico', description: 'Objetivos, indicadores e planejamento.' },
] as const;
export type ModuleId = typeof modules[number]['id'];
export const companies = [
 { id: 'holding', name: 'Grupo Arqueo — Holding', isHolding: true },
 { id: 'arqueoproject', name: 'Arqueoproject Projetos e Pesquisas Ltda.', isHolding: false },
 { id: 'arqueogis-arqueologia', name: 'Arqueogis Arqueologia Preventiva', isHolding: false },
 { id: 'arqueogis-geo', name: 'Arqueogis Geoprocessamento', isHolding: false },
 { id: 'arqueocean', name: 'Arqueocean Arqueologia Subaquática', isHolding: false },
] as const;
export type Company = { id: string; name: string; isHolding: boolean };
export type Membership = { companyId: string; roleId: string; corporate: boolean; isHolding: boolean; permissions: string[] };
export type Principal = { id: string; name: string; memberships: Membership[] };
