# Contratos internos v1 — Contratos, Projetos e Arq Fornecedores

**Especificação e preparação 03B. Endpoints futuros não montados; nenhum conector
ativo.** Autoridades e tipos estão em shared/integration/v1.ts. Outbox contratual
é persistência local, não envio a Financeiro, Estratégia, Projetos ou fornecedores.

## Autoridades e identificadores

| Entidade/comando | Autoridade | Consumidor | Invariante |
|---|---|---|---|
| Empresa/unidade/perfil/usuário/grant/entitlement | Governança comum | Todos | Mesmos IDs; uma unidade ativa por empresa e vigência; deny prevalece |
| Contraparte jurídica/física e identidade | business_parties compartilhado | Clientes/prestadores | UUID + tax_id; papel/contato por vínculo; não duplicar mestre nem sobrescrever identidade compartilhada |
| Cliente por empresa | Contratos/customer_parties | Projetos | Identidade da contraparte, não fornecedor clonado |
| Contrato cliente/aditivo/marco/medição/obrigação | Contratos | Projetos/Estratégia; Financeiro futuro | customer-contract e supplier-contract têm tipos/IDs distintos; aprovado não é recebido |
| Projeto operacional e execução | Projetos | Contratos/Fornecedores/Estratégia | Referência UUID distinta de strategic-project; assinar não cria outro projeto |
| Prestador/PJ/MEI/qualificação/contrato/OS | Fornecedores | Espelho funcional em Projetos | Um serviço e persistência canônicos; componente em Projetos não é segunda autoridade |
| Profissional, alocação e disponibilidade | Diretório comum + Projetos; vínculo prestador Fornecedores | Projetos | Pessoa não é usuário; multprojeto/multiempresa não duplica identidade; conflitos temporais precisam de teste |
| Reserva/mobilização/desmobilização/avaliação | Projetos valida operação; Fornecedores conserva OS/histórico | Projeções futuras | Reserva custa zero; mobilização/OS definem compromisso; avaliação uma vez por origem/revisão |
| Escrituração/recebimento/pagamento | Financeiro futuro | Projeções | Nenhum livro, NF ou baixa implementado em 03B |
| Objetivos/metas/OKRs/KPIs | Estratégia | Painéis/consumidores futuros | Indicadores operacionais identificam origem, competência, moeda e unidade, sem duplicar totais |

Cada referência usa `{authority,entityType,id,revision}`. UUIDs são explícitos;
ID negativo/slug/nome não é identidade corporativa. Para importações futuras,
source_system/source_entity/legacy_id devem mapear ao UUID sem merge automático.
Cadastro automático/único em Fornecedores significa upsert autorizado pelo serviço
canônico, com validação e revisão de identidade; não sincronização cega nem cópia
editável no banco de Projetos. O 03B só implementa papel cliente.

## Superfície implementada em 03B

Todas sob /api/v1/contracts, após autenticação GI; corpo JSON, UUID requestId para
escritas, revisões esperadas, respostas com IDs/revisões confirmados.

| Método/caminho relativo | Ação necessária | Semântica |
|---|---|---|
| GET /capabilities?companyId= | read | Capacidades UI, sem substituir guard de cada recurso |
| GET /customers?companyId= | read | Apenas contrapartes vinculadas à empresa |
| POST /customers | edit | Vincular identidade única/contato; conflito quando identidade existente diverge |
| GET /list?companyId= | read | Contratos clientes da empresa, sem leitura global por ID |
| POST / | edit | Criar contrato cliente e outbox/história atômicos |
| GET /:id | read | Contrato, registros, manifesto, autorização e capacidades |
| PUT /:id | edit; approve para reabrir encerrado | CAS agregado, moeda imutável, valores/vigências exatos |
| POST /:id/records/:kind | edit | amendment/milestone/obligation/measurement, CAS agregado e registro |
| POST /:id/measurements/:recordId/state | edit para submit, approve demais | submit/approve/reject/request_changes; motivo humano; não liquidação |
| POST /:id/sign | approve | Registro humano/evidência de assinatura; conserva projectRef, sem Clicksign |
| POST /:id/preproject | DIRETORES + approve | Autorizar/revogar reserva de UUID por decisão humana, sem criar projeto |
| POST /:id/documents | edit + attachments | Somente .txt limitado, conteúdo privado |
| GET /:id/documents/:documentId | read + attachments | Download autorizado por pai e ID, não URL pública |
| GET /:id/history | read | Histórico por contrato autorizado |
| GET /:id/export | read + export | JSON confirmado, sem bytes de documentos |

Não existe demoLogin, bootstrapAdmin, baixa financeira, OCR, provedor de IA,
assinatura externa ou webhook legado na superfície transportada.

## Endpoints propostos para 04B/05B — NÃO MONTADOS

