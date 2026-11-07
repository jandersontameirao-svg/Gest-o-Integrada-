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
