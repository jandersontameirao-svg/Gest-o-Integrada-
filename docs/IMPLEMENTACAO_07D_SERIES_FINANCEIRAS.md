# 07D — Séries aprovadas no gráfico original de KPIs do SGE

Base PR13/07C, SHA26356a46d86692e43f5a7a75c6c2cd65d4fdefa4, CI94 aprovada. Branch dev/comando-07d-series-financeiras; PRs/branches anteriores preservadas. Escopo autorizado de continuidade, em ambiente isolado e com dados sintéticos; sem merge/deploy ou provedores externos.

## Reaproveitamento funcional

O gráfico de evolução temporal de client/sge/components/KpiValoresDialog.tsx foi extraído para KpiEvolutionChart.tsx, conservando Recharts, linhas, legenda, cores, eixos e tooltip. O mesmo componente desenha a série manual original e a financeira aprovada. A tabela/formulário/histórico manual permanecem no diálogo original; não há segundo cadastro nem observação financeira fictícia na fachada do legado.

No diálogo **Lançar Valores**, o seletor **Origem da série do KPI** distingue Observações manuais e Apurações financeiras aprovadas. Modo financeiro consulta explicitamente ano/fonte/moeda, mostra gráfico e tabela exata, estado da fonte, versão/hash/unidade histórica e acesso à versão aprovada de origem; exporta JSON autorizado. Mudança de filtros oculta dados anteriores; respostas atrasadas e de contexto anterior são ignoradas.

Meses sem aprovação permanecem null/lacunas, com connectNulls=false. Zero aprovado é0.000000, distinto de ausência. Fontes diferentes no mesmo KPI não são combinadas: mês de outra fonte permanece lacuna. Moedas são separadas e devem corresponder à unidade do KPI; percentuais usam% e moeda explícita. Não há soma anual/corporativa, interpolação de lacunas ou meta inventada. Série vazia é identificada, sem gráfico de valores presumidos.

Somente a versão aprovada vigente entra em cada mês. Preparação pendente não substitui resultado; nova aprovação substitui o ponto, não soma versões. Fonte alterada/indisponível conserva o snapshot aprovado com aviso e estado por ponto. Consulta manual com checkedAt, sem promessa de sincronização instantânea. Atualizar a série busca novamente as versões aprovadas.

Números JS são usados apenas nas coordenadas visuais. Tabela, tooltip financeiro, origem e JSON usam os decimais exatos de seis casas. Corrigido também o desenho manual que convertia valor nulo em zero; o calendário manual existente não foi artificialmente expandido ou substituído por dados financeiros.

## Contrato e permissões

- GET /api/v1/strategy/financial-publications/series?companyId&planId&kpiId&from=YYYY-MM&to=YYYY-MM&currency&metricKey[&export=true]. Intervalo1–120 meses dentro do plano; exige KPI mensal e unidade/fonte/moeda compatíveis. Retorna schemaVersion1, points, availableSources, basis=approved_financial_snapshots, checkedAt, total=null, manualSeriesIncluded=false e connectMissingPeriods=false.
- GET /api/v1/strategy/financial-publications/:id/approved/:version?companyId: somente versão com status aprovado, hash verificado; currentApproved informa se outra versão foi aprovada depois da consulta. Prévia pendente neste endpoint retorna404. Não entrega o histórico inteiro ou dados pendentes ao consumidor do gráfico.
- Reutiliza a autorização conjunta e snapshot consistente07C: Estratégia.read e Financeiro.read/todas as abas financeiras. Exportação exige export dos dois módulos. UTU/Vinho continuam sem operação financeira. IDs de outra empresa/planos/KPIs e moedas incompatíveis não retornam valores.

O plano expõe apenas metadados de vínculo financeiros (ID/KPI/mês/moeda/fonte), sob autorização da Estratégia, sem valores/snapshots. Isso permite bloquear a edição manual da competência vinculada mesmo sem acesso financeiro. O fluxo de preparação atualiza esses metadados; o backend continua sendo a barreira obrigatória contra observação/publicação concorrente. A fachada manual kpiValores recebe exclusivamente strategy_entries; nenhuma apuração financeira é injetada nela.

## Provas preparadas

- financial-series.test.ts: calendário, limite120, lacunas, zero, fontes/moedas, precisão, versão/unidade histórica e rejeição de dois resultados para mesmo KPI/mês/moeda; adaptador visual não transforma null/NaN/vazio em zero.
- financial-series.integration.ts: Janeiro aprovado1000 com prévia800 pendente; Fevereiro Receita300, que não entra no gráfico EBITDA; Março EBITDA zero; Abril observação manual999, ausente na série financeira. Aprovação800 substitui Janeiro1000 sem soma. Consulta/recarga não cria versões. Origem pendente negada, histórico aprovado preservado, permissões/empresas/exportação/datas/unidades verificadas.
- Fixture compartilhada financial-series-fixture.ts usa somente APIs canônicas e dados sintéticos, com persistência real; não simula gravação nem executa legados externos.
- browser/financial-series.spec.ts: diálogo original/manual999, bloqueio de edição na competência financeira, seleção de origem, gráfico/tabela, lacunas/zero, aprovação e recarga800, origem e JSON reaberto, erro de moeda sem dados antigos.

Build/TypeScript e127 unitários locais aprovados. CI deve comprovar185 testes MySQL duas vezes,24 migrações/checksum/rollback/reaplicação,26 jornadas de navegador, auditoria e lockfile. Resultado por SHA e artefatos na PR, sem aprovação antecipada ou homologação humana.

## Limites

Nenhuma tabela/migração ou regra financeira nova. Aprovação, reabertura, unidade histórica e snapshots continuam07C. Gráficos corporativos de totais, eliminações, câmbio de resultados, metas mensais específicas da fonte financeira e revogação/desvinculação de apurações continuam etapas próprias; não foram inferidos a partir de consultas. Não soma caixa, custos operacionais e resultado como fatos independentes.

O snapshot financeiro conserva o que foi aprovado, com limitações de reconstrução histórica já documentadas. Não foi acessada produção, importado histórico real, alterado o aplicativo SGE original ou ativado IA/ATENA/Manus/serviços externos. Entrega é revisável, não homologação contábil nem implantação.
