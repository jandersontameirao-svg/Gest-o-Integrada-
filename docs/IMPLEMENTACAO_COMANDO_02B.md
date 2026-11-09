# Comando 02C — rodada concentrada de Estratégia

**Estado: incremento funcional parcial; 02B não encerrado e não homologado integralmente.**
Mesma branch e PR #3 em rascunho, dependente da PR #1. Nenhum merge/deploy.
As matrizes dos incrementos anteriores abaixo são registros históricos; esta seção
é o estado mais recente. Decisões D01–D13 permanecem aplicáveis.

## Entregue nesta rodada

### Alinhamento e consolidação

- Relações objetivo de empresa → unidade → Holding, com vigência explícita,
  edição autorizada nos dois planos, bloqueio de sobreposição e CAS de revisão.
  Não é possível saltar nível, criar ciclo, vincular objetivo estrangeiro ou
  atravessar uma transferência na mesma vigência. Dividir intervalos nesse caso.
- As relações entram nos snapshots aprovados e no histórico de alterações.
  Remoção/revisão exige plano em elaboração; não apaga baselines anteriores.
- Catálogo corporativo de indicadores com nome, unidade de medida e declaração
  explícita de agregabilidade, criado por diretor autorizado da Holding.
- Publicação controlada de metas anuais e observações mensais de KPI de empresas.
  Holding/unidade não publicam cópias para soma: evita dupla contagem entre níveis.
  Uma contribuição por empresa/indicador/tipo/competência/moeda, inclusive entre
  planos diferentes. Índice único e lock da empresa protegem concorrência.
- Consulta por empresa/unidade/Holding e intervalo. Decimais com seis casas somados
  como inteiros exatos, sem somas binárias de ponto flutuante. Metas anuais e valores
  mensais não são misturados; cada período, moeda e tipo gera grupo próprio.
- Valores qualitativos/não agregáveis não recebem soma. Valor ausente não é zero.
  Não há conversão cambial: BRL/USD/XXX permanecem separados. XXX é somente medida
  não monetária declarada pelo publicador; a classificação precisa de homologação.
- Proveniência: plano/versão, fonte/revisão, empresa, competência, moeda, unidade,
  publicador e horário. A unidade é a vigente no **último dia da competência**,
  sem rateio intramês. Republicar preserva a unidade registrada originalmente.
  Sem vínculo histórico determinável, a publicação é recusada.
- Editar valor publicado marca contribuição desatualizada e impede total do grupo
  até republicação. Competência, vínculo e moeda/indicador publicados não podem
  ser trocados silenciosamente. Exclusão de fonte publicada é bloqueada.
- Consolidação revalida leitura de cada empresa na competência, respeitando
  negações explícitas; exportação revalida export de cada contribuição. O relatório
  informa cobertura limitada a contribuições publicadas/autorizadas, sem anunciar
  total global completo. Não expõe linhas negadas por somas indiretas.

### Execução e variantes originais

Port real de ProjetosEmpresa, PlanoAcaoEmpresa, GanttChart, AnaliseSwoTtows,
CincoForcasPorter, AnaliseRbvVrio e AnaliseStakeholders. Ver
[manifesto de fonte e adaptação](SGE_PORT_COMANDO_02C.json).

- Projetos estratégicos: criação, edição, filtros, datas, responsáveis, status,
  gráfico Gantt; objetivo, meta e KPI vinculados ao mesmo plano.
- Ações: criação, edição, exclusão sem dependentes, responsável, prazo, custo
  estimado BRL analítico, observações, vínculos, lista/kanban e mudança de status.
  O adaptador mescla o registro confirmado em mudanças parciais do kanban, para
  não apagar descrição, prazo ou responsáveis. Datas são validadas no horizonte.
- Projetos/ações continuam entradas estratégicas, sem cadastros operacionais,
  lançamentos financeiros ou contratos. Campo de vínculo operacional ativo é
  recusado; futuro relacionamento deve usar referência ao cadastro mestre externo
  ao domínio Estratégia, sem duplicar projeto.
