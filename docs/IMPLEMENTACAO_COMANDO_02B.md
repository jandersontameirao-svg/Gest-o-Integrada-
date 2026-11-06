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