| Método/caminho proposto | Autoridade/permissões | Regras antes de montar |
|---|---|---|
| GET /api/v1/contracts/:id/project-reference | Contratos read + Projetos ação autorizada | Validar acesso ao contrato/projeto e autorização vigente; revelar só DTO mínimo |
| POST /api/v1/projects/supplier-requests | Projects edit + suppliers ação adequada | Escopo do projeto, prestador e papel; comando autorizado ao serviço canônico |
| POST /api/v1/suppliers/orders | Suppliers edit/approve conforme alçada | UUID/idempotência, vínculo projeto autorizado, empresa e condições/versionamento |
| POST /api/v1/suppliers/mobilizations | Suppliers e operação Projetos autorizada | Reserva não custa; fato efetivo, OS/versão, profissional e disponibilidade |
| POST /api/v1/suppliers/demobilizations | Validação operacional por Ana/delegado autorizado | Data efetiva e registro separados, justificativa, período e evento de ajuste |
| POST /api/v1/suppliers/evaluations | Suppliers edit + origem Projetos autorizada | evaluationId/revision únicos, corrigir média parcial F05-07, histórico sem duplicar |

Nomes futuros podem evoluir por versão aprovada; não são promessas de endpoints
ativos. Ana é responsabilidade operacional, não senha/nome/email privilegiado.
Perfis DIRETORES/GERENTES/OPERADORES precisam das concessões por pessoa, empresa,
unidade, módulo e ação. Entitlement UTU/Vinho restrito a Estratégia prevalece
mesmo sobre grant corporativo explícito; testar também jobs/exportações/anexos.

## Schemas/estados v1

Types compartilhados: CanonicalReference, EventEnvelopeV1, SupplierRequestV1,
MobilizationV1 e EvaluationV1. Servem como contrato de implementação futura,
não validação automática de endpoints ainda inexistentes. Cada futuro mount deve
validar runtime, rejeitar campos extras/IDs estrangeiros e registrar decisão.

Evento mínimo:

```json
{
  "eventId": "00000000-0000-4000-8000-000000000001",
  "schemaVersion": 1,
  "eventType": "client_measurement.approved.v1",
  "sourceModule": "contracts",
  "entityId": "00000000-0000-4000-8000-000000000002",
  "entityRevision": 3,
  "companyId": "arqueoproject",
  "unitAtEffectiveDate": "arqueo",
  "effectiveAt": "2026-06-30",
  "recordedAt": "2026-07-01T10:00:00Z",
  "actorId": "00000000-0000-4000-8000-000000000003",
  "correlationId": "00000000-0000-4000-8000-000000000004",
  "idempotencyKey": "source-event-id/version",
  "currency": "BRL",
  "payload": {"status": "approved", "total": "150.30", "financialSettlement": false}
}
```

Exemplo exclusivamente sintético de contrato de mensagem, não mensagem enviada.
Outbox 03B armazena nomes SQL snake_case e schema_version=1. Futura serialização
converte essas colunas ao envelope, usa ID do evento/revisão para dedupe e
correlation_id para requestId. entity_revision é revisão do agregado contratual;
recordRevision adicional é informada em eventos de registros. Essa semântica deve
ser mantida ou versionada, nunca reinterpretada pelo consumidor.

Escrita do 03B: company_id identifica dona, unit_id é unidade vigente na data UTC
da escrita, effective_at é data do evento nesta fatia e recorded_at timestamp do
banco. A competência contratual do marco/medição está no registro próprio e não
vira competência fiscal por inferência. O exemplo futuro pode expressar uma data
efetiva diferente da de registro após definir política/validação e versão.

Estados de medição: draft → submitted → approved/rejected/changes_requested;
changes_requested pode ser editada e voltar a draft para nova submissão. Approved
só reabre por approve/request_changes com motivo e histórico; não sobrescrever
baseline sem auditoria. Política de glosa, excedente, parcial e faturabilidade
permanece pendente; o registro aprovado por humano não publica conta a receber.

## Pré-projeto antes da assinatura

03B reserva projectRef único por contrato após decisão de DIRETORES + approve,
justificativa, limite/expiração humanamente informados. Sem alçada automática ou
limite padrão inventado. Assinar depois mantém o UUID; revogar não apaga.
O estado efetivo indica expired quando aplicável. 04B deve consumir a autorização
vigente e registrar o projeto nesse mesmo ID uma única vez, validar escopo,
revogação/expiração/limite e decisão humana e negar replay com outro projeto.

Não há projeto operacional materializado pelo 03B, nem autorização implícita de
contratar/mobilizar/despesa. Prova atual limita-se a reserva/assinatura/história.

## Mobilização, custos, disponibilidade e avaliação futuros

Reserva provisória → solicitação autorizada → OS/condições canônicas → mobilização
operacional efetiva validada. Custos/compromisso derivam de período e condição OS,
nunca da reserva ou assinatura isolada. Acordar diárias/fracionamento/mínimos e
moeda, sem codificar política não aprovada. Registro de realizado requer evidência
operacional e futura autoridade financeira; não somar aprovado/comprometido/
realizado como três despesas diferentes.

