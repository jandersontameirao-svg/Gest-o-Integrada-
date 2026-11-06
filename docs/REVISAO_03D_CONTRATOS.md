# Revisão 03D — integridade e consolidação de Contratos

Rodada concentrada para revisão do CEO. PR #7 em rascunho, branch `dev/comando-03b-contratos`, sobre Estratégia PR #3 (`467a9f7d56fddf286600983912bab3e333c0a770`). Cabeça inicial `088a759b29564bb3f6048c3ce285ecf6be4dc1d5`. Fonte original somente leitura: ARQUEO-CONTRATOS `c799a92100998c92a2b480c8ab8ddeb1d33ec77c`.

Não constitui homologação integral ou autorização de merge/deploy. Não implementa 04B/05B/Financeiro nem ativa serviços externos. Todos os testes usam dados sintéticos.

## Incremento funcional e limites

| Frente | Entregue nesta rodada | Limite ou aceite futuro |
|---|---|---|
| Itens canônicos | ID UUID, código único no contrato, unidade, quantidade (6 casas), preço (2 casas), total derivado, vigência, origem em aditivo; ajustes de quantidade por aditivo | Preço/unidade ficam imutáveis após qualquer uso em boletim; nova composição de preços exige novo item explícito. Não converte registros antigos automaticamente |
| Medições | Linhas canônicas ligam item/marco, quantidade, competência, origem e faixa de quantidade; servidor deriva preço, unidade e valor; bloqueia item de outro contrato | Contratos sem catálogo mantêm fluxo monetário 03B/03C, identificado como legado. Reconciliação do acervo depende de validação humana; não há como inferir itens canônicos de descrições antigas |
| Sobreposição | Mesmo item + períodos sobrepostos OU mesma origem, com interseção da faixa de quantidade, bloqueia submissão mesmo com descrição diferente. Parcelas não sobrepostas são permitidas | A faixa `[quantityOffset, quantityOffset + quantity)` identifica segmentos físicos/quantitativos; usuários devem homologar sua correspondência à evidência real. Não é detector semântico de fraude |
| Glosas e eventos | Quantidade e valor de glosa coerentes com preço; aprovação, devolução, correção, rejeição, cancelamento e estorno mantêm histórico/outbox e CAS | Glosa libera capacidade líquida, mas a faixa original permanece protegida enquanto o boletim está ativo; reapresentação da parte glosada deve usar devolução/correção/revisão. Sem crédito ou lançamento financeiro |
| Vigência e histórico | Limites monetários/quantitativos por competência; aditivo futuro não amplia passado; snapshots imutáveis de saldos por revisão a partir de 007 | Revisões anteriores a 007 não têm snapshot retroativo fabricado. Snapshot registra posição conhecida na revisão, com data de valoração, não uma reconstrução contábil bitemporal |
| Arquivos privados | TXT/PDF/DOCX/XLSX/PNG/JPEG, tamanho configurável, extensão/MIME/magic, estrutura Office, limites de expansão ZIP, bloqueio de macros/entidades/links externos detectáveis; versões e histórico de downloads | Validação estrutural não é antivírus/CDR. Não há garantia de detecção de toda carga maliciosa ofuscada. Homologação com arquivos de terceiros depende de inspeção/quarentena aprovada; testes e uso desta rodada são sintéticos |
| PDF/relatórios | Gerador tabular original reaproveitado em 03C, agora incluindo registros canônicos, riscos e responsáveis no relatório autorizado; página original de riscos conectada à persistência | Demais templates e geradores especializados do legado continuam sem paridade comprovada; não são declarados entregues |
| Numeração | Configuração por empresa/ano/tipo, prefixo provisório explícito, sequência transacional com row lock e UNIQUE, uma alocação por documento, idempotência e auditoria | Formato técnico provisório `prefixo/tipo/ano/sequência`. Não é padrão jurídico. Referência original e legacyCode nunca são renumerados; padrão definitivo aguarda CEO |
| Responsáveis/aprovadores | Vínculos a usuários ativos existentes, papéis e ações configuráveis; não cria usuário mestre; somente usuários vinculados à empresa ou Holding corporativa | Concessões de contrato restringem as de empresa/módulo; não as ampliam. Diretores autorizados mantêm supervisão. Alçadas e segregação jurídica exigem decisão |
| Riscos/ocorrências | Cadastro, edição, resposta, responsável, prazo, probabilidade/impacto e histórico; visual original de riscos reutilizado | Escala técnica 1–5 e classificação visual são auxiliares para homologação, sem alçada automática |
| Alertas internos | Antecedência explícita por contrato, consulta de contratos/marcos/obrigações próximos ou vencidos, autorização e auditoria | Consulta derivada sob demanda, sem scheduler, envio externo, caixa persistente de notificações ou confirmação de leitura |
| Pré-projeto | Referência imutável, assinatura preserva vínculo, validade/limite/revogação revalidados; replay de autorização expirada/revogada negado; interface v1 fail-closed quando limite não verificável | Não cria ou consome projeto. 04B deverá materializar uma única vez em transação, com UNIQUE de origem e revalidação atual; especificação abaixo |

