# 08C — Estúdio e aplicação de templates de Gestão de Projetos

## Escopo e base

Continuidade da PR #16, base `e93911b3991f13fc45d9a8ca2d043d77abc4bdd2`, branch própria `dev/comando-08c-templates-projetos`. Módulo: **Gestão de Projetos operacionais**. Não são modelos de contratos/aditivos de Contratos ou Arq Fornecedores.

Inclui biblioteca por empresa, edição estruturada, mapa visual com arraste, briefing de futura assistência de IA, versões, revisão/aprovação/arquivo, prévia e materialização atômica de fases, atividades e dependências em projeto já autorizado. Sem merge, deploy, dados reais ou conectores externos.

Decisão de escopo confirmada durante a execução: **preparar a área de IA e manter conexões desligadas**. Nenhuma geração por IA foi implementada ou simulada; nenhum provedor recebe dados. O briefing é persistido na versão do modelo, e o botão de geração permanece explicitamente desconectado.

## Fontes verificadas e lacuna real

ZIP autorizado de Projetos, SHA-256 `14a3d081ec9efe179bb8cc17ae74dc2a74dd7d325b457e97ace7f1001ce9ede1`, disponível. Os arquivos utilizados foram comparados byte a byte ao ZIP, sem executar backend legado.

| Origem | Hash SHA-256 | Reaproveitamento |
|---|---|---|
| client/src/pages/Templates.tsx (338 linhas) | 67955f89e22e9678b7d18826448fcce50d27f3b1dfd98c11277cf9f8c1292b96 | Catálogo, cartões e prévia de fases/tarefas |
| client/src/pages/TemplateDetail.tsx (281 linhas) | 68233c9685aedb9e4b61f43342d4137dda166bdfc7844e77f3f03f73bcde45f1 | Detalhes, indicadores e lista completa |
| client/src/components/TemplateGantt.tsx (155 linhas) | b3d7066e6acca70b73a8828d5df769a2e6f70dbeea1153fdcb0702d7f8e33cd2 | Gráfico relativo e legenda, corrigidos |
| server/db.ts | Ver matriz de paridade | Conteúdo estático e semântica de aplicação |
| server/templates-arqueologia.test.ts | Ver matriz de paridade | Referências parciais, sem presumir banco completo |

O ZIP contém defaults efetivos de Software, Marketing e Construção em `seedDefaultTemplates`, mas **não contém um catálogo persistido completo de templates arqueológicos**. Os testes citam Licenciamento, PAPIPA e Monitoramento e listas de fases/atividades; vários testes antigos retornavam sem falhar se não encontrassem modelos.

A importação opcional registra seis rascunhos de origem explícita: três defaults encontrados no código e três referências arqueológicas parciais extraídas de literais de testes. Relações de fase desconhecidas permanecem nulas; esboços sem tarefas permanecem vazios. Não se inventam prazos de 485/139/180 dias, catálogo homologado, marcos financeiros, aprovações IPHAN ou dados ausentes. Esboços vazios precisam de cadastro autorizado antes de aprovação/aplicação. Essa lacuna não bloqueia o estúdio nem a criação/aplicação de modelos reais no destino.

## Correções em relação ao legado

1. `applyTemplateToProject` copiava fases e tarefas em operações separadas e capturava erros retornando arrays vazios, podendo aparentar sucesso. O destino usa uma transação com histórico e origem; erro reverte tudo e não grava resposta de sucesso.
2. Associação de fases era construída pela posição das linhas consultadas, não por identidade. O destino usa chaves explícitas e mapa persistido de chave do modelo para UUID operacional. Ordenar/arrastar nunca altera a identidade.
3. Aplicações repetidas não tinham origem única. Restrição única `(project_id, template_id)`, CAS, locks, requestId com hash e revisão de conteúdo impedem repetição inclusive concorrente e por nova versão do mesmo modelo. Não há atualização retroativa automática de projeto já materializado.
4. Gráficos substituíam zero por valores padrão e inferiam cinco dias ou oito horas por dia. O destino preserva zero, separa horas de duração, mostra ausência de estimativa e desenha o deslocamento efetivo com barras empilhadas. A janela relativa usa o máximo de término, sem somar atividades paralelas como duração total.
5. Autenticação Manus, admin global/isPublic, rotas numéricas e consultas globais não foram portadas. Todo catálogo pertence a empresa canônica e segue permissões GI.

## Biblioteca, versões e estúdio visual

- Cadastro/edição em rascunho com fases, descrições, cores, ordem, duração/deslocamentos opcionais; atividades com fase, prioridade, horas, pontos, marco, ordem/duração/deslocamentos; dependências FS/SS/FF/SF e lag.
- Arraste real de fases e atividades; movimentação entre fases e área sem fase. Alternativas por teclado, setas e seleção explícita. As chaves e dependências permanecem estáveis.
- Importação manual de estrutura JSON validada no editor, sem importar credenciais, mestres de usuários/empresas ou proveniência falsa. Backend registra origem como cadastro/revisão no destino.
- Versões imutáveis de conteúdo, checksum, autor, motivo e proveniência. Editar modelo aprovado cria nova versão em rascunho; não sobrescreve a anterior. Aprovação, arquivo e restauração são auditados; restauração volta a rascunho. Não há exclusão física.
- Detalhes/histórico/exportação com empresa, conteúdo, versões, decisões e checksum. Biblioteca paginada explicitamente em grupos de 50, com botão de continuidade; não se presume lista completa a partir de truncamento silencioso.
- Guardas de navegação protegem formulários e decisões em andamento. Controles de edição/aplicação dependem das permissões e da situação do modelo/projeto.

