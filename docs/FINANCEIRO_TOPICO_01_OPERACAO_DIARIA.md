# Financeiro — tópico 1: operação diária

Base: PR #10, dev/comando-06b-financeiro, cae5267a53ca052fd5f5b41312394dcf19605749. O usuário determinou entregas por tópico. Este documento não encerra o tópico1 nem o Financeiro. Sem merge/deploy, produção ou chamadas externas.

## Entrega desta subetapa

| Fluxo | Resultado | Evidência |
|---|---|---|
| Edição pela lista Todos | Mesmo formulário maduro UTU abre com o tipo real do título, salva e recarrega | finance-daily.spec.ts |
| Baixa parcial vencida | Mantém situação Parcial e saldo pendente; filtro Vencido inclui parcial aprovada em atraso | finance-daily.spec.ts |
| Pagamentos de despesas | Fixas, variáveis, pessoas e impostos:40+60 liquida100; sobrepagamento é recusado | finance-daily.integration.ts |
| Competência encerrada | Baixa/estorno afetam somente a data efetiva de caixa aberta; valor, competência e vencimento originais permanecem intactos | finance-daily.integration.ts |
| Parcelamento | Centavos insuficientes para3 parcelas são erro400; total100 permanece33.34+33.33+33.33 | finance-daily.integration.ts; finance.test.ts |
| Dados comuns de série | Descrição, observação, categoria ou conta prevista, para este/próximos ou todos os rascunhos | integração + navegador |
| Concorrência/replay | Revalida conjunto de IDs/revisões em transação, antes de gravar; idempotência preservada; concessões revalidadas antes de replay | finance-daily.integration.ts |
| Escopos | Empresa/ação/tipo; IDs de outra empresa e UTU/Vinho recusados; revogação impede replay | finance-daily.integration.ts |

A seleção de rascunhos é explícita; títulos aprovados não são devolvidos nem alterados automaticamente. Valores, datas, índices, soma e metadados de origem das parcelas são preservados. Ajustes financeiros/datas de várias parcelas e cancelamento em lote ainda não estão disponíveis; não inferir política de substituição de parcelas já aprovadas ou parcialmente pagas.

Regra de período: edição/aprovação/cancelamento do título continuam verificando competência/vencimento originais. Liquidação e estorno verificam o período da data efetiva do respectivo evento de caixa. Estorno mantém a data efetiva da liquidação; estorno em outra data/competência exige política própria e não foi implementado. Não há ordem de pagamento externa.

## Tópico1 ainda aberto — próximas subetapas

- Adiantamentos: solicitação/aprovação, concessão vinculada ao fato financeiro canônico, prazo e saldo por responsável.
- Prestação de contas: comprovantes, revisão, aprovação, devolução/reembolso, encerramento e histórico.
- Edição financeira/datas e cancelamento de séries com prévia explícita, preservando parcelas já realizadas.

A UTU contém cash_advances/advance_expenses e advancesRouter no SHA c63ad1c260cabfb3f5276ad7db4bf3e43b68016f. O código foi lido: list/get não demonstram filtro por empresa; setStatus permite estados arbitrários e marca pago sem liquidação comprovada; exclusões apagam itens e anexos usam storagePut. Esses padrões não serão portados. Campos e UX são referências reutilizáveis, com autenticação GI, provas financeiras e auditoria transacional. Não foi executado o legado.

O compêndio disponível cita acompanhamento/prestação de contas, mas não comprova alçadas monetárias, classificação contábil de adiantamentos, política de reembolso ou prazo único obrigatório. Nenhuma dessas regras foi inventada. Isso não impede as correções independentes entregues.

## Evidência e limites

Build/TypeScript locais e regressão unitária; integração MySQL isolada,19 migrações com checksum/down/up, regressão de outros módulos, Playwright e auditoria de dependências na CI do SHA publicado. Resultados e link serão registrados na PR após execução. Testes exclusivamente sintéticos. Nenhum avanço de cenários/configurações/exportação que ainda estava local foi incluído nesta entrega; está preservado na cópia de trabalho anterior para seu tópico correspondente.