- SWOT/TOWS mantém quatro quadrantes, impacto e estratégia por item, com
  persistência/CAS/histórico. A matriz F-O/F-A/W-O/W-A é explicativa na origem;
  não é anunciada como motor automático de cruzamento/alinhamento.
- Porter completo conserva cinco forças/textos/intensidades/síntese. Corrigidos
  selects sem onChange, chave de intensidade divergente e barras estáticas de 33%.
  Barras agora seguem baixa/média/alta; nenhum sucesso local simulado.
- RBV/VRIO completo conserva campos booleanos e matriz; Stakeholders completo
  conserva poder/interesse/estratégia e matriz de quadrantes. Documentos separados
  das variantes Lite para não converter/perder campos ou presumir equivalência.
- Correção demonstrável RBV: recurso não raro não recebe vantagem sustentável
  apenas por inimitabilidade. A classificação passa a paridade quando valioso,
  organizado e não raro; demais divergências metodológicas exigem homologação.
- Todos usam persistência autenticada, recarga, edição, revisão, ciclos e snapshots
  existentes. Botões Salvar das variantes agora persistem; Voltar navega de fato.

## Matriz de paridade — atualização 02C

| Capacidade/fonte | Estado | Evidência e limite |
|---|---|---|
| Alinhamento de objetivos entre níveis | Funcional na fatia | HTTP hierarquia/vigência/snapshot/remoção/negação; sem alinhamento automático de OKRs |
| Consolidação gerencial | Funcional com limites declarados | Testes exatos 0,1 + 0,2, origem histórica após transferência, fonte editada, deduplicação entre planos, export e negação |
| ProjetosEmpresa / GanttChart | Portado com persistência | API e navegador criam/editam/recarregam; decurso do prazo não equivale a progresso físico |
| PlanoAcaoEmpresa | Portado com persistência | Lista/kanban e campos preservados; navegador salva/recarrega ação vinculada; custo BRL só analítico |
| AnaliseSwoTtows | Portado com persistência corrigida | Salvar/recarregar/editar/histórico; matriz de estratégias original explicativa |
| CincoForcasPorter | Portado/adaptado | Texto/intensidades dinâmicas, salvar/editar/recarga/versionamento HTTP |
| AnaliseRbvVrio / AnaliseStakeholders | Portado/adaptado | Campos originais, matrizes e persistência/versionamento HTTP; homologar interpretação |
| Sete variantes Lite e ciclos/objetivos/metas/KPIs | Mantidos do incremento 2 | Regressão CI; não removidos nem sobrescritos pelas variantes completas |
| PESTEL completo com planos integrados | Pendente | Lite permanece funcional; componentes auxiliares ainda sem port integral |
| BSC/OKR alternativas completas | Parcial | Lite persistente; variantes adicionais não certificadas, sem alinhamento automático |
| Gestão autônoma de riscos/respostas/matriz 5x5 | Pendente | Impacto/probabilidade em objetivos/projetos mantidos; não equivalem ao módulo GestaoRiscos |
| PDF original e relatórios especializados | Pendente | JSON autorizado funcional; nenhum botão PDF anunciado como pronto |
| Comentários/anexos/templates/configurações | Pendente | Sem backend/UI completa ou sucesso simulado |
| Orçamento/cenários/DRE/balanço/capital de giro | Pendente | Nenhum segundo financeiro; fórmulas da auditoria 02A ainda aguardam port/homologação |
| IA/ATENA/Manus | Não ativados | Nenhum provider externo ou conexão operacional |

## Verificação, riscos e transição

CI: TypeScript/Vite, unitários, integração MySQL isolada, migrações/checksum/rollback
004→001 e reaplicação, regressão dos incrementos 1/2, Playwright com formulários
originais, download JSON e bloqueio de chamadas externas, npm audit e lockfile.
Fixtures exclusivamente sintéticas. Evidências e commit final constam no comentário
02C da PR #3; aprovação de CI não equivale à homologação completa de métodos/UX.