Desmobilização retroativa: solicitação → validação de Ana/delegado com grants →
data efetiva canônica → cessação do custo posterior conforme OS → ajuste por
evento compensatório. Preservar data do registro, motivo/aprovador, evidência,
revisões e original. Não apagar pagamentos nem inferir estorno fiscal automático.
Períodos encerrados e efeitos retroativos dependem de alçada a homologar.

Profissional pode atuar em várias empresas/projetos, com uma identidade e vínculos
temporais autorizados. Detectar sobreposição, percentual/jornada, indisponibilidade
e conflito, sem concluir que toda sobreposição é proibida: regras de conflito
precisam ser configuradas/homologadas. Custos usam condições de OS e competência,
não multiplicação cega por quantidade de projetos/empresas. Avaliação originada
em Projetos passa uma vez ao histórico canônico por evaluationId+revision e chave
idempotente; correções preservam origem/nota anterior/fórmula.

## Entrega, reentrega e estratégia/Financeiro futuros

Outbox transacional/inbox com constraint única, atualização de projeção e checkpoint
atômicos; replay/fora de ordem/falha parcial testados. Não há dispatcher agora.
Principais tipos armazenados: client_contract.created/updated/signed.v1,
client_contract.record_changed.v1, client_measurement.submitted/approved/rejected/
changes_requested.v1 e preproject.authorize/revoke.v1. Eventos não autorizam
consumidor a ignorar seus próprios guards e habilitações.

Estratégia futura: publicar indicador conforme catálogo/agregabilidade, período,
moeda e proveniência; empresa contribui uma vez, unidade/Holding não republicam
seu total como nova empresa. Fonte editada deve invalidar/revisar projeção, sem
reatribuir histórico após troca de unidade. Sem FX, moedas separadas; qualitativo
não somável. Payload mínimo não transporta documentos/PII desnecessários.

Financeiro futuro: evento de marco/medição/condição contratual não comprova NF,
recebimento, pagamento ou escrituração. Nenhum livro paralelo criado nesta rodada.
Eventos de clientes e de prestadores têm namespaces/tipos diferentes.

## Critérios de aceite antes de ativar qualquer conector

- Contrato de interface versionado, validação runtime e compatibilidade para
  campos desconhecidos/mudanças de versão; dados sintéticos e egress bloqueado.
- Perfil/grant/deny/entitlement, empresa/ownership de cada ID relacionado; usuário
  com acesso apenas à tela espelhada não ganha acesso global ao fornecedor.
- RequestId e replay concorrente não duplicam parte, projeto, contrato, OS, custo
  ou avaliação; projeções recuperam falha parcial com inbox/outbox auditáveis.
- Projeto pré-assinatura autorizado permanece mesmo após assinatura; revogação,
  expiração, limite e conflitos multprojeto testados sem atalhos por nome de pessoa.
- Reserva custo zero; data efetiva e moeda/OS corretas; retroatividade interrompe
  custo validado, deixa histórico; período fechado e transferência testados.
- Estratégia recebe proveniência/competência sem dupla contagem; Financeiro não
  consome aprovação como caixa. Nenhuma conexão IA/Clicksign/Manus/ATENA nesta fase.

Decisões em aberto e sequência concreta estão em IMPLEMENTACAO_03B_CONTRATOS.md.

## 03C — fronteiras estabilizadas e endpoints reais

`GET /api/v1/contracts/:id/project-reference/v1?proposedValue=100.00`: exige sessão e contracts/read no escopo da empresa. Responde schemaVersion, contractRevision, authorizationRevision, projectRef imutável, status efetivo (inclusive expired/revoked), moeda, limite informado, withinLimit (null quando não verificável), requiresHumanDecision e grantsExpenseAuthority=false. eligibleForProjectLink indica somente elegibilidade da reserva, não substitui revalidação transacional no futuro 04B nem concede despesa/mobilização. Não existe endpoint para criar projeto operacional.

Medições: draft → submitted → approved → billable, com reject e request_changes autorizados. Reapresentação ocorre após edição de changes_requested. Glosas contêm índice da linha, decimal e justificativa, preservados em histórico com revisão. Aprovação/faturabilidade são decisões humanas distintas; estados invoiced/received não podem ser escritos por Contratos. Financeiro futuro deverá devolver referências canônicas e eventos idempotentes, jamais inferidos da aprovação.

`GET /:id/report.pdf[?recordId=UUID]` exige read+export e valida ownership do registro. Documento TXT versionado aceita previousDocumentId e recordId do mesmo contrato; versões antigas permanecem acessíveis com read+attachments. Não há links públicos. Novos consumidores não devem ler tabelas internas nem criar cópias de mestres.
