> Atualização 05F: descrições abaixo documentam o incremento inicial. Espelhamento canônico, OS, mobilização, custos, documentos, textos e revisões de Fornecedores foram incorporados em 05B–05F. Não estão bloqueados pela ausência de 05B. Compensações/rateios e distribuição histórica permanecem parciais; ver relatório 05F e backlog vivo de Fornecedores.

# 04B — primeiro incremento funcional de Projetos

Branch `dev/comando-04b-projetos`, baseada exatamente em Contratos/03D `d520f4dbb90a91780e275ffe7cdf9a8d0df4d341`, sem merge ou alteração das branches anteriores. Fundação #1, Estratégia #3, Contratos #7 e auditorias #4/#6 consultadas. ZIP acessível e hash verificado: `14a3d081ec9efe179bb8cc17ae74dc2a74dd7d325b457e97ace7f1001ce9ede1`. Nenhum código legado foi executado com providers externos; dados privados, dumps, segredos e `.manus/db` excluídos.

## Paridade e estado real

| Capacidade | Entrega e limites |
|---|---|
| Cadastro de projeto | JSX original de Projects.tsx adaptado: nome/código/descrição/gestor/status/prioridade/metodologia; empresa, moeda e autoridade controladas no backend. Não duplica clientes/empresas |
| Abertura pré-assinatura | Materializa projectRef e originKey únicos com lock do contrato, empresa/moeda/limite/validade/revogação/revisões/permissões revalidados na transação; assinatura posterior mantém o mesmo projeto. Sem contrato, exige decisão explícita de diretor. Não concede despesas |
| Fases/tarefas/subtarefas | Persistência, autoria, CAS, datas/progresso/estado/responsáveis, referências de fase/sprint/pai e grafo acíclico |
| Gantt | MSProjectGantt original: grade, hierarquia, timeline, filtro e zoom; edição aguarda commit. Recalcular efetua UPDATE e recarga comprova. FS/SS/FF/SF/lag em dias corridos; FS começa no dia seguinte ao término inclusivo. Calendário útil/exceções e outras variantes pendentes |
| Kanban | KanbanBoard original: cartões/colunas/filtros/drag, corrigindo droppable e espera do backend; alternativa select acessível persiste. Colunas customizadas e outras variantes pendentes |
| Scrum | Parcial: sprints e tarefas, pontos zero preservados; sprint encerrada bloqueia edição de tarefas/recálculo. Tela Scrum completa e burndown diário não portados nem simulados |
| Orçamento | Original aprovado, revisão de teto por diretor, remanejamento por gerente/diretor com projects/approve preservando teto e histórico. BigInt/centavos e moeda por projeto |
| Realizado/comprometido | Fatos operacionais com evidência, data e validação autorizada contra orçamento; validados são imutáveis. Comprometido e saldo após compromissos são null/pending_05b, não zero simulado. Exibe apenas saldo após fatos conhecidos. Não soma previsto + compromisso bruto + realizado |
| Equipes | Parcial: vínculo aprovado de pessoa corporativa existente (business_parties, individual), distinta de usuário, à empresa; reservas/confirmações/liberações e horas/datas; alerta de sobreposição multiempresa sem bloqueio universal ou divulgação de outros projetos. Cadastro profissional/PII/OS canônicos dependem de 05B |
| Documentos/comentários | Persistência privada, autoria/ownership, versões e downloads autorizados. Validação de formatos/limites herdada de 03D não substitui antivírus/CDR. Componentes originais específicos ainda pendentes |
| Entregáveis | Parcial: tarefa e marco do contrato, evidência/data/submissão/aceite com aprovação no backend. Não duplica boletim/medição nem gera faturamento |
| Fornecedores | Área explicitamente pendente e contrato interno versionado; nenhuma OS, fornecedor mestre ou contratação simulada |
| Templates/importações/relatórios | Não portados nesta rodada. Exportação JSON autorizada disponível; não declarar PDF/Excel/XML/MS Project ou templates funcionais |

Rastreabilidade de bytes fonte/destino em PARIDADE_04B_PROJETOS.json. O aplicativo inteiro não foi substituído por versão simplificada nem declarado integralmente portado: este incremento disponibiliza apenas os fluxos comprovados e mantém as demais variantes no backlog.

## Segurança — riscos 04A

P04-01: sem relatório público; export exige read+export. 02: auth GI, perfis, empresa/módulo/ação e UTU/Vinho negadas. 03: ownership de filhos, autor de comentário e anexos privados. 04: sem HTML/XML arbitrário; JSX/JSON escapados, renderizadores inseguros retidos. 05: sessão GI revalida usuário ativo. 06: tamanho limitado e providers desligados. 07: IDs relacionados do mesmo projeto, DAG, lock e CAS. 08: alocação/histórico/outbox atômicos. 09: recálculo persiste efetivamente. 10: cadeia calculada; salvar template não declarado pronto. 11: import/LLM não ativados. 12: aplicação insegura de template não portada. 13: DTO de alocação consistente hoursPerWeek/datas/pessoa. 14: zero preservado; sem burndown fabricado. 15: sucesso somente após commit; filtros de empresa no backend. 16: schema GI/migração 008, sem db:push, OAuth, SDK/storage ou jobs do legado.

READ COMMITTED, idempotência por ator/chave/hash, locks de agregado/contrato e UNIQUE de origem. Revisão obsoleta recebe 409, nunca novo projeto. Revogação posterior nega nova materialização; não se presume apagar ou bloquear silenciosamente um projeto já em execução. Políticas de reabertura, sobrecusto e impactos da revogação exigem homologação.

## Banco e testes

008 acrescenta projetos operacionais, registros, orçamento/histórico, requests, vínculos de pessoas existentes e documentos. Não altera 001–007. Down é destrutivo para os dados novos e só permitido pelo executor em *_demo, fora de production, com flag explícita. Não é rollback produtivo sem perda.

TypeScript strict/build e unitários locais executados. Integração MySQL, rollback/up/checksum/idempotência, segurança e Playwright serão confirmados na CI da PR, incluindo regressões completas de Contratos/Estratégia. Comentário de entrega registra SHA/run/artefato observados; não usar CI da base como homologação. Dados exclusivamente sintéticos; navegador bloqueia chamadas externas.

## Revisão e transição

Ver BACKLOG_04B_PROJETOS.md e INTERFACES_04B_05B_FORNECEDORES.md. Sem deploy/merge, migração real ou integração externa. Não é homologação integral. A autorização verbal posterior permite iniciar 05B somente após entregar e validar este incremento; não elimina os gates de revisão antes de merge/deploy.
