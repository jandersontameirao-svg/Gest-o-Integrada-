# 08E — Relatórios especializados de Projetos

Base validada: PR #18, `dev/comando-08d-relatorios-projetos`, commit `f6408e4231256fb1a61117a13c4dce3254b6bb9f`, CI 109 aprovada. Branch própria, dependência empilhada, sem merge/deploy ou alterações nas branches anteriores. IA continua desligada por decisão do usuário.

## Entrega funcional e origem

Ampliação da mesma tela de relatórios e do mesmo armazenamento imutável 08D, sem segunda biblioteca ou novo cadastro. Fontes originais conferidas byte a byte com o ZIP `14a3d081ec9efe179bb8cc17ae74dc2a74dd7d325b457e97ace7f1001ce9ede1`:

- `exportGanttToPDF` e `exportSprintReportToPDF`, de `client/src/lib/export-utils.ts`: preservados dados de atividade/data/progresso/dependência e sprint/objetivo/período/pontos, adaptados para autorização e geração no servidor.
- `client/src/pages/Reports.tsx`: navegação/seletor/filtros e formatos continuam na tela adaptada em 08D.
- Composição Recharts de `client/src/pages/Scrum.tsx`, já portada em `legacy/Scrum.tsx`: reaproveitada no burndown de leitura, com `connectNulls=false` e sem interpolação de resultados ausentes.

O ZIP não comprova um exportador maduro específico de orçamento: essa capacidade usa os cálculos canônicos da GI (`budgetSummary` e `allocatedOrderCosts`), não é apresentada como cópia de código financeiro inexistente na fonte. Identificadores e hashes constam em `PARIDADE_04B_PROJETOS.json`.

## Comportamentos e critérios

| Relatório | Comportamento implementado | Critério/teste |
|---|---|---|
| Gantt | Datas salvas, esforço, progresso declarado, fase, dependências/lag e revisão; prévia CPM completa com calendário canônico, datas calculadas, folgas e criticidade em colunas distintas | Gerar sem alterar projeto; feriados/FS; filtro inclusivo sem amputar o grafo; tabela, gráfico de barras no navegador/PDF e JSON com revisão do calendário |
| Sprint | Objetivo, estado, período planejado/efetivo, atividades/pontos, baseline, mudança de escopo, observações reais e burndown | Zero observado permanece zero; lacuna é indisponível; nenhuma velocidade presumida; fechamento observado informa pontos concluídos; sprint de outro projeto é negada |
| Orçamento | Original, atualizado, comprometido pendente, realizado validado, saldo por atividade/projeto, revisões e origens OS/fatos | Cálculo decimal canônico, reserva zero; não somar compromisso e realização da mesma OS como custos independentes; nova revisão não reescreve emissão anterior; orçamento ausente não vira zero |
| Arquivos | PDF com tabelas/gráficos, CSV, XLSX textual e JSON da mesma emissão | Bytes reais e valores conferidos; downloads reautorizados; checksum e auditoria por ID da emissão |

Gantt usa barras das datas **persistidas**; a prévia CPM é explicitamente planejamento, não modificação automática ou promessa de prazo. Pais aparecem, mas os totais de contagem/fases consideram folhas. São mostradas dependências entre atividades exibidas; o cálculo conserva o grafo inteiro. O detalhamento por fase é tabular; um painel gráfico agregado avançado por fase não é declarado entregue.

Scrum usa `sprintBurndown` e observações existentes 08A. A última observação do dia UTC é a referência do ponto diário, sem preencher dias vazios; ideal é linha de planejamento. Pontos concluídos são informados somente quando a sprint está encerrada e a última observação corresponde ao fechamento. Não se infere previsão de velocidade. O intervalo filtra as datas planejadas das tarefas e o registro UTC das observações; baseline/metadados permanecem identificados como posição da sprint inteira.

Orçamento é posição na emissão, sem reconstrução histórica. **Filtros de datas são rejeitados**, em vez de apresentar posição atual como saldo de competência passada. Moeda única do projeto, sem câmbio ou consolidação entre empresas. Fontes incompatíveis bloqueiam a emissão. Não há novo livro financeiro, título, pagamento ou recebimento. Valores das seções de origem já integram os totais e não devem ser somados novamente.

