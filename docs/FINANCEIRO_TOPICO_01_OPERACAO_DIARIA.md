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


## Subetapa — adiantamentos e prestação de contas

Implementação nesta continuação, sem iniciar tópico2. Não é homologação integral do Financeiro.

### Reaproveitamento e fontes

UTU main inspecionada no SHA c63ad1c260cabfb3f5276ad7db4bf3e43b68016f: client/src/pages/Adiantamentos.tsx, blob7a66e28dd84f2776f0fb9f88adb387dc70f4da41; server/routers.ts seção advancesRouter; drizzle/schema.ts cashAdvances/advanceExpenses. AdvanceForm é adaptado em client/finance/legacy/AdvanceForm.tsx, mantendo finalidade, valor/moeda, responsável, projeto, centro, conta, datas e observações. Lista/filtros/ficha/itens/recibos/estados são adaptados em FinanceAdvances. Hooks/auth/storage/URLs/tRPC e números reais não foram copiados. Nenhum legado executado. Marcador isDemo e filtro de demonstração/operacionais são preservados; não são usados como autorização; seed sintético continua limitado a banco *_demo fora de produção.

### Fluxo persistido

Solicitar → editar rascunho → aprovar solicitação e título patrimonial → registrar liberação financeira real, inclusive parcial → comprovantes privados e despesas declaradas → submeter após liberação integral → devolver para correção ou aprovar prestação → compensação e acertos pendentes → liquidação de devolução/reembolso → encerrar. Reabertura de encerramento/prestação é exclusiva de DIRETORES com concessão. Não existe botão que marque pago sem fato financeiro.

Responsável é business_parties individual vinculado à empresa, distinto de usuário autenticado; não há cadastro paralelo. Projetos/centros/contas são opcionais e canônicos. BRL/MZN separados, sem conversão. O seed acrescenta somente uma pessoa sintética vinculada à Holding para os testes; produção não recebe bootstrap/cadastro automático de pessoas.

### Dinheiro, reconhecimento e ausência de duplicidade

- Liberação é título patrimonial people/advance_out, aprovado por decisão explícita; não é despesa operacional. Nenhum dinheiro se move na aprovação. Baixas efetivas usam o mecanismo existente de caixa.
- Aprovação da prestação cria títulos de despesas por categoria/data e compensa até o total já liberado. Finance_settlements identifica advance_offset, advance_id e funding_settlement_id com FK corporativa. A compensação não cria movimento bancário e não pode ser conciliada com OFX como nova saída. Data efetiva da compensação é a maior entre despesa e liberação.
-1000 liberados e700 comprovados: despesa700 uma vez na DRE, compensação700 sem novo caixa, devolução patrimonial300 a receber. Após recebimento, saldo do caso0.
-1000 liberados e1200 comprovados: compensação1000 e200 pendentes nos próprios títulos de despesas; nenhum segundo título de reembolso. Nova baixa bancária200 encerra o acerto. Orçamento: comprometido1200 = realizado1000 + pendente200.
- Aprovação da prestação não equivale a recebimento ou novo pagamento. Vencimento do acerto é informado pelo aprovador, separado do prazo de prestação; não foi presumido prazo comercial. Não há alçadas jurídicas automáticas.
- Dashboard/relatórios/orçamento distinguem natureza patrimonial e operacional; caixa inclui somente saídas/entradas reais. Relatório por liquidação identifica compensações; extrato contém apenas movimentos efetivos.

### Integridade, revisão e documentos

Referência corporativa por documento/linha é única por empresa, inclusive após anulação: correções mantêm origem. Itens anulados permanecem no histórico; não existe exclusão destrutiva da prestação. Fechamento exige saldo financeiro zero. Prestação submetida/revisada congela itens e comprovantes. Revisão aprovada exige reabertura por diretor; acertos em dinheiro devem ser estornados antes; compensações antigas são revertidas, títulos anteriores cancelados e nova versão gera novas origens, sem duplicar caixa. Períodos encerrados impedem reconhecimento/estorno nas datas afetadas até reabertura autorizada.

Comprovantes PDF/DOCX/XLSX/PNG/JPEG são privados, validados pela biblioteca da GI (tipo real/MIME/extensão/limite/Office ativo), versionados e vinculados ao caso. Cada despesa referencia comprovante privado e evidência. Download/exportação/histórico exigem empresa, ação, concessão de adiantamentos e leitura dos tipos envolvidos, inclusive itens anulados. Sem links públicos, storage externo, OCR ou assinatura.

Permissões configuráveis advances.read/edit/approve/settle somam-se às permissões gerais e por tipo. Reabertura usa reopen (DIRETORES). Guardas são verificadas antes de replay idempotente. UTU/Vinho sem operação. Controle de revisão + lock/transação por empresa preserva atomicidade.

### Migração e testes

Migração020_finance_advances sequencial/checksum/up/down: casos, origens de despesa, arquivos e identificação das compensações. Down é teardown destrutivo opt-in do engine para ambiente isolado; remove somente dados financeiros gerados por adiantamentos, desfaz vínculos de conciliação desses fatos e limpa respostas idempotentes. Não é estorno de negócio nem procedimento de produção. Revisões de negócio usam eventos acima.

Testes: finance-advances.test.ts (centavos, alocação, DRE, caixa e orçamento); finance-advances.integration.ts (solicitação/edit/recarga, liberação parcial/integral, prova privada, correção, retorno/reembolso, revisão, permissões, moedas/IDs adulterados e exportação); browser/finance-advances.spec.ts (ponta a ponta, arquivo privado, recarga, edição, compensação, acerto, PDF/JSON e histórico, com chamadas externas bloqueadas). CI do SHA deve ser consultada na PR; código implementado não é sinônimo de teste aprovado.

### Limites ainda explícitos

Submissão de prestação exige liberação integral nesta versão; liberações parciais são registradas sem fabricar pagamento completo. Exceções de documentos, tolerâncias, alçadas por valor, parcelamento de concessões adicionais e política fiscal/contábil definitiva não foram inventados. Lista de casos ainda sem paginação; API mantém limite técnico de120 itens/caso. Rateios com referência parcial exigem chave distinta por linha; transferência de uma origem já reservada entre casos não é automática. Ajustes financeiros/datas e cancelamento em lote de séries continuam pendentes do tópico1. Homologação visual/contábil externa e produção continuam fora da entrega.

A mesma referência também é verificada contra títulos financeiros manuais/importados: uma prestação não pode reconhecer novamente documento já ativo, e um título comum não pode usar origem já reservada pela prestação. Referências diferentes para o mesmo documento exigem conciliação humana; não há inferência por descrição ou IA.
