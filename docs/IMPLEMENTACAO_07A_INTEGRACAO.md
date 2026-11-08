# 07A — Consolidação integrada, incremento1

Autorização: continuidade aprovada para consolidar Contratos → Projetos → Fornecedores → Financeiro → Estratégia. Branch `dev/comando-07a-integracao`, baseada em `dev/comando-06b-financeiro`/PR10, SHA `35cb262fcd5432e3f8d40e394976694020df4349`, CI88 aprovada. A PR10 e as branches anteriores não são alteradas. Não há merge/deploy, produção ou serviços externos.

## Incremento funcional

A lacuna comprovada era a consulta inversa: o Financeiro tinha posição por origem, mas Contratos e Fornecedores ainda exibiam “indisponível”. Implementado `GET /api/v1/finance/origin-position?companyId=...&kind=customer_measurement|supplier_measurement&sourceId=UUID`.

A consulta usa snapshot consistente e exige acesso financeiro à empresa/aba e leitura da origem. Para cliente exige acesso ao contrato, inclusive regras de participantes; para prestador exige leitura de Fornecedores e do projeto/atividade canônicos pela mesma validação da OS. A existência de título não concede acesso. UTU/Vinho continuam negadas na operação. Concessões são revalidadas em cada consulta, sem cache de respostas concluídas.

Resposta v1 mínima: empresa, origem/revisão/estado, instante da consulta; posição com ID/revisão/estado do título, moeda, valor, liquidado, pendente e saúde da origem. Não devolve contas bancárias, notas, métodos de pagamento, anexos ou liquidações individuais. Origem autorizada sem título retorna position=null; não simula pagamento zero. Faturamento fiscal permanece not_tracked. Consulta não prepara/aprova/liquida títulos, não cria custo e não despacha eventos externos.

O componente compartilhado aparece por medição em Contratos e por boletim em Fornecedores, inclusive no espelhamento existente em Projetos. Consulta somente por comando explícito, sem polling ou uma chamada por linha ao abrir a tela. Atualização após baixa/estorno é explícita; instante visível evita sugerir sincronização ao vivo. Troca de usuário/empresa/origem/revisão invalida o resultado visual e respostas atrasadas são ignoradas. Origem revisada mantém a posição existente e informa necessidade de reconciliação financeira.

Sem novas tabelas ou migrações. Usa títulos/baixas/IDs canônicos e auditoria de leitura existentes. Comprometido/realizado operacional da OS e liquidado financeiro continuam conceitos distintos e não são somados.

## Estado do fluxo integrado

| Trecho | Autoridade e estado desta rodada | Evidência/limite |
|---|---|---|
| Contrato → projeto | Referência única/autorização prévia existentes, preservadas | Regressão contracts-03d/projects; não muda alçadas |
| Projeto → prestador/OS | Backend/componentes canônicos compartilhados existentes | Regressão suppliers; sem outro mestre ou OS |
| Execução → medição faturável | Fatos operacionais e elegibilidade existentes | finance-sources.integration.ts; não é pagamento |
| Medição → título | Preparação humana/idempotente existente | Mesma origem/título, aprovação financeira separada |
| Financeiro → origem | **Novo: posição autorizada consultável nas telas** | Unidade, integração e duas jornadas E2E; sem faturamento fiscal inferido |
| Financeiro → Estratégia | **Ainda não implementado como consumidor monetário** | Outbox notifica, não autoriza somar versões/custos/caixa. Próximo incremento exige indicadores e fórmulas/proveniência explícitos |

## Validação e rastreabilidade

- `shared/finance/origin-position.ts`: projeção por lista explícita de campos;3 unitários de1000/400/600, ausência, estorno e exclusão de detalhes privados.
- `server/finance/router.ts`: endpoint por origem com snapshot consistente, permissões e auditoria.
- `tests/finance-sources.integration.ts`: posição parcial real, nenhuma escrita por consulta, origem alterada, IDs/empresa/UTU/Vinho e revogação/restauração de permissões financeiras, Contratos, Projetos e Fornecedores.
- `client/shared/FinancialOriginPosition.tsx`: consulta/erro/ausência/recarga e isolamento visual.
- `tests/browser/integration-finance.spec.ts`: origem cliente sem título → recebível único → baixa200 de500 → consulta na tela → estorno → recarga0/500.
- `tests/browser/integration-project-finance.spec.ts`: fixture canônica de OS/boletim → pagamento100 de400 → posição100/300 no espelhamento de Projetos, mesmo ID financeiro.

Fixtures sintéticas reaproveitam o cenário de finance-sources, sem executar aplicativos originais. Jornadas separadas preservam contextos operacionais e o limite120/min; nenhum aumento de limite, retry silencioso, espera para contornar bloqueio ou teste desabilitado. Build/117 unitários verificados localmente. Integração MySQL, regressão completa, rollback/reaplicação, navegador e auditoria devem ser comprovados no SHA final da PR; existência dos testes não antecipa aprovação.

## Continuidade

1. Consolidar indicadores autorizados para Estratégia, com moeda/período/fonte e sem somar revisões ou confundir custo com caixa.
2. Verificar cobertura dos percursos completos e exceções entre módulos, mantendo suas autoridades.
3. Homologação humana, arquivos reais e infraestrutura/transição permanecem etapas próprias conforme HOMOLOGACAO_FINANCEIRO.md. Esta rodada não declara o produto integralmente concluído ou homologado.