A suíte 02C usa instância de API isolada com os limites de produção mantidos:
a soma dos cenários anteriores ultrapassava a quota por IP. Não há bypass de
autorização ou desativação do rate limit. As tabelas novas não importam dados reais.

Pendências importantes: homologar agregabilidade/unidades/moedas e convenção de
competência; remapeamento/cancelamento controlado de contribuições publicadas;
catálogo de métricas ainda sem edição/desativação; sem conversão FX ou média
ponderada/razões; limites de paginação/performance em grandes bases; composição
entre ciclos e responsividade/acessibilidade completas; auditoria imutável SQL e
retenção externa. Autorização histórica de leitura não migra usuários nem produz
backfill inventado. Não foi usado o SGE de produção.

[Relatório de transição para Gestão de Contratos](TRANSICAO_GESTAO_CONTRATOS.md).
Contratos NÃO foi iniciado. Esta rodada termina com a PR aberta para revisão do
CEO e pendências explícitas; não declara conclusão integral da Estratégia.

---

## Registro histórico do incremento 2

# Implementação do Comando 02B — incremento 2

**Estado geral: PARCIAL, com port funcional real do SGE. Sem encerramento do 02B.**
Continuidade autorizada na PR #3 e mesma branch dev/comando-02b-planejamento-estrategico.
A aprovação do incremento 1 permitiu desenvolvimento, não merge/deploy/homologação externa.

## O que foi efetivamente portado

Fontes do ZIP autorizado (SHA-256 0d0dbb8b44ae90f0d42a439fa2c9468e55a2cca5e6339a12b666e720c867b20e):
DashboardGrupo, DashboardAnalisesArea, DashboardEmpresa, PlanejamentoEstrategicoEmpresa,
ObjetivosEmpresa, KPIs, KpiValoresDialog, CincoForcasLite, StakeholdersLite, VrioLite,
BscLite, OkrLite, SwotLite, AnalisePestelLite, componentes Radix originais, navegação
visual, gráficos Recharts, notificações e hooks de composição/undo-redo.

[Manifesto por arquivo, hashes de origem e adaptação](SGE_PORT_INCREMENTO_2.json).
O manifesto comprova origem do código selecionado; não mede paridade por quantidade
nem certifica o aplicativo inteiro. Código privado, dumps e consultas não foram copiados.

A fachada finita client/strategy/legacy.tsx mantém os nomes dos hooks usados nos
formulários, mas usa REST autenticado da GI, sem tRPC remoto, SDK/OAuth Manus ou IA.
Identidade, escopo, versão e autorização são do backend. O papel gestor retornado
pelo adaptador de UX deriva de capability; não é autoridade de autenticação.

## Fatia funcional ponta a ponta

1. Entrar com conta sintética autorizada; selecionar Estratégia e escopo Holding,
   unidade ou empresa. Criar plano com horizonte de até dez anos (2000–2100).
2. O plano gera ciclos anuais, quatro trimestrais e doze mensais por ano. Selecionar
   ciclo e abrir os painéis originais adaptados ou formulários portados.
3. Criar/editar objetivos com filtros e perspectivas originais; criar metas anuais
   vinculadas (editor adicional baseado no schema SGE); criar/editar KPIs e registrar
   meta/realizado mensal no diálogo original, com gráfico e histórico.
4. Editar e persistir Porter, Stakeholders, VRIO, BSC, OKR, SWOT e PESTEL nos
   componentes portados. Auto-save confirma commit; salvar/recarregar mantém campos,
   IDs, perspectivas customizadas BSC e todos os KRs/realizados. Exclusão do último
   item também é persistida; não ressurge após recarga.
5. Fechar períodos, consultar histórico e aprovar baseline. Aprovação/revisão exigem
   diretor e concessão explícita; reabertura é auditada. Versão aprovada fica em
   strategy_approved_versions; revisão abre novo número sem apagar o snapshot.
