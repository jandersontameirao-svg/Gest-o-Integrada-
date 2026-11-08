# 08A — Continuidade de pendências: Scrum operacional

## Escopo e dependência

Incremento vertical sobre PR #14, commit `d22d07931b7055eb5b780987af65567e7a4fb5b2`, branch própria `dev/comando-08a-projetos-scrum`. PR empilhada; não altera branches anteriores, main, aplicações originais nem serviços externos. Não representa homologação integral de Projetos ou dos cinco módulos.

## Fonte comprovada e reaproveitamento

ZIP original de Projetos disponível e conferido novamente: SHA-256 `14a3d081ec9efe179bb8cc17ae74dc2a74dd7d325b457e97ace7f1001ce9ede1`.

`client/src/pages/Scrum.tsx`, 694 linhas, SHA-256 `1d9141098edf3bd271dd50f12a3dfdd4eabad9626dac66132f84db1011d1806e`, foi comparado byte a byte ao membro do ZIP antes da adaptação. Destino: `client/projects/legacy/Scrum.tsx`. Reaproveitados estrutura visual, formulários, backlog, cartões, prioridades, seleção de sprint, sprints planejadas/ativa/concluídas, progressos por contagem de tarefas e gráfico Recharts. Os componentes comuns já disponíveis na GI foram reutilizados. ScrollArea usa overflow nativo e Progress usa elemento HTML acessível, sem novas dependências.

Serviços/autenticação/IDs numéricos/OAuth do legado não foram copiados. A tela utiliza endpoints canônicos de Projetos, UUIDs, autenticação e escopos GI; não cria outro cadastro de tarefas ou sprints. Datas de tarefas ausentes no formulário legado agora são campos obrigatórios visíveis.

## Correções demonstradas

O `server/db.ts:getSprintBurndown` original gerava uma curva linear fictícia como execução real e usava `storyPoints || 1`, alterando zeros. O destino preserva zero, separa referência ideal de observação real, não preenche lacunas nem retroage registros.

Migração sequencial 025 adiciona observações append-only na aplicação: revisão de projeto, autor, UTC de registro, motivo, total/restante de pontos e contagens. FK composta mantém sprint e projeto coerentes. Uma observação por sprint/revisão. Início, encerramento, reabertura e qualquer edição de tarefa via API comum (inclusive Gantt/Kanban) registram o estado dentro da mesma transação. A primeira observação é a base **observada**, não uma reconstrução histórica presumida. Sprints ativas preexistentes sem observações mostram histórico desconhecido até a primeira observação; datas anteriores permanecem vazias. Mais de uma alteração no mesmo dia preserva todas as observações; gráfico usa a última revisão do dia UTC. A variação de escopo é exposta separadamente.

Datas planejadas não são substituídas pelo início/fim reais. Início exige estar dentro da janela planejada; planejamento pode ser corrigido antes da ativação. Sprint de um dia é aceita sem divisão por zero. Janela planejada limitada a 366 dias e visualização histórica a 3660 dias para limitar carga; dados continuam preservados no histórico do projeto.

Encerramento exige `projects.approve`; tarefas incompletas exigem decisão expressa e justificativa, sem marcar tarefas como concluídas. Reabertura exige DIRETORES + `projects.reopen` + justificativa. Apenas uma sprint ativa por projeto. Transições genéricas de status são negadas. Sprint encerrada bloqueia tarefas tanto de entrada como de saída, corrigindo a evasão pela troca de `sprintId`.

Revisões CAS de projeto e registro, lock transacional, requestId com hash e revalidação de permissões seguem o mecanismo GI. Projeto encerrado nega mutações, inclusive reabertura de sprint, até revisão explícita autorizada do projeto. Pontos não geram compromisso financeiro, lançamento ou custo. Não há integração externa.

## Matriz de paridade

| Origem | Destino | Estado | Prova automatizada |
|---|---|---|---|
| Scrum.tsx / criar sprint | Tela original + records/sprint | Funcional; datas explícitas | MySQL + Playwright criar/recarregar |
| Backlog / tarefas / prioridades / pontos | Mesma base canônica de tarefas | Funcional; zero preservado | unitário + MySQL + browser |
| Distribuição entre sprints | Seleção original UUID, retirada auditada | Funcional, sem drag-and-drop fictício | MySQL e seleção no browser |
| Início / encerramento | Rotas Scrum versionadas pelo namespace API v1 | Funcional; decisão/autorização reais | concorrência/idempotência + browser |
| Histórico de encerradas | Todas listadas, sem truncar três | Funcional; reabertura de diretor | MySQL + recarga browser |
| Burndown ideal / real | Recharts original + observações reais | Corrigido; sem interpolação | unitários gaps/zero/escopo + MySQL |
| Histórico/exportação | JSON de sprint, observações e proveniência | Funcional com read/export separados | MySQL negativos + download browser |
| Scrum por fase (ScrumBoard.tsx) | Ainda não portado | Pendente; tela global não afirma equivalência por fase | Não homologado |

## Verificação

Build inclui TypeScript strict. Testes unitários cobrem cálculo, zero, um dia, lacunas, expansão de escopo e bloqueio de retirada de sprint encerrada. Testes MySQL usam somente dados sintéticos e banco `*_demo`, incluindo ciclo completo, autoria, idempotência concorrente, escopo estrangeiro, exportação, UTU/Vinho, encerramento incompleto e ausência de custo automático. Playwright percorre o formulário original, distribuição, início, edição de status, recarga, observações, download e encerramento; bloqueia tráfego externo.

CI mantém npm ci, build, toda regressão de Estratégia/Contratos/Fornecedores/Financeiro, MySQL antes e depois de rollback/reaplicação, migração idempotente, checksum, E2E e auditoria. Resultados por SHA e links de execução serão registrados na PR, sem confundir código existente com homologação. Nenhum teste/check desabilitado.

## Limitações e próximas pendências

- Observações são fatos de mutação, não job diário: dias sem alteração registrada não possuem observação. Não se presume execução diária.
- Gráfico reutilizado aparece para sprint ativa; sprints encerradas dispõem de tabela e exportação integrais. Gráfico comparativo de várias sprints é melhoria futura.
- Edição de datas de sprint ativa exige futura revisão explícita; não se modifica baseline silenciosamente.
- Não portado nesta rodada: Scrum por fase, calendário dedicado, caminho crítico visual, templates operacionais e relatórios especializados do legado.
- Demais pendências do planejamento: variantes completas de metodologias e riscos da Estratégia; evoluções de OS/mobilização de Fornecedores; modelos/regras jurídicas de Contratos; recibos/variáveis e consolidações financeiras dependentes de política de câmbio/eliminação. Integrações externas/IA continuam desligadas por decisão de escopo.
- Plano Mestre V03 integral não localizado nesta execução: conferência baseada nas decisões e relatórios efetivamente disponíveis; não declarar aderência integral a texto indisponível.

Parecer: incremento preparado para revisão técnica, sujeito à CI do SHA entregue e à homologação visual/operacional. Sem merge, deploy ou migração real.