Arredondamento técnico: quantidades em milionésimos, preços/valores em centavos, multiplicação inteira e arredondamento half-up por linha. Não usa Number/parseFloat para dinheiro. Divergência de composição/arredondamento entre boletins deve ser homologada; o backend não aceita valor canônico arbitrário enviado pelo cliente. Reduções que invalidem limites de vigência são rejeitadas.

## Segurança — revisão C01–C16 da auditoria 03A

| Achado | Tratamento/evidência |
|---|---|
| C01/C02 — demo login/bootstrap | Não transportados; autenticação GI e seed sintético separado. Nenhum endpoint público de promoção |
| C03/C11 — escopo e totais | `getContract`/`contractAccess` em rotas, relatórios e downloads; SQL de empresa e IDs filhos; lista filtra concessões contratuais; testes negativos e UTU/Vinho |
| C04/C14 — anexos e URLs | BLOB privado, validação binária, autorização read+attachments e propriedade composta; sem fetch de URL de cliente, storage externo ou download público |
| C05 — usuário inativo | GI revalida active na sessão; teste desativa/restaura usuário sintético e espera 401 |
| C06 — bearer de integração amplo | Não migrado/ativado. Não há consumidor externo nem token legado |
| C07 — aprovação pública não atômica | Não migrada. Aprovação interna com transação, lock do agregado, CAS e idempotência; aprovação pública permanece indisponível |
| C08/C09 — baixa/aceite misturados | Sem markAsPaid/approveManualAndPay; aprovado/faturável não implica faturado/recebido. Estorno é contratual, não financeiro |
| C10/C12 — acumulação e saldos | BigInt, soma por marco e item, glosa líquida e snapshots; cancelados/estornados liberam capacidade; null para informação financeira desconhecida |
| C13 — sequência/assinatura | Sequência provisória, alocação e auditoria na mesma transação; assinatura não renumera. Padrão definitivo não implementado |
| C15 — segredos/dumps | Somente arquivos de código selecionados e fixtures sintéticos; sem chaves, sessões, dumps ou conteúdo privado legado |
| C16 — modelos/migrações/decimais | Migração 007 sequencial, checksum, down/up em banco descartável; DTOs explícitos e regressão 03B/03C/Estratégia |

Leituras e exportações requerem permissões de backend; participantes não substituem habilitação do módulo. Histórico de downloads exige attachments. Uploads são enviados como base64 JSON limitado ao módulo Contratos; teto do parser 12 MiB, arquivo por padrão 2 MiB, configurável por `CONTRACT_ATTACHMENT_MAX_BYTES` de 1 KiB a 8 MiB. Não há URLs públicas. Arquivos são entregues como attachment com nosniff. A validação não executa macros, scripts, imagens ou legado.

## Banco, histórico e rollback

007 amplia kinds de registros, adiciona MIME, snapshots, parâmetros de alertas, sequências/alocações e downloads. 001–006 não são alteradas. Catálogo/checksum/dirty continuam obrigatórios.

Down de 007 é **destrutivo para dados introduzidos em 03D**, permitido pelo executor somente em `*_demo`, fora de production e com confirmação técnica explícita. Remove snapshots, sequências, vínculos/novos registros e boletins canônicos, preservando bytes dos documentos com vínculo removido. Não é procedimento de retorno produtivo sem perda. Fazer backup e planejar migração corretiva antes de eventual reversão com dados autorizados. CI executa down/up/reaplicação apenas em banco descartável.

## Compatibilidade com 04B — Gestão de Projetos