6. Plano aprovado bloqueia alterações de definições/análises. Observações realizadas
   de KPI podem continuar em períodos abertos, sem alterar meta aprovada. Plano
   encerrado bloqueia escrita. Ciclos ancestrais fechados bloqueiam meses filhos.
7. Exportar JSON confirmado do plano somente com read + export, validado no backend
   e auditado. PDF legado e capacidades auxiliares não portadas permanecem pendentes.

Novas rotas estão em /api/v1/strategy. Cada leitura/escrita/histórico/versão/exportação
revalida escopo. Plano/ciclo/objeto estrangeiro não pode ser ligado por ID. CAS por
versão de plano e revisão de objeto/análise retorna 409 em conflito. Escritas,
histórico e snapshots são transacionais e serializadas pela linha do plano.

## Matriz atual de paridade funcional

| Fonte SGE / capacidade | Destino | Estado comprovável | Prova e divergência |
|---|---|---|---|
| DashboardGrupo | client/sge/pages/DashboardGrupo.tsx | Portado, parcial em consolidação | JSX/gráficos preservados; dados do plano/ciclo selecionado. Não soma planos filhos ou financeiro real |
| DashboardAnalisesArea | client/sge/pages/DashboardAnalisesArea.tsx | Portado por escopo de unidade | Gráficos de completude alimentados pelas análises persistidas; ID negativo removido |
| DashboardEmpresa | client/sge/pages/DashboardEmpresa.tsx | Portado com limites | Objetivos/KPIs reais; contadores de projetos/ações leem o plano, mas formulários desses domínios ainda pendentes |
| Hub PlanejamentoEstrategicoEmpresa | client/sge/pages/PlanejamentoEstrategicoEmpresa.tsx | Portado/adaptado para os três níveis | Expansão, cards, navegação e sete componentes preservados. Não equivale a port integral dos hubs Grupo/Área originais |
| ObjetivosEmpresa | mesmo nome em client/sge | CRUD real | HTTP salvar/recarregar/editar/conflito; navegador cria em formulário original. Vínculo externo OrganoArq não conectado |
| metas / metaAnual / ano / tipo | targets.tsx e entradas target | Editor novo, compatível com modelo | Associação ao objetivo/horizonte validada; outro plano recusado; navegador salva meta |
| KPIs / KpiValoresDialog | mesmos nomes em client/sge | Definição/edição e observação reais | Mensal meta/realizado, histórico, gráfico, RAG; ano limitado ao horizonte; zero não vira vazio |
| OkrLite | documento okr por plano/ciclo | Portado com persistência íntegra | Teste preserva 4 KRs e realizados, além do limite antigo de três. Alinhamento formal a objetivos e variante completa ainda pendentes |
| CincoForcasLite | documento porter | Portado com persistência corrigida | Salvamento simulado substituído por commit/CAS; navegador salva e recarrega texto original |
| StakeholdersLite | documento stakeholders | Portado com persistência corrigida | Poder/interesse, quadrantes e gráficos mantidos; leitura/edição/histórico testados via HTTP |
| VrioLite | documento vrio | Portado com persistência corrigida | Escalas originais 0–5 e campos valioso/raro/imitavel/organizado preservados; classificação original mantida |
| BscLite | documento bsc | Portado, perspectivas preservadas | Quatro perspectivas obrigatórias + customizadas, nomes/cores/ícones e indicadores persistidos; divisão por zero prevenida |
| SwotLite | documento swot | Portado | Quatro quadrantes/IDs/textos/gráficos preservados; exclusões persistidas e versão por ciclo |
| AnalisePestelLite | documento pestel | Portado | Editar impacto/probabilidade, gráficos e undo/redo preservados; hidratação não apaga dados recarregados |
| Modelos de horizonte/ciclos | strategy_plans/cycles | Implementados no destino | Dois anos geram 34 ciclos; período fechado e reabertura de diretor exercitados |
| Templates/versões de plano | strategy_approved_versions/history | Baseline imutável pela API | Aprovar, recusar escrita antiga, revisar, preservar snapshot e eventos auditados |
| Exportação JSON | endpoint /export | Funcional, backend autorizado | Somente dados confirmados; usuário com read sem export é negado |
| PDF, comentários, menções/anexos, planos auxiliares | Sem transporte ativo | Pendente | Botões PDF desabilitados; componentes auxiliares mostram pendência, nunca sucesso simulado |
| Variantes completas PESTEL/SWOT/TOWS/Porter/VRIO/OKR | Ainda no ZIP | Pendente | Nenhuma variante removida do original; esta fatia não certifica equivalência com variantes completas |
| Seletor de metodologias e identidade organizacional | Ainda no ZIP | Pendente | Catálogo visível para navegação; configuração/escrita não são simuladas |
| Projetos estratégicos e ações | Entradas project/action + leituras do painel | Parcial | Contrato/persistência básica sem módulo operacional; formulários maduros/linhagem/iniciativas/riscos ainda pendentes |
| Orçamento, DRE, balanço, capital de giro | Ainda na origem | Pendente | Não construído livro paralelo, nenhuma fórmula financeira portada neste incremento |
| Consolidação por moeda/câmbio/unidades históricas | Ainda não implementada | Pendente | Painéis declaram o plano/ciclo, não falsa consolidação corporativa de resultados |
| IA/serviços externos | Nenhuma conexão | Inativos | Browser bloqueia chamadas externas; nenhum provider ou SDK Manus/ATENA é carregado |

