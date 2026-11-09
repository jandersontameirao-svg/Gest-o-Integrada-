# 07B — Indicadores financeiros consultáveis em Estratégia

Autorização: continuidade da consolidação entre módulos. Branch `dev/comando-07b-indicadores-estrategia`, base PR11/07A, SHA `6defb86a12a711a909886f385d80b37c84f8e808`, CI92 aprovada. PR11 e branches anteriores preservadas, sem merge/deploy, produção ou provedores externos.

## Fluxo entregue

Novo fluxo **Indicadores financeiros** dentro do Planejamento Estratégico. Consulta uma empresa, moeda, período de competência, posição e horizonte explícitos. Reutiliza financeSummary: receita líquida, EBITDA/margem, resultado líquido, saldo, recebíveis/obrigações até o horizonte e caixa projetado. Classificação incompleta torna todos os indicadores de resultado indisponíveis; caixa permanece uma visão separada. Consulta vazia na moeda/posição é identificada, sem afirmar que a empresa tem saldo real zero.

`GET /api/v1/finance/strategy-indicators?companyId=...&scopeId=scope-company:...&from=YYYY-MM-DD&to=YYYY-MM-DD&asOf=YYYY-MM-DD&horizon=90&currency=BRL` retorna schemaVersion1, filtro, métricas, fórmulas, instante da consulta e proveniência mínima. Exige from<=to<=asOf<=hoje, horizonte1–730 e moeda explícita. Recorte implícito por conta é recusado. Unidade/Holding não são aceitas como scopeId de agregação.

Leitura exige Estratégia.read e Financeiro.read/balances/todas as abas na mesma empresa. Uma leitura parcial de tipos financeiros não produz EBITDA parcial disfarçado de completo. Exportação com export=true exige também Estratégia.export e Financeiro.export; a mesma transação revalida as concessões. UTU/Vinho permanecem apenas na Estratégia. Sem banco mestre concorrente ou tabelas/migrações novas.

Reutiliza o cálculo financeiro canônico, não soma notificações/outbox, versões de OS, custos de Projetos, liquidações e títulos como fatos independentes. Consulta/exportação não escreve KPIs, strategy_facts, metas, orçamento ou planos. publishedToStrategy=false; não há atualização automática de metas ou republicação silenciosa de contribuições. Por isso não há segundo valor para ser somado à consolidação estratégica manual existente.

## Proveniência e interpretação

- Resultado por competência: títulos aprovados no período/moeda e naturezas financeiras; indicadores indisponíveis se houver títulos sem classificação.
- Caixa: saldo inicial efetivo mais movimentos canônicos na posição. Transferências internas mudam contas, preservando o total; não entram como receita/despesa operacional.
- Projeção: saldo + recebíveis pendentes − obrigações pendentes de títulos aprovados com vencimento até a posição mais o horizonte. Pagamento parcial reduz o saldo pendente, sem duplicar despesa operacional. Não é uma nova autorização de gasto ou previsão de receitas ainda não registradas.
- Detalhes: IDs/revisões/situação/valores/datas/classificações/origens dos títulos relevantes, contas com abertura/saldo e movimentos com data/valor/origem. Não devolve notas, anexos, dados de contato ou credenciais. Títulos de competência futura fora do horizonte não poluem a lista da composição.
- Histórico de unidades é contexto de proveniência; unitAggregation=false. Não se atribui um total monetário à unidade atual nem se reescreve resultado histórico após transferência.
- Origem divergente é sinalizada; a obrigação financeira permanece até decisão explícita. Um simples aviso não cancela títulos ou pagamentos.

Consulta é vigente e atualizada por comando humano, com checkedAt visível. Não é snapshot imutável do plano aprovado. Posição das liquidações respeita data efetiva, porém aprovação/cancelamento históricos dos títulos e classificação temporal completa não são reconstruídos: limitação exibida na tela e exportação. Não é demonstração fiscal ou homologação contábil.

## Interface e segurança

Reutiliza navegação e identidade SGE/GI; cálculos ficam no backend. Troca de filtros, moeda, empresa ou token oculta o resultado anterior, respostas atrasadas são ignoradas e desmontagem invalida a requisição pendente. Ausência/erro/carregamento são explícitos. JSON só é baixado após resposta autorizada. Sem polling, chamadas externas ou IA. Não há botão de publicar contribuições neste painel.

Holding/unidades exibem instrução para selecionar plano de empresa; não simulam consolidação. O usuário pode consultar cada plano empresarial autorizado, incluindo a Holding como empresa quando houver plano de seu escopo empresarial.

## Testes e evidências

- strategy-finance.test.ts: cálculos canônicos1000/400/600, abertura500/caixa900, classificação ausente, transferência sem alterar consolidado, estorno, moeda e proveniência relevante.
- strategy-finance.integration.ts: receita1000/despesa300, EBITDA700/margem70%, liquidações400/100, caixa800 e projeção1200; recarga/repetição sem strategy_facts duplicados, estorno, exportação e revogação de permissões dos dois módulos. Empresa operacional isolada; dados sintéticos.
- browser/strategy-finance.spec.ts: entrar no plano empresarial, consultar, conferir EBITDA/caixa, exportar/reabrir JSON, trocar de aba/recarregar e trocar moeda sem mostrar valores anteriores; tráfego externo bloqueado.
- Suíte preservada: TypeScript/build, unitários, MySQL antes/depois de rollback/reaplicação,23 migrações e24 jornadas de navegador, auditoria e lockfile. Resultado final por SHA e artefatos registrados na PR; presença de testes não antecipa aprovação.

## Limites e próximo incremento

Entregue **consulta financeira em Estratégia por empresa**, não a totalidade da integração estratégica. Permanecem: vínculos configuráveis de indicadores financeiros a KPIs/metas, publicação/versionamento de contribuições com aprovação, consolidação por unidade/Holding com política temporal e tratamento interempresa, câmbio explícito para resultados e regras de eliminação. Nada disso é inferido pela soma de empresas ou pela conversão de caixa já existente no Financeiro.

Homologação visual/contábil/jurídica e arquivos reais continuam conforme HOMOLOGACAO_FINANCEIRO.md. Nenhum resultado foi aprovado em nome do responsável, nenhuma IA foi ativada e nenhum dado real foi migrado.
