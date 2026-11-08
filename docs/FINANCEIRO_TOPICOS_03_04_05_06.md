# Financeiro — rodada dos itens 3, 4, 5 e 6

Autorização: “Siga com o item3,4,5,6”. Base validada bfe9db6053f6ac8f73fb978fcb7e1017cc579b6b, PR10, CI77 aprovada. Os tópicos1 e2 e seus testes são preservados. Organização desta rodada:3 intercâmbio/conciliação;4 relatórios;5 orçamento/cenários;6 configurações. Não equivale à conclusão integral do Financeiro.

## 3 — Importação, exportação e conciliação

Reaproveitamento: parseTitleFile/parseOfx, FinanceImports e origens/lotes já presentes na GI. Rascunho privado anterior de exportXlsx foi revisado e incorporado; o router antigo não foi copiado sobre a versão validada.

- Modelo estrito continua compatível. Novo mapeamento explícito de colunas CSV/XLSX, com formulário operacional, nomes de origem, campos opcionais e padrões de tipo/moeda. Nenhuma resolução automática de homônimos ou novo cadastro mestre.
- Datas ISO, DD/MM/AAAA e serial Excel1900 escolhidos explicitamente; o dia fictício60 é recusado. Valores decimais com ponto ou vírgula escolhidos explicitamente, sem inferência silenciosa.
- Hash da prévia inclui o arquivo e o mapeamento/padrões/formatos. Alterar uma regra exige nova prévia. Commit revalida escopos, IDs, competências, duplicidade e saldo/contagem do lote atomicamente. Mapeamento preservado no lote; namespace e externalId continuam estáveis.
- Exportação de títulos CSV/XLSX/JSON por empresa, moeda, conta e competência, com bucket.read e finance.export. XLSX armazena texto literal (sem fórmulas). CSV protege células com prefixos de fórmula. Exportação respeita limite técnico de10000 títulos; importação permanece limitada a500 linhas por lote.
- CSV/XLSX são intercâmbio de cadastros, não backup nem restauração de liquidações, parcelamentos, tags ou histórico completo. JSON inclui o cadastro e proveniência, mas também não é ensaio de recuperação integral.
- OFX e conciliação manual permanecem no serviço canônico existente, com FITID, revisão, moeda, conta e evidência; não cria pagamento automaticamente. A regressão do importador/conciliação original continua na CI.

Limites: somente UTF8 no OFX; não suporta transferências/taxas/agrupamentos na conciliação; calendário Excel1904 não aceito; não existe conector Zenply ativo/API contratada comprovada. Importação de pagamentos históricos e ensaio completo de transição continuam pendentes, sem dados reais. Não trocar namespace para contornar duplicidade de um mesmo fato.

## 4 — Relatórios e análises

Mantidos os20 relatórios/filtros/regimes/CSV/PDF/drilldown da GI e a estrutura de gráficos adaptada de AnaliseHistorica.tsx do Arqueo Financeiro992e3f01, sem reintroduzir seus erros de cálculo/auth. Acrescentada exportação XLSX a partir do mesmo resultado autorizado, com empresa/moeda/período/avisos.

Performance mensal passa a mostrar dias distintos; performance anual mantém meses. Ranking das10 maiores despesas/receitas e distribuição das despesas por categoria usam fatos únicos e centavos, com IDs para detalhamento. Totais não somam grupos sobrepostos. Compartilhamento percentual tem base explícita e fica indisponível sem denominador. Na tela, ranking de despesas e distribuição têm drilldown para os títulos. Comparativos prévios e inadimplência continuam disponíveis.

Saldos anterior/final e variação de caixa vêm dos movimentos, não de previsão/competência. Regime dos rankings e dos saldos são identificados separadamente. Não há conversão de BRL/MZN nem soma de moedas. Gráficos usam números aproximados somente para desenho; tabelas/cálculos usam decimais exatos.

Limites: demais melhorias de UX e homologação visual do inventário Zenply permanecem específicas; não há homologação contábil/fiscal ou provas de todos os comportamentos reais do SaaS.

## 5 — Orçamento, caixa projetado e cenários

Reaproveitado o orçamento GI existente: categoria/período/moeda, rascunho/edição/aprovação, revisões imutáveis, premissas e proposta determinística pelo histórico aprovado do ano anterior. Nova posição das liquidações na comparação impede contar como realizado um pagamento posterior à data escolhida.

