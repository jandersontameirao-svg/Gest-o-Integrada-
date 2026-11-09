# AUDITORIA FINAL — COMANDO 01B

**Parecer: APROVAR COM RESSALVAS**, exclusivamente a fundação técnica de demonstração do Comando 01. Não é aprovação para produção, migração de legados ou execução do Comando 02.

- Data: 05/11/2026 (UTC).
- Repositório: jandersontameirao-svg/Gest-o-Integrada-.
- Branch: dev/comando-01-fundacao; [PR #1](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/pull/1), aberta e em rascunho.
- Código auditado: `ff81e43541f1260eef5791869bcba80334f37ace`.
- Main e Geoportal consultadas: `68821118edfb5a1e1d1a19f89f01fd8270718fc4`.
- Escopo desta publicação: relatório e atualização da PR; nenhum código funcional ou configuração administrativa foi alterado.

## 1. Método, evidências e limites

Revisão estática dos arquivos da fundação no SHA acima; leitura dos checks, etapas e logs da CI do GitHub; reexecução local dos nove testes unitários. Inspeção somente de metadados, manifestos e amostras de código/schema dos repositórios legados identificados na seção 7. Nenhum aplicativo legado foi executado ou modificado. Não foram consultados bancos, dados operacionais, arquivos .env ou credenciais.

O Plano Mestre V03 não foi fornecido na conversa nem encontrado nos arquivos locais pesquisados ou na busca GitHub por “Plano Mestre V03”. Busca sem resultados não prova inexistência: indexação e permissões podem limitar a descoberta. Não há certificação de aderência integral ao V03. As expectativas na seção 6 derivam dos domínios expressamente citados pelo solicitante.

Esta é uma auditoria técnica delimitada, não um pentest, revisão de UX com navegador, revisão jurídica/LGPD, análise exaustiva de supply chain ou certificação de segurança. A ausência de alerta no npm audit não demonstra ausência de vulnerabilidades de aplicação.

### Índice das evidências da fundação

| ID | Evidência |
|---|---|
| E01 | [React, sessão em memória, navegação e seletor](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/client/main.tsx) |
| E02 | [Catálogo das empresas/módulos e tipos](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/shared/catalog.ts) |
| E03 | [API Express, login, consultas, auditoria e middlewares](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/server/app.ts) |
| E04 | [Revalidação de usuário, vínculos e sessão](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/server/auth.ts) |
| E05 | [Política por empresa/módulo/ação e Holding](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/server/policy.ts) |
| E06 | [Scrypt, salt, token e digest](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/server/crypto.ts) |
| E07 | [Pool MySQL e parâmetros SQL tipados](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/server/db.ts) |
| E08 | [Schema inicial](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/db/migrations/001_foundation.up.sql) e [rollback](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/db/migrations/001_foundation.down.sql) |
| E09 | [Executor de migrações](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/scripts/migrate.ts) e [seed sintético](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/scripts/seed.ts) |
| E10 | [Testes unitários](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/tests/core.test.ts) e [integração HTTP/MySQL](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/tests/api.test.ts) |
| E11 | [CI com npm ci e MySQL 8.4](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/.github/workflows/ci.yml), [lockfile](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/package-lock.json), [TypeScript estrito](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/tsconfig.json) |
| E12 | [Limites de segurança já documentados](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/docs/security.md) e [arquitetura](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/blob/ff81e43541f1260eef5791869bcba80334f37ace/docs/architecture.md) |

## 2. Arquitetura e segurança

| Área | Constatação verificável | Avaliação |
|---|---|---|
| React/TypeScript | React 19, Vite, TypeScript strict/noEmit; interface com cinco módulos, empresa e visão corporativa; componentes Panel e catálogo compartilhado | Adequado ao início. App concentra autenticação, fetch e telas; separar por domínio quando houver funcionalidades. canCorporate é importada de server/policy, que hoje não tem dependências de banco; mover utilitário puro para shared para preservar fronteira |
| Express/API | REST /api/v1, JSON limitado a 16 KB, Helmet, sem CORS habilitado, erros genéricos e Cache-Control no-store na API | Base adequada; faltam contratos de entrada/saída abrangentes, correlação de erros e readiness de banco. /health só confirma processo |
| Autenticação | Scrypt com salt aleatório e comparação timingSafeEqual; token aleatório de 32 bytes; somente SHA-256 do token no banco; expiração de oito horas e logout com revogação | Independente da ATENA OS e Manus. Token só em memória do React; sem cookie de sessão enviado automaticamente. Isso reduz exposição a CSRF por cookie, mas não elimina risco de XSS |
| Ciclo de identidade | Usuário ativo e permissões recarregados no backend por requisição; revogação de cargo testada | Não há cadastro administrativo, MFA, recuperação de senha, rotação/revogação de todas as sessões ou política explícita de parâmetros/versionamento do scrypt |
| Cargos e permissões | roles, permissions, role_permissions e vínculo user/company; concessões módulo:ação; seed concede apenas read | Cargo é atualmente papel de acesso, não cadastro completo de cargo profissional/organograma. Sem edição de vínculos pela API nesta etapa |
| Holding | Acesso corporativo exige vínculo com isHolding, flag corporate e permissão do módulo; CHECK limita flag ao company_id holding | Concessão explícita, não herança automática. Escopo cobre o único grupo previsto; não há múltiplos grupos empresariais |
| Isolamento | API autoriza antes de ler demo_records; consulta individual inclui company_id parametrizado; corporate só após autorização | Evidência positiva para as rotas existentes. Banco compartilhado, sem RLS. Futuras consultas podem escapar do padrão se não houver camada de acesso obrigatória |
| MySQL | mysql2, multipleStatements=false, pool limitado, timezone Z, FKs, índices por empresa/módulo; SqlParameter[] corrige TS2769 | Tipos de retorno usam cast T[] e não validação em runtime. Não há TLS de banco configurado nem separação automatizada entre usuário de DDL e runtime |
| Migrações | Arquivos 001 up/down, GET_LOCK, diário dirty, proteção explícita para down, rollback e reaplicação testados | Reversão de schema funciona em banco descartável; não restaura dados apagados. DDL tem commit implícito; dirty exige intervenção após falha |
| Auditoria | Login permitido/negado, logout e leitura de módulos permitida/negada; ator, contexto e timestamp quando aplicável | Registro antes de responder dados e sessão/auditoria em transação no login/logout. Não é trilha completa nem imutável; ver riscos |
| Seed | Somente fora de NODE_ENV=production, DB_NAME terminado em _demo e senha sintética explícita; recusa sobrescrever usuários | Proteção útil, mas nomes/env não substituem isolamento operacional; runtime produtivo não deve usar seed ou conta DDL |

Não foi identificada, nesta revisão das rotas atuais, uma consulta individual de registros de demonstração sem a autorização e o filtro de empresa correspondentes. Essa conclusão não se estende a rotas futuras, escrita, documentos ou integrações ainda inexistentes.

## 3. Testes e CI confirmados

No SHA auditado, a API do GitHub retornou **2 checks verify concluídos com success**:

| Evento | Execução | Resultado |
|---|---|---|
| pull_request | [42117739554](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/actions/runs/42117739554) / job 127561748919 | APROVADO |
| push | [42117732385](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/actions/runs/42117732385) / job 127561724666 | APROVADO |

Etapas e logs do job da PR foram consultados novamente nesta auditoria:

| Verificação | Evidência/resultados |
|---|---|
| Instalação reproduzível | npm ci, sucesso; lockfile não alterado no fim |
| Compilação | tsc --noEmit + vite build, sucesso |
| Unitários | 9 passaram; 0 falhas |
| Integração MySQL 8.4 | 7 passaram; 0 falhas |
| Migração inicial/idempotência | up e segunda execução up, sucesso |
| Rollback/reaplicação | down explícito e novo up, sucesso |
| Seed e integração após reconstrução | mais 7 testes passaram; 0 falhas |
| Dependências | npm audit --audit-level=high; zero vulnerabilidades reportadas naquela execução |
| Reexecução nesta auditoria | node tests/core.test.ts local: 9 passaram; 0 falhas |

A CI contempla autenticação obrigatória, token forjado, isolamento de leitura, contexto adulterado, Holding corporativa, cargo restrito, revogação, logout, expiração e erros sem detalhes sensíveis. Os sete testes repetidos após reconstrução são os mesmos cenários, não sete cenários novos.

**Lacunas de cobertura:** nenhum teste de escrita multiempresa porque não há rotas de escrita de negócio; sem E2E de navegador, carga/concorrência, verificação automatizada de permissões SQL da auditoria, falha parcial de DDL, dirty/advisory lock, limite de login ou backup/restauração. Pipeline verde não significa cobertura completa desses riscos. Actions usam tags v4 e MySQL tag 8.4, sem pin por SHA/digest; recomendar pin e atualização controlada antes de operação.

A publicação deste relatório cria outro commit apenas documental. Os links acima certificam o código auditado, não antecipam o status do commit documental. A confirmação dos checks da nova ponta será registrada na PR após a publicação.

## 4. Riscos e recomendações priorizadas

Prioridades: **Alta** = resolver antes de operações/dados reais ou do domínio afetado; **Média** = incorporar ao próximo desenho técnico; **Baixa** = melhoria de manutenção. Não há recomendação de liberar produção com esses itens em aberto.

| ID | Prioridade | Evidência, risco e recomendação | Momento/critério de aceite |
|---|---|---|---|
| R01 | Alta | E03/E05/E08: segregação depende da aplicação. Ainda não há relações projeto–contrato–fornecedor; FKs atuais não provam integridade de relações entre empresas futuras. Criar acesso a dados com contexto obrigatório e FKs compostas/validação de ownership onde necessário | Antes de qualquer escrita de negócio; testes cruzados de criar, alterar, ler, exportar e excluir |
| R02 | Alta | E08/E09: executor fixa 001_foundation, não descobre uma sequência de versões nem armazena checksums. É reversível para 001, mas não constitui ainda um motor de evolução de schema | Antes de uma migração 002; executar 001→002→down de 002 sem apagar 001, detectar alteração de arquivo e dirty/concorrência |
| R03 | Alta | E03/E08: audit_events não tem proteção técnica contra UPDATE/DELETE; conta demo executa DDL. Eventos negados de módulo não preservam empresa solicitada; falhas de autenticação de sessão e leitura de companies/me não são auditadas | Antes de uso operacional; matriz de eventos, registro seguro do contexto tentado, privilégios mínimos e teste de append-only; retenção e destino externo conforme requisito |
| R04 | Alta | E07/E12: sem configuração de TLS DB, cofre/rotação, backup/restauração e observabilidade operacional. Header de erro genérico protege conteúdo, mas log atual não permite correlação | Gate de produção; proxy HTTPS, TLS DB, segredos, credenciais separadas e restauração testada |
| R05 | Média | E06/E09: scrypt usa parâmetros padrão do Node e formato sem parâmetros/versionamento; seed compartilha senha sintética entre contas. Não há ciclo administrativo de identidades | Antes de contas reais; parâmetros explícitos medidos, evolução de hash e credenciais individuais/MFA/recuperação conforme risco |
| R06 | Média | E03/E11: rate limit em memória por IP; múltiplas instâncias ou proxy futuro mudam a proteção. Não há teste do bloqueio e retomada | Antes de exposição remota; configurar trust proxy apenas para proxy conhecido, limites distribuídos se necessários e testes de abuso |
| R07 | Média | E03: visão corporativa usa LIMIT 100 sem paginação, total ou aviso de corte. Hoje há cinco registros por módulo; no futuro pode parecer uma consolidação completa quando estiver truncada | Antes de dashboards reais; paginação e totais por contexto e permissão |
| R08 | Média | E01/E10: sem E2E de seleção de contexto e acesso assistivo. Estado de permissão no cliente só é carregado no login; revogação é imposta no backend, mas a navegação pode ficar desatualizada | Antes de liberar aos usuários; refresh de me e testes de troca rápida de contexto, sessão expirada e ausência de permissões |
| R09 | Média | Seção 6: V03 indisponível e critérios de aceite sem rastreabilidade. Não tratar cards e catálogo como módulos concluídos | Antes de autorizar escopo do Comando 02; fornecer revisão oficial, mapear requisito→entrega→teste e registrar decisão do responsável |
| R10 | Média | Seção 5: Geoportal padrão e main desprotegida segundo listagem; APIs de proteção/rulesets limitadas | Antes de integrar PR; revisão administrativa documentada, proteção se plano permitir e checks exigidos |
| R11 | Baixa | E01/E07/E11: App centralizado, utilitário de UI em server, cast de resultados SQL, tags flutuantes e ausência de scanner de segredos/SAST | Planejar modularização e contratos runtime; pin de supply chain e scanners sem substituir testes existentes |
| R12 | Baixa | CSS da fundação usa #702338/#203e5a/#b94912, enquanto referência de cores do portfólio inclui #8B1F2E/#2C7EB3/#EE7501. A família visual foi atendida, mas não há correspondência exata nem validação de manual oficial | Validar tokens, logo e contraste com responsável de marca antes de consolidar design system |

## 5. Branch padrão Geoportal — diagnóstico e procedimento seguro

### Observado, sem alteração administrativa

- Metadados GitHub: default_branch = Geoportal; repositório privado.
- Listagem de branches: Geoportal e main apontam para o mesmo commit inicial; dev aponta para o SHA auditado.
- Listagem informa protected=false para as três branches.
- GET branches/main/protection retornou 403 Resource not accessible by integration. Não é prova de ausência de toda configuração de proteção.
- GET rulesets retornou 403 com mensagem de recurso dependente de GitHub Pro ou repositório público. Não tornar o repositório público para contornar essa limitação.
- A PR #1 já tem base main. A configuração Geoportal é anterior à inicialização do trabalho; sua origem administrativa não pôde ser determinada.

### Ações recomendadas para o administrador, não executadas

1. Confirmar novamente SHAs de Geoportal/main e a base main da PR. Se houver divergência posterior, revisar o diff antes de prosseguir; não forçar atualização.
2. Em Settings → General → Default branch, selecionar main e confirmar a troca. A alteração do padrão não faz merge, não copia commits e não exige renomear ou excluir Geoportal.
3. Manter Geoportal como referência durante a transição. Atualizar instruções de clone e referências externas; cada colaborador pode executar git remote set-head origin -a após fetch.
4. Revisar workflows, bots, Pages e destinos que dependam implicitamente da branch padrão. O workflow atual cita main explicitamente e não contém deploy; não habilitar nenhum deploy.
5. Em Settings → Rules/Branches, conforme recursos do plano, exigir PR e revisão para main, bloquear force push/exclusão e exigir o check da Foundation CI. Selecionar o contexto efetivamente oferecido pelo GitHub, considerando que há verify de push e de PR. Se proteção privada depender de plano pago, registrar a decisão e manter revisão manual; não declarar enforcement inexistente.
6. Reconsultar default_branch, base da PR e checks após a troca. Não realizar merge como parte dessa operação; excluir Geoportal somente em solicitação posterior expressa e após verificar consumidores.

**Nenhum desses passos administrativos foi executado nesta auditoria.**

## 6. Aderência ao Plano Mestre V03

Legenda: **FUNDADO** = mecanismo comum existe; **PARCIAL** = há estrutura/placeholder, sem regra de negócio; **NÃO IMPLEMENTADO** = ausente no código auditado; **NÃO VERIFICÁVEL** = especificação ou evidência indisponível. Não implementação de negócio nesta fase não é, por si, desvio do Comando 01, que proíbe migração antecipada.

| Domínio solicitado | Situação na fundação | O que falta verificar ou especificar no V03 |
|---|---|---|
| Multiempresa/Holding | FUNDADO: cinco empresas previstas, flag Holding, memberships e autorização; UTU ausente do catálogo/seed da nova plataforma | Regras de compartilhamento de cadastros, aprovações corporativas e consolidação; detalhes V03 NÃO VERIFICÁVEIS |
| Profissionais | NÃO IMPLEMENTADO: users representa identidade de acesso; roles representa papel de permissão, não ficha de profissional | Vínculos profissionais por empresa, qualificações, disponibilidade, custos, documentos, privacidade e distinção usuário/profissional |
| Projetos e portfólio | PARCIAL: módulo projects e dados sintéticos; sem entidades operacionais de projeto/WBS/alocação | Ciclos, etapas, entregáveis, responsáveis, indicadores e regras do portfólio |
| Contratos e marcos | PARCIAL: módulo contracts; sem contratos, marcos, aditivos, medições ou aprovações reais | Relação com projetos/empresas, valores, competência, aprovação, documentos e rastreabilidade |
| Fornecedores | PARCIAL: módulo suppliers; sem cadastro, homologação, avaliação ou documentos | Identidade única versus vínculo por empresa, compliance, validade documental e segregação |
| Financeiro multiempresa | PARCIAL: módulo finance; autorização corporativa não equivale a consolidação contábil | Contas, centros de custo, títulos, pagamentos, competência/caixa, rateios, intercompany e eliminação de duplicidades |
| Mobilização | NÃO IMPLEMENTADO; sem módulo ou entidades específicas | Equipes, escalas, logística, ativos, viagens, aprovações e relação com projetos |
| Custos | NÃO IMPLEMENTADO; demo_records não é modelo de custo | Planejado/realizado, hora/categoria, orçamento, rateio e integração projeto–contrato–financeiro |
| Estratégia | PARCIAL: módulo strategy; sem objetivos, metas, KPIs, ciclos ou consolidação | Metodologias exigidas, vínculo com projetos/orçamento, histórico e governança dos indicadores |
| Automação com IA | NÃO IMPLEMENTADO; sem modelo, chamadas, agente ou credenciais de IA na fundação | Casos de uso, autonomia, revisão humana, autorização por empresa, minimização de dados, auditoria de ferramentas/custos e critérios de avaliação |
| APIs, auditoria e permissões | FUNDADO para as rotas read existentes; extensão e operação têm ressalvas R01–R06 | Contratos oficiais, cargos reais, matriz de ações e eventos obrigatórios do V03 |
| Interface/identidade | PARCIAL: navegação, cores da família solicitada, marca tipográfica provisória | Manual oficial, tokens finais, acessibilidade e fluxos completos não certificados |

Nenhum requisito detalhado de versão, prazo, fórmula financeira, fluxo de aprovação, SLA ou automação do V03 pode ser confirmado sem o documento. O SGE existente não substitui automaticamente esse plano.

## 7. Matriz de reaproveitamento dos aplicativos existentes e do SGE

### Escopo de acesso comprovado

O SGE foi identificado pela **descrição do repositório GitHub** planejamento_estrategico_arqueo: “Sistema de Gestão Estratégica Corporativa (SGE) ... para o Grupo Arqueo”. Isso identifica a fonte candidata; não certifica que ela seja a única versão oficial/homologada.

| Fonte | Snapshot consultado | Código realmente consultado |
|---|---|---|
| grupo-arqueo-portfolio | `137f1dc6558a0d29a3f595e875bcbbb533861b2d` | package.json, árvore de arquivos, CORES_GRUPO_ARQUEO.md e client/src/components/ui/button.tsx |
| ARQUEO-CONTRATOS | `c799a92100998c92a2b480c8ab8ddeb1d33ec77c` | package.json, árvore de arquivos e drizzle/schema.ts |
| arqueo-fornecedores | `8b5c94098333922e9dcc00ca5c67b612da24a26a` | package.json, árvore de arquivos e drizzle/schema.ts |
| grupo-arqueo-gestao | `717558e41b8d62772edead33ac1c10acdbbec145` | package.json, árvore de arquivos, drizzle/schema.ts e client/src/components/ArqueoLogo.tsx |
| SGE / planejamento_estrategico_arqueo | `3e73a4930777472008253509da9b77397c64440f` | descrição GitHub, package.json, árvore, drizzle/schema.ts e imports/composição de server/routers.ts |

Referências: [UI do portfólio](https://github.com/jandersontameirao-svg/grupo-arqueo-portfolio/blob/137f1dc6558a0d29a3f595e875bcbbb533861b2d/client/src/components/ui/button.tsx), [cores](https://github.com/jandersontameirao-svg/grupo-arqueo-portfolio/blob/137f1dc6558a0d29a3f595e875bcbbb533861b2d/CORES_GRUPO_ARQUEO.md), [schema contratos](https://github.com/jandersontameirao-svg/ARQUEO-CONTRATOS/blob/c799a92100998c92a2b480c8ab8ddeb1d33ec77c/drizzle/schema.ts), [schema fornecedores](https://github.com/jandersontameirao-svg/arqueo-fornecedores/blob/8b5c94098333922e9dcc00ca5c67b612da24a26a/drizzle/schema.ts), [schema gestão comercial](https://github.com/jandersontameirao-svg/grupo-arqueo-gestao/blob/717558e41b8d62772edead33ac1c10acdbbec145/drizzle/schema.ts), [logo](https://github.com/jandersontameirao-svg/grupo-arqueo-gestao/blob/717558e41b8d62772edead33ac1c10acdbbec145/client/src/components/ArqueoLogo.tsx), [schema SGE](https://github.com/jandersontameirao-svg/planejamento_estrategico_arqueo/blob/3e73a4930777472008253509da9b77397c64440f/drizzle/schema.ts), [composição de rotas SGE](https://github.com/jandersontameirao-svg/planejamento_estrategico_arqueo/blob/3e73a4930777472008253509da9b77397c64440f/server/routers.ts).

Não foram inspecionadas todas as implementações de rotas, testes, regras financeiras ou integrações dos legados. Nomes de tabelas e arquivos demonstram estruturas declaradas, não funcionamento ou qualidade comprovados. Códigos de outros aplicativos ou versões não identificadas permanecem **não avaliados**.

### Critérios de classificação

- **REAPROVEITAR:** candidato isolável, sem regra de negócio/identidade/dados legados; ainda exige conferência de licença, dependências e validação no destino.
- **ADAPTAR:** reaproveitar conceitos/modelos ou código após revisão específica, introduzindo os contratos e o escopo multiempresa da nova plataforma.
- **RECONSTRUIR:** implementar na nova fronteira quando não há fonte validada suficiente ou quando o acoplamento contraria a independência. É decisão conservadora, não alegação de inexistência ou inutilidade de código não visto.

Nenhuma classificação autoriza cópia, integração ou migração nesta entrega.

| Fonte/componente | Classe | Evidência e justificativa | Validação exigida antes de executar |
|---|---|---|---|
| Portfólio: Button e componentes visuais puros | REAPROVEITAR | Button consultado usa React/Radix/CVA, sem banco ou autenticação | Licença, utilitários/classes/dependências, foco e contraste; não importar todo o aplicativo |
| Portfólio: paleta e identidade visual | ADAPTAR | Documento de cores disponível; valores diferem dos tokens provisórios da fundação | Confirmar manual oficial e transformar em tokens compartilhados |
| Portfólio: gestão operacional de projetos | RECONSTRUIR | Amostra consultada não demonstra modelo de gestão de projetos; portfólio institucional não comprova ERP de projetos | Obter fonte operacional correta e requisitos V03; revisar decisão se nova evidência surgir |
| ARQUEO-CONTRATOS: contratos, marcos, aditivos e medições | ADAPTAR | Schema declara contracts, financialMilestones, contractAmendments, measurementBulletins e measurementReports | Revisar regras/rotas/testes, ownership por empresa, vínculos com projeto, precisão decimal e aprovação |
| ARQUEO-CONTRATOS: autorização, tokens públicos e integrações | RECONSTRUIR | Schema declara permissões e tokens, mas não foi auditada toda a implementação; fonte também contém estruturas ATENA | Usar autenticação independente, ameaças de links públicos, escopos, expiração e testes negativos; não importar integrações |
| Arq Fornecedores: cadastros, vínculos, documentos, avaliação | ADAPTAR | Schema declara suppliers, supplierCompanyLinks, documents, performanceEvaluations e supplierRiskScores | Definir cadastro global/vínculo local, regras de homologação, acesso a arquivos e LGPD |
| Arq Fornecedores: controle de grupo/empresa/unidade | ADAPTAR | userGroupRoles, userCompanyRoles e userBusinessUnitRoles declarados | Mapear para roles/memberships da fundação; evitar ampliação acidental de acesso ou cópia de autenticação |
| Gestão comercial: propostas, clientes, contratos e projetos | ADAPTAR | Schema declara proposals, clients, contracts, projects e userCompanies | Definir fonte de verdade para projetos/contratos e evitar cadastro duplicado; revisar fórmulas e autorização |
| Gestão comercial: marca SVG | REAPROVEITAR | ArqueoLogoMark consultado contém SVG local, sem chamada externa | Confirmar uso autorizado da marca, acessibilidade e retirar rótulo específico “Gestão Comercial” |
| SGE: identidade, objetivos, metas, KPIs e ciclos | ADAPTAR | Schema declara identidadeOrganizacional, objetivos, metas, kpis, kpiValores e ciclos | Conferir metodologias do V03, históricos, empresa/grupo e testes de cálculo |
| SGE: orçamento, DRE, balanço e capital de giro | ADAPTAR | Schema declara orçamento e dados financeiros; router compõe orcamento, dre, balanco e capitalGiro | Inspecionar implementação e testes, moeda/arredondamento, competência, consolidação/intercompany; não reutilizar valores reais |
| SGE: contratos e gateways | ADAPTAR | Router distingue contratos legado de contratosGateway e comenta consumo de SGC | Definir fonte canônica, contrato de API e consistência; não ativar gateway ou integração nesta etapa |
| SGE e comercial: IA/automação e memórias | RECONSTRUIR | Há estruturas iaAnaliseHistorico, analisesEstrategicas e atenaInsights/memories nas fontes; comportamento completo não foi auditado | Desenhar serviço independente com contexto obrigatório de empresa, revisão humana, avaliações e limites; sem ATENA/Manus |
| Profissionais, mobilização e custos integrados | RECONSTRUIR | Nenhum componente específico foi validado no recorte; atenaCostBase é apenas estrutura declarada e não fonte independente certificada | Receber requisitos e fontes, revisar classificação e modelar relações/escopos antes de qualquer implementação |
| Sessões, auditoria e migração para a nova plataforma | RECONSTRUIR | Identidades, permissões e esquemas legados não foram homologados como compatíveis; fundação já define nova fronteira | Evoluir R01–R06 sem importar usuários, hashes, sessões, logs ou dados de produção |

## 8. Pendências, responsáveis e critérios de decisão

| Gate | Responsável recomendado | Entrega necessária |
|---|---|---|
| Aprovação desta auditoria | Responsável do Grupo Arqueo | Análise do parecer e aceitação explícita das ressalvas; não constitui Comando 02 |
| Escopo oficial | Dono do produto | Disponibilizar V03 com identificação de versão; fechar rastreabilidade e priorização |
| Governança GitHub | Administrador | Revisar padrão main e proteção conforme seção 5; nenhuma alteração administrativa delegada nesta entrega |
| Próxima evolução de schema | Engenharia | Resolver R02 antes da migração seguinte; fechar ownership/FKs e testes R01 antes de escritas |
| Reaproveitamento | Engenharia + responsáveis dos aplicativos | Confirmar fontes homologadas/licenças e revisar código/testes dos candidatos, sem assumir compatibilidade por nome |
| Segurança operacional | Engenharia/infraestrutura | Fechar R03–R06 e backups/observabilidade antes de dados reais ou exposição remota |
| Experiência e marca | Produto/design | Validar tokens/logo, navegação por permissão, acessibilidade e E2E |
| IA | Produto/segurança | Casos de uso e critérios de autonomia/avaliação aprovados antes de implementação; sem integrações proibidas |

## 9. Parecer final

**APROVAR COM RESSALVAS.**

A fundação de demonstração tem coerência tecnológica com as fontes inspecionadas, autenticação independente, autorização no backend, segregação de leitura exercitada em MySQL e pipeline aprovado com dependências travadas. O TS2769 foi corrigido sem relaxar verificações.

As ressalvas materiais são: Plano Mestre V03 indisponível; evolução de migrações ainda restrita à versão 001; isolamento futuro sem camada obrigatória/composição de chaves validada; auditoria parcial e mutável; ciclo de identidade/operação ainda de demonstração; reaproveitamento dos legados limitado a candidatos, sem homologação de regras.

A aprovação proposta encerra apenas a avaliação da base do Comando 01. **Não aprova uso com dados reais, merge, deploy, migração, integração ATENA OS/Manus nem início automático do Comando 02.** A decisão cabe ao responsável após analisar este relatório e seus gates.