## Aplicação segura

O projeto é criado pelo fluxo existente, inclusive autorização de diretor para planejamento antes de contrato. Templates não criam outro projeto, empresa, cliente, prestador, contrato ou orçamento.

Prévia exige versão/revisão atual do modelo aprovado e revisão atual do projeto. Data inicial e distribuição (paralela ou sequencial) são decisões explícitas. Atividade sem duração exige cadastro do esforço ou uma duração provisória informada pelo usuário, exibida na prévia; não há padrão oculto. Modo sequencial adiciona vínculos FS auditados, sem duplicar os vínculos equivalentes já declarados. Ciclos ou conflitos de âncora são rejeitados.

O calendário vigente do projeto é aplicado pelo motor 08B. A prévia não grava; inclui impactos, vínculos, premissas e hash. Aplicação confirmada recalcula o mesmo conteúdo em transação, verifica checksum/versão/revisão/calendário, insere somente novos registros e persiste o mapa de origem. Não replaneja registros antigos, não muda fatos realizados e não cria ligação presumida com marcos contratuais.

Projetos encerrados negam escrita. Modelos de outra empresa, em rascunho/arquivados, IDs adulterados ou prévia obsoleta/adulterada são negados. UTU e Vinho continuam sem acesso operacional. Uma mesma origem/versionamento não pode materializar duas vezes no projeto.

## Persistência e Core

Migração sequencial 027, com rollback e checksum pelo mecanismo existente:

- `project_template_catalog`: empresa, versão/revisão atual, estado e origem única opcional.
- `project_template_versions`: conteúdo imutável, checksum, origem, autor e motivo.
- `project_template_history`: decisões e transições de revisão.
- `project_template_applications`: projeto, versão/hash, premissas, calendário e mapa de registros.

Core/Governança não foi substituído. Pequenos ajustes de compatibilidade: horas previstas aceitam duas casas decimais sem arredondamento silencioso, e o objetivo/descrição de fase aceita até 6000 caracteres para preservar conteúdo do modelo. Não são valores monetários nem base automática de custo. O identificador determinístico de registro incorpora projeto, template, versão e chave; não usa IDs negativos ou posição de consulta.

## Interfaces

| Rota API v1 sob /projects | Responsabilidade |
|---|---|
| GET /templates/catalog?companyId=&cursor= | Biblioteca privada e permissões |
| GET /templates/catalog/:templateId | Conteúdo, versões e histórico; export=json exige export |
| POST /templates/catalog | Cadastro com edit |
| POST /templates/catalog/:templateId/revise | Nova versão com edit/CAS |
| POST /templates/catalog/:templateId/status | Aprovar/arquivar/restaurar com approve |
| POST /templates/seed | Importar referências estáticas como rascunho; approve |
| POST /:id/templates/:templateId/preview | Prévia com read, origem e versões válidas |
| POST /:id/templates/:templateId/apply | Aplicação única com edit, confirmação e transação |
| GET /:id/templates/applications | Proveniência no projeto autorizado |

## IA preparada, sem conexão

`assistantBrief` faz parte da versão validada do modelo (até 6000 caracteres). Área e geração têm estado explícito de conexão desligada. Nenhum SDK, chave, chamada, job ou endpoint externo foi criado.

Contrato futuro de proposta `project-template-suggestion.v1`: escopo autorizado de empresa/usuário/módulo/ação; entrada restrita a briefing e estrutura liberada; saída no schema validado de template; identificação de provedor/modelo/origem; revisão humana do diff; gravação em nova versão rascunho; aprovação e aplicação sempre separadas e auditadas. Saídas nunca executam código, criam contratos/OS/despesas nem alteram registros diretamente. Qualquer conexão futura exigirá definição e configuração segura próprias.

## Matriz de verificação e limites

- Unidade: validação de referências/dados, fontes estáticas, zero, horas fracionárias, estimativas desconhecidas, calendário e distribuição, identidade após arraste.
- MySQL isolado: versões/checksum, vínculo por chave com fases em ordem invertida, aplicação concorrente/idempotente, falha de inserção por colisão controlada de PK depois de fases e rollback integral, recuperação/retry, isolamento/exportação, prévia obsoleta, projeto encerrado e ausência de orçamento automático.
- Playwright: criação no estúdio, arraste real por ponteiro entre fases, alternativa por seta, briefing persistido/geração IA desativada, edição, duas versões, aprovação, recarga, exportação com conteúdo e aplicação confirmada em projeto. Dados exclusivamente sintéticos; tráfego externo bloqueado.
- CI mantém regressão de todos os módulos, npm ci, TypeScript strict/build, unitários, MySQL antes/depois de rollback/reaplicação, 27 migrações e auditoria. Evidências do SHA final serão registradas na PR; código existente não equivale a homologação integral.

Pendências: catálogo arqueológico completo não comprovado pelo ZIP; homologação dos conteúdos e prazos reais; variantes avançadas de templates e relatórios especializados; IA externa continua desligada por decisão explícita, sem simulação. Limites técnicos: até 50 fases/200 atividades/500 vínculos por modelo e limite combinado de cronograma do projeto de 500 atividades/2000 vínculos. Nenhum dado é silenciosamente truncado.

Parecer: incremento preparado para revisão técnica com CI do SHA entregue. Não declara Projetos integralmente concluído e não autoriza merge/deploy.
