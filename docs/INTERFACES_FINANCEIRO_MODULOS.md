> Atualização07C: apurações mensais financeiras vinculadas a KPIs têm preparação, aprovação por diretor, snapshots/hash, histórico e consulta de contribuições por unidade histórica/Holding. Total monetário permanece bloqueado, sem somar contribuições manuais. Ver IMPLEMENTACAO_07C_PUBLICACOES_FINANCEIRAS.md.

> Atualização07B: consulta financeira por empresa em Estratégia implementada, sem publicação ou consolidação monetária automática. Ver IMPLEMENTACAO_07B_ESTRATEGIA_FINANCEIRO.md.

> Estado07A: a consulta inversa nas telas de Contratos/Fornecedores/Projetos foi implementada; ver IMPLEMENTACAO_07A_INTEGRACAO.md. As descrições06B abaixo são históricas. Adiantamentos/rateios/câmbio evoluíram no próprio Financeiro, conforme ENCERRAMENTO_PENDENCIAS_FINANCEIRO.md; não foram ativados provedores externos ou consolidação monetária automática em Estratégia.

# Interfaces internas — Financeiro v1 (06B)

## Autoridades

| Entidade/fato | Autoridade | Financeiro |
|---|---|---|
| Empresa/unidade/usuário/permissão | Core/Governança GI | Reutiliza; UTU/Vinho somente Estratégia |
| Pessoa/cliente/fornecedor | business_parties + vínculos oficiais | Referencia IDs, não cria contatos paralelos |
| Contrato de cliente/marco/medição | Contratos | Prepara recebível por medição faturável com decisão explícita |
| Projeto/atividade/orçamento/execução | Projetos | Vínculo opcional; não replica orçamento nem cria fato de custo |
| Contrato de prestador/OS/boletim | Fornecedores | Prepara obrigação por boletim faturável; não emite OS |
| Título/baixa/estorno/transferência/caixa | Financeiro | Autoridade única; registra fatos, não envia ordens bancárias |
| Objetivos/indicadores | Estratégia | Consumidor futuro, sem somar custos/caixa como fatos equivalentes |

## API implementada /api/v1/finance

- GET catalog/snapshot: contexto autorizado, concessões, cadastros e títulos por aba legível.
- POST accounts/categories/dimensions: cadastros financeiros específicos, concessão governance.
- POST titles: rascunho manual ou série finita; projeto/contrato opcionais. PUT titles/:id: somente ocorrência rascunho manual, CAS.
- POST titles/:id/decisions/approve|return|cancel|reconcile: decisão explícita; conciliação busca novamente a origem e retorna a rascunho, sem baixa ativa.
- POST titles/:id/settlements: valor incremental, conta/moeda/data/competência verificadas, revisão do título e concessão settle + aba.
- POST settlements/:id/reverse: movimento inverso auditado, sem exclusão da baixa original.
- POST transfers e transfers/:id/reverse: dois lados na mesma transação, mesma empresa/moeda, sem receita/despesa.
- POST periods/close|reopen: CAS; reabertura exige DIRETORES e concessão.
- POST sources/supplier-measurements/:id e sources/customer-measurements/:id: origem faturável e vigente → preparação humana de rascunho. Não depende de evento automático ainda não aprovado.
- GET titles/:id e GET positions?originKey=...: posição canônica autorizada, título/paid/pending/settlements/originStatus; não retornam documentos privados da origem.
- GET titles/:id/history e titles/:id/export?format=json|pdf: trilha/exportação com controle de acesso.
- GET summary: datas/câmbio explícitos, títulos permitidos, fórmula central. Não há consolidação automática BRL/MZN.

## Protocolo de escrita

companyId + requestId UUID + reason; revision nas entidades alteráveis; evidence nas decisões. Hash inclui método, rota e corpo. Repetição idêntica retorna o resultado sem criar novo fato; chave reutilizada para outro conteúdo conflita. Autorização antecede cache. ID de outra empresa falha sem gravar.

Chaves canônicas: supplier_measurement:<id> e customer_measurement:<id>, únicas por empresa. Alteração da origem não libera criação de um segundo título para o mesmo fato. Conciliação modifica a mesma posição, preserva histórico e exige nova aprovação. Origem cancelada deve ser resolvida por cancelamento/estorno financeiro explícitos, conforme existência de baixas. Nova liquidação fica bloqueada com origem divergente.

## Eventos locais

module_event_outbox: finance.<entityType>.<action>.v1, com eventId, companyId, entityId, entityRevision, ator/correlação e escopo de unidade do evento. São notificações de alteração; consumidor autorizado busca a posição canônica. Não somar notificação com custo operacional. externalDispatchEnabled=false, strategyConsolidationEligible=false. Não há fila externa, integração bancária ou credencial de serviço implícita.

## Ainda especificado / não integrado

Compras gerais, adiantamentos/prestações de contas, rateios financeiros/interempresa, regras de câmbio, jobs recorrentes e consumo de indicadores precisam de contratos específicos antes da ativação. Projetos conserva seu número único/IDs; Fornecedores conserva sua OS e snapshots de rateio. O Financeiro não altera retroativamente seus resultados.

A posição financeira existe por API, mas as telas reversas de Projetos/Fornecedores ainda exigem adaptação autorizada de leitura. Não apresentar campos antigos de liquidação desconhecida como se já estivessem conectados. Nenhuma regra comercial de alçada/faturabilidade foi inventada.

Conclusão operacional do contrato de cliente não quita nem impede a preparação de recebível de medição faturável. Cancelamento da origem exige decisão financeira explícita. Moeda é revalidada na origem e não pode ser reinterpretada pela conciliação.


## Consulta inversa07A v1

GET /api/v1/finance/origin-position?companyId=...&kind=customer_measurement|supplier_measurement&sourceId=UUID. Exige acesso financeiro à aba e leitura da origem/contrato ou OS/projeto. Snapshot consistente, auditoria de leitura, projeção mínima sem anexos/contas/notas. position=null significa título não preparado; não significa liquidação zero. Retorna posição vigente, origem/revisão/estado, checkedAt e invoicingStatus=not_tracked. Atualização explícita pelo usuário; sem polling. Reutilizado nas telas canônicas e no espelhamento existente em Projetos, sem duplicar títulos ou eventos.


## Indicadores para Estratégia07B v1

GET /api/v1/finance/strategy-indicators, com empresa/scope-company correspondente, moeda, from/to/asOf e horizonte explícitos. Mesmas fórmulas canônicas do Financeiro; leitura conjunta de Estratégia e de todas as abas financeiras/balances. Exportação exige export nos dois módulos. Sem escrita em contribuições estratégicas/outbox, unitAggregation=false e publishedToStrategy=false. Identifica classificação ausente, consulta vazia e origens divergentes. Mantém resultado por competência separado de caixa/projeção. Consolidação monetária de unidade/Holding e mapeamento a KPIs não estão implementados neste incremento.


## Publicações financeiras estratégicas07C v1

/api/v1/strategy/financial-publications: vínculo canônico empresa/plano/KPI/indicador/fonte/competência/moeda, versões imutáveis e posição aprovada única. Preparação/approve/reject e histórico com revisão, requestId, hash, motivo/evidência e autorização conjunta. Não altera fatos financeiros. /strategy/consolidation inclui financialContributions separado (total=null), com unidade histórica preservada. Rotas manuais impedem publicação concorrente da mesma competência/indicador. Soma monetária, eliminações e câmbio para resultado não são ativados.