## Testes e evidências do incremento 2

- Testes puros: fixtures exclusivamente sintéticos para sete metodologias, integridade
  de mais de três KRs, perspectivas customizadas, RAG 90/70, calendário e rejeição de
  NaN/IDs duplicados/escalas inválidas. Os seis novos casos passaram localmente.
- Integração MySQL: plano/ciclos, sete leituras/edições/revisões, CAS, objetivos/metas/
  KPI/valores, isolamento, período fechado, aprovação/revisão/snapshot e exportação.
- O banco é recriado somente em *_demo antes da prova de navegador para isolar as
  fixtures das provas destrutivas de migração. Não há conexão com banco de produção.
- Playwright exercita UI original, recarga e aprovação; screenshot/trace só contêm
  dados sintéticos. Chamadas fora de localhost/127.0.0.1 são abortadas e testadas.
- Primeiro build detectou aliases antigos e estreitamento de tipo MySQL; corrigidos
  sem relaxar strict. Primeira prova browser identificou seletor ambíguo de dois
  botões Novo KPI; o teste passa a escolher o gatilho do diálogo explicitamente.
- Evidência da ponta final, contagens e links da CI estão no comentário da PR #3.
  Inventário de código e testes HTTP não substituem homologação visual completa.

## Limites de segurança e próximos passos

A auditoria é transacional por alteração, mas append-only no banco/retention externa
continuam pendentes. Endpoints não aceitam SQL ou troca de ownership. Usuários,
Holding, unidades e entitlements do incremento 1 são reutilizados; UTU/Vinho não
recebem habilitação operacional. IDs negativos só existem em proveniência.

Os formulários existentes contêm tipos any herdados; strict permanece ativo e o
backend valida tipos, escalas e relações. Refinamento adicional de DTOs e manutenção
visual/responsiva/acessível permanecem necessários. A navegação alerta sobre
alterações ainda não confirmadas; conflito mantém erro e exige recarga explícita.

Continuar com variantes completas, alinhamento de objetivos entre níveis, catálogo
configurável, iniciativas/projetos/planos de ação/riscos, relatórios/PDF e análises.
O 02B NÃO está encerrado. Não houve merge, deploy, publicação automática, transferência
de dados sensíveis ou alteração do SGE original. APIs externas permanecem desligadas.

---

## Registro histórico do incremento 1 (estado antes deste port)

