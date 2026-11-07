# 05G — Consolidação operacional de Fornecedores e transição

Base: `3a2e75c8a38da382258938e95cc75403c9818852`, PR #9 em rascunho, branch de Fornecedores. O pedido de continuidade autoriza desenvolvimento; não autoriza merge, deploy, integrações externas ou aprovação comercial de registros reais.

## Entrega desta rodada

Revisão de execução validada com proposta, edição/rebase, submissão, aprovação, aplicação, devolução, cancelamento, histórico e exportações JSON/PDF autenticadas. A validação original continua intacta. A nova posição é uma versão compensatória, com delta, autoria, justificativa, evidência, revisão da OS e data de registro. O valor atual substitui a posição anterior; nunca é somado a ela. Termos/preços contratados, empresa, fornecedor e identidade da OS não são reescritos.

Rateio explícito entre atividades e projetos da mesma empresa, na mesma moeda, sem novo mestre e sem livro financeiro. Cada parcela conserva origem canônica, data efetiva, competência, projeto, atividade, valor e unidade histórica. Diárias admitem frações entre atividades/projetos desde que a soma conserve exatamente cada diária na data original; mínimo contratual permanece origem separada. Mensal/entrega exigem distribuição expressa, sem pró-rata inventado. Zero integral admite parcelas vazias com compensação auditada. Não há rateio interempresa ou conversão cambial automática.

Aplicação refaz autorização, revisão, orçamento de todos os projetos afetados, limites por atividade, teto contratual e períodos. Mudança de contrato/orçamento/unidade exige rebase e nova aprovação. Duas propostas da mesma revisão não podem sobrescrever uma à outra. Concessões de Fornecedores e Projetos são exigidas, inclusive nas leituras/exportações e antes do replay idempotente. UTU/Vinho continuam somente na Estratégia.

Boletins vigentes impedem corrigir sua origem: cancelar/estornar exige decisão explícita no fluxo existente. Nenhuma elegibilidade financeira é apagada pelo ajuste. Boletins antigos preservam revisão de origem e histórico; novas medições usam a posição e a vigência efetiva atuais. Índice de diárias é atualizado transacionalmente, preservando fatos anteriores no histórico da OS. Encerramento contratual exige resolver propostas de execução pendentes.

Projetos calcula saldo por alocação canônica, inclusive quando o custo da OS é distribuído a outro projeto da mesma empresa. A origem da OS não é materializada novamente. Registros sem rateio preservam o comportamento anterior. Transferência posterior de unidade não altera as parcelas já aprovadas. Eventos antigos e novos continuam sem despacho externo e inelegíveis para soma monetária automática em Estratégia; um consumidor futuro deve selecionar a última revisão por OS, respeitar moeda e somar apenas as suas parcelas, nunca todas as versões ou o delta com o snapshot.

Painel de avaliações por prestador: busca, filtro de estado, quantidade, média e ranking a partir dos mesmos registros canônicos. Avaliações anuladas são identificadas e excluídas das médias. Formulários, cinco critérios e componentes do legado permanecem reutilizados.

## Persistência e rollback

Migração 016 cria propostas/histórico/cache próprios, com sequência/checksum no runner existente. Versões aplicadas ficam no payload canônico 010 e em seu histórico/outbox transacional. Down 016 remove propostas/cache/histórico específico, mas não desfaz aplicações de negócio. Exige backup de propostas antes de rollback fora dos testes. Reaplicação não recria decisões nem devolve cache fantasma. Teto técnico: 100 versões por OS e 500 parcelas por proposta; não representa alçada comercial.

## Rastreabilidade e validação

| Capacidade | Implementação | Prova |
|---|---|---|
| Compensação/rebase/concorrência | `execution-router.ts`, `execution.ts` | `suppliers-execution.integration.ts` |
| Conservação de centavos, diária fracionada, zero e ausência de dupla contagem | `execution.ts`, `operations.ts`, `project-costs.ts` | `suppliers-execution.test.ts` |
| Original versus atual, formulários, recarga, edição, decisões, histórico, PDF/JSON | `ExecutionWorkspace.tsx` | `browser/suppliers-execution.spec.ts` |
| Painel sem segundo cadastro | `dashboard.ts`, `ReviewsWorkspace.tsx` | unitários e mesma jornada Playwright |
| Escopo/IDs/UTU/Vinho, rollback/reaplicação, boletins e períodos | mesmos endpoints GI | MySQL isolado e regressão integral |

Build e TypeScript estrito verificados localmente. CI usa npm ci, unitários, MySQL isolado duas vezes, migrations/checksum/up/down, Playwright, lockfile e auditoria de dependências; resultados e artefatos por SHA são registrados na PR. Testes exclusivamente sintéticos, com chamadas externas bloqueadas no navegador. Nenhuma fonte privada ou dado de produção publicado.

## Critérios de transição

- Cadastro e identidade únicos; contrato/OS/boletins/avaliações/documentos/textos/aditivos persistem e respeitam escopo.
- Reserva não gera custo; mobilização gera compromisso; validação gera realizado operacional; revisão compensa sem apagar a origem.
- Integração canônica com Projetos, histórico de competências/unidades e contratos internos documentados.
- Regressão completa verde no SHA entregue; PR aberta, sem merge/deploy.

Atendidos esses critérios, a primeira versão operacional permite avançar de fase. Isso não declara paridade integral de todas as variantes do legado nem homologação jurídica/visual ou prontidão para produção.

## Exceções explícitas e melhorias futuras

1. Contrato/projeto encerrado e período fechado exigem reabertura formal; a revisão não contorna esse estado. Reabertura de competência existente continua exclusiva de diretor autorizado. Reabertura contratual não foi inventada.
2. Atividade com fatos próprios validados exige conciliação explícita antes de receber custo de OS; o sistema bloqueia a soma ambígua. Rateio interempresa e conciliação desses fatos exigem tratamento próprio de autoridade/origem.
3. Alteração de preço/termos depois da mobilização continua exigindo instrumento contratual apropriado; correção de execução não é um aditivo financeiro disfarçado. Execução em curso segue desmobilização/validação existente antes da revisão compensatória.
4. Fidelidade gráfica integral Word, dashboard corporativo multiempresa, boletim multi-OS, paginação de grandes volumes e variantes avançadas cadastrais permanecem melhorias. Não foram eliminadas nem declaradas portadas.
5. Alçadas, poderes de representação, faturabilidade e política jurídica definitiva seguem decisões humanas/concessões/evidências existentes; nenhuma aprovação automática foi criada. Compêndio atual permanece base autorizada, sem bloqueio por revisão final.
6. MFA, recuperação de contas e preparação operacional de produção pertencem ao endurecimento antes de produção; não são substituídos por CI verde.

## Próxima fase

Preparar Gestão Financeira a partir de auditoria e fontes autorizadas: autoridade única de títulos, pagamentos, recebimentos e liquidação; consumir origens canônicas sem transformar validação/boletim em recebimento ou duplicar custo. Definir competência, idempotência, estornos e reconciliação de revisões antes de ativar qualquer integração. Permanecem vedados merge, deploy e conectores externos sem autorização específica. Nenhuma implementação financeira foi iniciada nesta rodada.