Comprometido total = realizado + pendente; disponível = planejado − comprometido. Não somar comprometido e realizado como duas despesas. Teste1000 comprometidos,400 liquidados,600 pendentes,1200 planejados resulta disponível200. Compensações de prestação continuam liquidações sem segunda saída de caixa; adiantamento patrimonial não é despesa operacional duplicada.

Rascunhos de ScenarioData/projectScenario/FinanceScenarios reaproveitados após revisão. Novo cadastro de cenários na GI, por empresa/moeda, posição/horizonte e premissas. Ajustes datados e descritos são hipóteses adicionais: não substituem títulos existentes nem autorizam sua duplicação. Gravação, recarga, edição por revisão/CAS e histórico persistem em banco/auditoria. Base é recalculada com fatos atuais e explicitamente identificada como viva. Cenário não cria título, pagamento, liquidação ou lançamento.

Limites: posição das liquidações não reconstrói estados históricos de aprovação/cancelamento dos títulos. Não somar orçamento empresarial com orçamento operacional de Projetos ou analítico de Estratégia. Rateio corporativo avançado, consolidação cambial/interempresa e um ensaio de homologação de resultado por projeto/contrato continuam pendentes. Filtros existentes permitem consultar valores vinculados, sem inventar alocações.

## 6 — Configurações, preferências e controles

- Contas/categorias/centros/tags: renomear, arquivar/restaurar, CAS, idempotência e auditoria; exige governance e leitura dos tipos financeiros. Identidade e referências são mantidas. Natureza, tipo, moeda, saldo/data inicial não podem ser reescritos por esse endpoint, preservando interpretação dos fatos históricos. Para natureza diferente, criar categoria apropriada e revisar vínculos explicitamente.
- Cadastro arquivado permanece consultável no histórico. Reutilização depende de restauração; não se apagam títulos nem documentos. Nomes correntes podem aparecer nos relatórios; versões anteriores do nome ficam na auditoria, sem alegar catálogo temporal completo.
- Preferências pessoais por empresa/usuário: moeda, horizonte e antecedência de alertas, com revisão e histórico. Moeda/horizonte são aplicados ao abrir o Financeiro; não mudam títulos, saldos ou câmbio.
- Alertas internos consultáveis de vencidos/a vencer usam saldo pendente, respeitam bucket.read e a antecedência. Não enviam email/WhatsApp ou notificações externas.
- Tela de auditoria paginada usa o endpoint existente com governance e todos os tipos financeiros. Bloqueio/reabertura de competência mantém os mecanismos anteriores e sua regressão.

Migração022 cria cenários/preferências; checksum e down pelo mecanismo GI, exclusivamente no banco descartável. Histórico permanece em finance_history/outbox; não há despacho externo.

## Matriz de evidências

| Item | Evidência | Critério de aceite do incremento |
|---|---|---|
|3 | finance-final.test/integration; browser/finance-final.spec; regressão finance-imports | Mapeamento,1234,56, serial, prévia/hash, importação real, replay/deduplicação, exportação literal |
|4 | finance-final.test/integration; browser/finance-final.spec; finance-planning | Performance diária, soma/ranking/distribuição, filtros, XLSX e detalhamento |
|5 | finance-final.test/integration; browser/finance-final.spec; regressão finance-planning |1000/400/600, data, cenário salvar/recarregar/editar/histórico sem caixa |
|6 | finance-final.integration; browser/finance-final.spec | CAS, arquivo/restauro, natureza imutável, preferências/alertas/auditoria e negativas de empresa/perfil/UTU/Vinho |

CI deve executar TypeScript/build, unitários, MySQL antes e depois de rollback,22 migrações up/down/checksum, Playwright e npm audit. Resultado por SHA na PR10; a presença de testes não significa aprovação antes da execução. Evidências somente sintéticas. Sem merge/deploy/produção, APIs externas, IA, Clicksign, Manus ou ATENA OS.

## Pendências reais para etapas posteriores

Ensaio integral de histórico/baixas e recuperação; conciliação avançada; catálogo legal/variáveis Zenply ausentes; homologação visual/contábil; rateios; moeda/câmbio/interempresa e políticas comerciais/jurídicas pendentes. IA externa não ativada. Não se declara esses itens concluídos nem se condiciona o uso das partes independentes a decisões ainda abertas.