# Comando 02B — incremento 1: governança e segurança

**Estado: PARCIAL. O módulo de Planejamento Estratégico NÃO está concluído.**

Branch: dev/comando-02b-planejamento-estrategico. PR em rascunho baseada em
 dev/comando-01-fundacao (PR #1 ainda não integrada à main). Nenhum merge/deploy.
Fonte funcional obrigatória: ZIP autorizado, hash
0d0dbb8b44ae90f0d42a439fa2c9468e55a2cca5e6339a12b666e720c867b20e;
PR #2 e docs/AUDITORIA_MIGRACAO_SGE_COMANDO_02A.md são a referência de paridade.
As decisões D01–D13 do CEO prevalecem sobre a proposta N:N do relatório 02A.

## Incremento entregue

A ordem obrigatória começa pela ETAPA 1. Este incremento entrega governança
persistente com API/interface, sem iniciar o port das metodologias antes de validar
os pré-requisitos. Não há port substancial do SGE nesta entrega; não confundir a
base de governança nova com preservação funcional já concluída.

- Migração 002, sem alterar arquivos da 001: unidades expansíveis, escopos tipados,
  proveniência, perfis, permissões pessoais, habilitação de módulo, vínculo temporal
  empresa/unidade e eventos de governança.
- Holding única scope-holding. Escopos SGE grupo:0 e participacoes:-1 apontam para
  essa Holding; nenhum objetivo/registro legado foi importado, fundido ou apagado.
- Unidades Arqueo, África e Vinho 24 Horas, conforme decisão do CEO. Empresas
  UTU/Vinho são fixtures claramente de demonstração, habilitadas somente em
  Estratégia. Não presumem razão social, cadastro jurídico ou backup completo.
- Habilitação é verificada antes de concessão pessoal/corporativa. Operações
  desabilitadas continuam negadas mesmo com concessão explícita.
- Perfis DIRETORES/GERENTES/OPERADORES identificados em user_profiles. Os vínculos
  de empresa continuam definindo papéis base; perfil sozinho não concede acesso
  corporativo. Permissões adicionais por pessoa, empresa/unidade/Holding, módulo
  e ação são persistidas. Negação prevalece sobre concessão. Perfil não substitui
  cargo/posição profissional.
- Diretor com vínculo corporativo autorizado gerencia unidades, transferências,
  concessões e perfis. Alterar o próprio perfil exige outro diretor; serialização
  evita demissões simultâneas de diretores eliminarem a autoridade remanescente.
- A associação ativa é única por empresa, com índice único gerado. Transferências
  usam lock na empresa e transação, encerram intervalo anterior e auditam antes/
  depois atomicamente. Somente vigência hoje UTC neste incremento; sem backdate,
  agendamento ou duas transferências no mesmo dia. Histórico não é reatribuído.
- Consulta de composição por data e escopo, listagem por módulo e consolidação de
  registros demo respeitam grants/negações. Não há contabilidade/consolidação de
  resultados reais. Moedas, câmbio, períodos de resultados e snapshots de planos
  ainda precisam ser implementados com o domínio estratégico.
- Backend compartilha requireAccess/checkAccess para as novas rotas. Ações export,
  attachments, jobs, ai, approve e reopen são negadas sem concessão explícita;
  nenhuma dessas funcionalidades foi ativada. Isso prepara a política, não prova
  proteção de endpoints/ferramentas futuros ainda inexistentes.

## Uso demonstrativo

Executar npm ci, configurar .env a partir de .env.example em banco MySQL 8.4
**descartável *_demo**, npm run migrate, npm run seed. Iniciar API e frontend como
no README. Contas e senha sintética são as mesmas do seed da fundação.

Entrar com holding@example.test, abrir Gestão e Planejamento Estratégico:
consultar Holding/unidade/empresa e data; criar unidade; transferir empresa;
configurar concessão/negação e perfil. O backend valida autorização e persistência,
não apenas a seleção da UI. As demais contas acessam seus contextos permitidos.
Os controles de governança não são as telas originais do SGE e não substituem seus
hubs/metodologias. Validação visual/E2E de navegador permanece pendente.

## Migrações e upgrade

Catálogo contínuo 001,002..., checksums SHA-256 de up+down, advisory lock por banco,
diário dirty e recusa de arquivo alterado. Falha de DDL requer diagnóstico/restore;
MySQL faz commit implícito e não há rollback transacional de DDL parcial.

- npm run migrate: aplica versões pendentes; repetição é idempotente.
- npm run migrate -- up 001_foundation: aplica até a versão indicada.
- ALLOW_DESTRUCTIVE_ROLLBACK=yes npm run migrate -- down 002_governance:
  remove somente 002 (ou versões posteriores), preservando a fundação 001/usuários.
- ALLOW_DESTRUCTIVE_ROLLBACK=yes npm run migrate -- down: remove tudo em ordem
  inversa, apenas fora de produção e em DB_NAME terminado em _demo. Elimina dados;
  não é mecanismo produtivo de restauração.
- Banco antigo da PR #1 sem checksum exige ADOPT_LEGACY_001=yes na primeira
  atualização. Somente checksum conhecido dos arquivos 001 originais é aceito.
  Não aceitar/reescrever checksum divergente para forçar passagem.
- Upgrade de banco existente preserva empresas e usuários, cria habilitações
  operacionais apenas para os cinco IDs originais e perfis inicialmente OPERADORES.
  Um diretor deve ser provisionado por procedimento administrativo controlado, não
  por autocadastro. O seed recusa usuários já existentes; não usar para upgrade.
  A data inicial do vínculo backfill é a data da migração, sem inventar histórico.

O SQL controlado atual é dividido por ponto-e-vírgula; não suporta procedures ou
literais contendo esse delimitador. Antes de migrar schemas mais complexos,
evoluir parser/mecanismo sem reinterpretar arquivos já versionados.

## Matriz de rastreabilidade e paridade

Estados referem-se a capacidades, não número de arquivos. O ZIP original não foi
modificado nem publicado; nenhum dado de .manus/db foi lido/importado nesta etapa.

| Origem / decisão | Destino neste incremento | Estado | Teste de paridade/aceite e divergência |
|---|---|---|---|
| Grupo 0 / Participações -1; D01 | organization_scopes + scope_provenance | Base completa; dados não migrados | Holding única com duas origens testada; preservar todos os registros quando houver carga autorizada |
| areas_negocio; D02 | business_units, API e UI | Funcional sintético | Criar/reler unidade; cadastros reais da origem não transferidos |
| empresas.areaId / empresa_area_vinculo; D06 | company_unit_history | Funcional sintético | Concorrência, unicidade e composição histórica testadas; substitui proposta N:N por decisão CEO |
| usuario_empresas/papéis; D04 | memberships + user_profiles + scope_grants | Parcial | Grants pessoais/unitários, negações e atualização em sessão testados; não migra identidades legadas |
| Empresa operacional x estratégica; D03 | company_module_entitlements e filtro central | Funcional sintético | UTU/Vinho negadas em quatro módulos, inclusive concessão explícita/corporativa |
| Migrações Drizzle; etapa 1 | motor sequencial/checksum/dirty | Funcional no schema GI | Alteração de checksum, dirty, rollback 002 e reaplicação testados; DDL SGE não reaplicado |
| Hubs Grupo/unidade/empresa; etapa 2 | Ainda na origem | Pendente | Comparação visual, filtros e navegação originais não portados |
| Objetivos/metas/OKR/KPI; D05/D07 | Ainda na origem | Pendente | Salvar/recarregar/alinhar/publicar e versões por ciclo |
| Iniciativas/projetos estratégicos/ações | Ainda na origem | Pendente | Preservar campos e vínculos; não construir projeto operacional |
| Plurianual/anual/trimestral/mensal | Ainda não implementado | Pendente | Fechamento/reabertura por diretor, histórico e imutabilidade de plano aprovado |
| SWOT/TOWS, PESTEL, BSC, OKR | Ainda na origem | Pendente | Variantes completas, persistência, histórico e exportação por escopo |
| Porter/Stakeholders/VRIO; D09 | Ainda na origem | Pendente | Persistência real não concluída neste incremento; nenhum sucesso simulado foi importado |
| Riscos/matrizes/respostas | Ainda na origem | Pendente | Escalas, fórmulas, ações e histórico caracterizados antes do port |
| Templates/PDF/comentários/anexos | Ainda na origem | Pendente | Exportação/arquivo protegido e paridade de relatório; não ativados |
| Orçamento/cenários/revisões | Ainda na origem | Pendente | Versões/comparativos preservados sem razão financeiro paralelo |
| DRE/balanço/capital de giro; D10 | Ainda na origem | Pendente de port/homologação | Divergência ambos da DRE registrada no 02A; nenhuma fórmula portada/alterada agora |
| Dados operacionais; D07 | Nenhum módulo novo | Não implementado neste comando | Contratos/Projetos/Fornecedores/Financeiro não desenvolvidos; espelhamento futuro do Arq Fornecedores permanece requisito |
| IA e serviços Manus/ATENA; D11 | Somente nomes de ações na política | Pendente | Interfaces de provider/ferramentas ainda não implementadas; zero conexão externa |
| Auditorias de negócio legadas; D12 | Sem carga; novos eventos transacionais | Parcial | Eventos de transferência/grant/perfil testados; histórico legado não importado |

## Testes e evidências

Local: nove testes da fundação e cinco novos testes puros passaram; sintaxe dos
arquivos TypeScript verificada. Build e integração executados no runner GitHub
porque o ambiente local anterior não dispõe das dependências instaladas.
A confirmação da ponta final, links, resultados e eventuais correções são
registrados na PR, sem declarar aprovações futuras neste arquivo.

CI herdada: npm ci, TypeScript/Vite, unitários, MySQL 8.4 descartável, seed sintético,
integração, down/up e repetição da integração, npm audit e lockfile inalterado.
Testes novos incluem configuração/revogação de grants, recusa de escopos negativos,
isolamento operacional UTU/Vinho, transferência concorrente, consulta por período,
criação de unidade/perfis e validação de checksum/dirty/rollback parcial.

Primeira execução encontrou TS7034/TS7005 em visibleUnits; correção por anotação
explícita do tipo, sem relaxar strict, suprimir erros ou desabilitar verificações.
Nenhum teste do legado que possa atingir serviços externos foi executado.

## Pendências e limites relevantes

- ETAPA 1 é um incremento de governança, não conclusão de todos os requisitos
  operacionais: UI/E2E, moedas/câmbio, aprovação de planos, eventos de leitura por
  objeto e retenção/imutabilidade SQL da auditoria ainda pendentes.
- Migração de identidades/cadastros reais do ZIP não realizada. Cópia autorizada é
  fonte de código, não prova de backup; usar staging isolado e procedimento revisado
  em incremento próprio quando estritamente necessário.
- Não existe recurso de resultado financeiro/estratégico a reatribuir: o histórico
  temporal implementado preserva associação. Snapshots/observações e reconciliação
  por moeda/competência serão construídos antes de consolidar resultados.
- Sem chamadas externas/SDK Manus, sem ativação de ATENA IA/GPT/Claude. Não há
  interfaces de providers implementadas ainda; a política por ação não as substitui.
- O guard central deve ser obrigatório para cada endpoint/job/arquivo/ferramenta
  futuro. O banco não oferece RLS; não alegar isolamento de código ainda inexistente.
- Sem alteração de aplicativos originais, implementação operacional, merge, deploy
  ou homologação externa. A revisão do CEO deve avaliar o incremento parcial,
  mantendo a PR aberta para continuidade do escopo autorizado.