Contratos de clientes continuam canônicos aqui. `projectRef` é reserva UUID globalmente única; `uniqueOriginKey=contracts:<contractId>` identifica a origem, sem segundo cadastro de projetos. GET `/:id/project-reference/v1?proposedValue=...` retorna empresa, revisão do contrato/autorização, limite/moeda e elegibilidade atual. Falta de limite/proposta deixa elegibilidade falsa e exige decisão humana. Expiração/revogação nega elegibilidade; referência é preservada após assinatura.

04B deve usar transação e UNIQUE de `originKey` e `projectRef`, revalidar habilitação da empresa, permissão de projeto, autorização atual, expiração/revogação, limite e moeda no ato de materializar; capturar `contractRevision` e `authorizationRevision`, rejeitando snapshot obsoleto. Repetição devolve o mesmo projeto; nunca cria outro após assinatura. O endpoint de materialização não foi implementado aqui. A abertura não autoriza OS, mobilização, despesas ou contratação. Revogação posterior precisa evento e decisão humana sobre projeto já existente; não apagar projeto/histórico.

Arq Fornecedores mantém mestre de prestadores, contratos de prestadores e OS; Projetos usa espelhamento. Financeiro mantém futura liquidação. Eventos de medição preservam período/proveniência e `financialSettlement=false`; consumidores devem deduplicar eventId/versão e não inferir recebimento. Não existe dispatcher externo ativo.

## Validação e evidências

Build/TypeScript strict, testes unitários e auditoria de dependências foram executados localmente. Integração MySQL e Playwright serão confirmados pela CI da PR #7. O comentário de entrega registra SHA exato, execução, resultados e artefato; nenhuma execução anterior homologa código novo.

Testes novos: `contracts-03d.test.ts`, `contracts-03d.integration.ts`, fixtures DOCX/XLSX/PDF/PNG/JPEG exclusivamente sintéticos e `browser/contracts-03d.spec.ts`. Cobrem salvar/recarregar, derivação decimal, sobreposição com descrição distinta, parcelas válidas, propriedade de IDs, glosa, estorno, snapshot imutável, vigência, arquivos/versões/downloads, numeração, permissões dinâmicas, usuário inativo, pré-projeto e alertas. Regressões existentes permanecem obrigatórias, sem skips adicionados para contornar falhas.

## Checklist de prontidão para homologação visual futura

- [ ] CEO revisa matriz de paridade e funcionalidades explicitamente parciais.
- [ ] Conferir telas de Holding/empresa, formulários e navegação com cenários sintéticos.
- [ ] Validar no navegador as faixas de quantidade e a semântica de origem/evidência.
- [ ] Comparar templates PDF restantes com o legado antes de afirmar paridade integral.
- [ ] Aprovar política de arquivos e inspeção antimalware antes de documentos não controlados.
- [ ] Homologar arredondamento, glosas, recurso, competência e faturabilidade.
- [ ] Aprovar numeração definitiva e alçadas; nenhum número histórico será substituído automaticamente.
- [ ] Validar supervisão de diretores, concessões contratuais e segregação de funções.
- [ ] Homologar desktop/mobile, acessibilidade, PDF extenso e volume de registros.
- [ ] Autorizar 04B separadamente; não iniciar nova rodada de Contratos salvo bloqueio crítico comprovado.

Parecer: incremento apto a revisão técnica após CI aprovada, com ressalvas de catálogo legado, inspeção de arquivos e paridade de templates. Sem homologação integral.

### Evidência observada da primeira execução 03D

[CI 42260964550](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/actions/runs/42260964550), cabeça `71bdcf4820045bce58a0916aaa180bfca78321aa`: build/TypeScript, 31 unitários, 41 testes MySQL duas vezes (antes/depois de rollback/reaplicação), 3 cenários Playwright e auditoria com zero vulnerabilidades aprovados. [Artefato de navegador 13523814716](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/actions/runs/42260964550/artifacts/13523814716), retenção de 7 dias.

A revisão posterior reforça revalidação de concessões antes de replay idempotente, filtro de metadados de anexos por contrato, limites de faixa quantitativa e consistência de contagens ZIP. Transações de Contratos usam READ COMMITTED para não reutilizar uma leitura de concessões anterior à espera pelo lock do agregado; deadlock/timeout é conflito recuperável 409. O comentário final da PR registra a CI da cabeça definitiva, que deve ser verificada separadamente desta execução inicial.