## Persistência, segurança e consistência

Reutilizada a migração 028 e os endpoints 08D. Novos tipos: `gantt_schedule`, `scrum_sprint`, `project_budget`. Todos exigem projeto explícito; sprint exige `sprintId` pertencente ao mesmo projeto. Catálogo autorizado de sprints: `GET /api/v1/projects/reports/sprint-options?companyId=…&projectId=…`.

Geração mantém transação, bloqueio do projeto, ledger idempotente, autorização de leitura/exportação e checksum JSON canônico. Leituras de calendário, observações, orçamento e custos usam a mesma conexão. O leitor de custos adicionado em `server/suppliers/project-costs.ts` reutiliza `allocatedOrderCosts`, com bloqueios compartilhados das OS em ordem de ID até o commit, incluindo revisão/estado/moeda das origens. Não modifica cálculos/estado de Fornecedores; conflito de concorrência mantém o rollback/409 do mecanismo existente. A pequena exportação da função de leitura de observações em `server/projects/scrum.ts` não altera a regra Scrum.

Orçamento sem histórico preserva campos desconhecidos e ainda pode mostrar fatos validados conhecidos. Atividades sem alocação e origens cujos IDs não resolvam não são silenciosamente descartadas. Revisões orçamentárias e origens ficam identificadas; histórico antigo continua legível com seu checksum, mesmo após revisão do projeto.

Sem migração nova ou alteração de dados produtivos. Limites explícitos: até 5.000 registros de projeto, 5.000 OS/parcelas canônicas, 1.000 revisões orçamentárias e 10.000 linhas totais do relatório com seções. Excesso é rejeitado antes de gravar, sem truncar registros ou simular sucesso. Limites adicionais do calendário 08B permanecem aplicáveis.

Downloads continuam privados e revalidam empresa, projeto e ação, inclusive depois de revogação de concessão. UTU/Vinho permanecem negadas na operação. Auditoria acrescenta identificação da emissão na criação e em cada formato baixado, mantendo os eventos genéricos existentes. CSV neutraliza fórmulas; XLSX não contém fórmulas ou vínculos externos; PDF não executa HTML nem carrega recursos remotos.

## Verificação

158 testes unitários locais e TypeScript/build aprovados. Novos testes MySQL cobrem fontes persistidas, sprint encerrada/zero observado, orçamento original/revisado/fato validado, comparação com posição canônica, formatos reais, imutabilidade, concorrência idempotente, moeda/escopo/IDs, revogação e ausência de efeito financeiro. Playwright usa fixtures sintéticas pela API autorizada local e a interface real para gerar, baixar, consultar histórico e regenerar após revisão do teto, com screenshots e bloqueio de tráfego externo.

Integração MySQL/Playwright e auditoria completa serão confirmadas na CI da PR; não se considera o build local prova de homologação. Mantidos os 28 pares de migrações, rollback/reaplicação, toda a regressão anterior, workflow e lockfile. Evidências finais/SHA ficam na PR, evitando novo ciclo de CI apenas para editar links.

## Paridade e pendências restantes

Entregue o recorte funcional dos três relatórios especializados, com gráficos de leitura Gantt/burndown e tabelas de posição orçamentária. Permanecem melhorias avançadas: gráfico comparativo por fase, impressão corporativa personalizada e paginação de históricos extensos. O catálogo arqueológico integral ausente no ZIP continua identificado, sem inventar conteúdo.

XML/MPP do MS Project continua pendente de validação técnica específica: o exportador original contém interpolação sem escape, mapeamento incorreto de tipos e pressupostos de duração/calendário. Não se declara interoperabilidade pela mera geração de XML; importação/exportação nativa exigirá teste de arquivo e semântica de calendário/lag. Não é bloqueio destes relatórios.

Homologação visual/de negócio cabe à revisão humana dos screenshots e fluxos; não foi executada em produção. Não se declara conclusão integral ou paridade de todas as variantes do legado. Sem merge, deploy, IA ativa ou APIs externas.
