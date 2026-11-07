# 05F — Integração documental e alterações controladas de OS

Base: `c859dfb4cea775d587643ff06a5822547727c340`, branch `dev/comando-05b-fornecedores`, PR #9. Sem merge, deploy, dados de produção ou integrações externas. Esta entrega não representa homologação integral.

## Incremento funcional

O contrato operacional existente pode usar o texto individualizado do mesmo rascunho canônico na criação ou por vínculo explícito enquanto rascunho. O servidor busca a revisão vigente, verifica hash, origem, identidades, placeholders e datas; nunca confia no texto enviado pelo navegador. Congela texto integral, modelo/revisão, documento/revisão, SHA-256, bindings, proveniência, escopos, autor e data. Revisões posteriores da origem não alteram o contrato. Aprovação e registro formal permanecem decisões separadas, sem assinatura externa. O formulário legado é mantido. O limite de 24 mil caracteres foi substituído por 180 mil, igual ao editor privado; nenhuma truncagem silenciosa. O limite HTTP é 1 MiB, preservando limites por campo.

Texto vinculado exige permissão de anexos de Fornecedores e dos escopos de Projeto/beneficiário congelados. Lista legada mantém metadados, mas remove corpo e bindings, inclusive das versões históricas, quando falta autorização. Histórico/exportação/ações sobre instrumento privado exigem os mesmos escopos. A autorização precede o cache de idempotência.

OS emitida ainda não mobilizada admite proposta independente: rascunho → revisão → aprovação → aplicação; devolução/cancelamento e histórico permanecem disponíveis. Datas, quantidade, preço e condições são editáveis; empresa, fornecedor, profissional, contrato, projeto, atividade, moeda e origem não são substituídos. Aplicação altera a mesma OS, sem criar custo, despesa ou pagamento. Revalida revisão da OS/contrato, orçamento vigente, teto contratual, orçamento do projeto, períodos abertos e permissões. Mudança de orçamento exige devolução e rebase explícito. Propostas concorrentes não podem sobrescrever uma aplicação. Encerramento contratual exige resolver propostas pendentes.

Mobilizadas, desmobilizadas pendentes e validadas não admitem esse fluxo: correções exigem compensações auditadas ainda não implementadas. Histórico permanece consultável, sem reprecificar fatos anteriores.

## Autoridade e integração

Fornecedores continua autoridade única de prestador, contrato e OS. Projetos utiliza os mesmos componentes/endpoints/IDs. Reserva/emissão/alteração antes da mobilização não geram compromisso. Financeiro não foi implementado. Eventos monetários continuam inelegíveis para consolidação de Estratégia sem distribuição comprovada por competência/unidade histórica/moeda.

Corrigida a distinção entre fonte canônica consultada e vazia (`[]`: compromisso zero e saldo calculável) e fonte ausente (`undefined`: desconhecido). O teste original sem fonte preserva desconhecido; a API integrada agora demonstra saldo após fatos próprios sem simular indisponibilidade do backend já instalado.

## Persistência, rollback e segurança

Migração sequencial 015 cria propostas/histórico/cache próprios, com chaves por empresa e controle de revisão. Runner existente verifica checksum. Aplicações ficam duráveis nas tabelas canônicas 010; vínculo textual fica no JSON do contrato 010. Down 015 remove propostas pendentes, histórico específico e cache, não desfaz OS já aplicada nem apaga texto contratual. Exige backup controlado e banco isolado; não é reversão de negócio. Reaplicação não recria decisões apagadas. Testes verificam durabilidade e ausência de replay fantasma.

Autenticação GI, permissões por ação/empresa e escopos adicionais continuam obrigatórias; UTU/Vinho negadas à operação. Transações, locks de ator/empresa, CAS, requestId/hash e auditoria existentes são reutilizados. Nenhuma dependência nova, segredo ou fonte privada é publicada.

## Rastreabilidade e provas

- Campos contratuais: `client/suppliers/legacy/SupplierContractFields.tsx`, derivados do `ContractEditor.tsx` original; formulário preservado e texto de origem protegido contra edição acidental.
- Formulário de OS 05C extraído para `OrderFields.tsx`, compartilhado entre reserva e proposta; não apresentado como novo componente legado.
- Vínculo/revisão: `ContractTextLink.tsx`, `bound-instrument.ts`, `integration-router.ts`.
- Unitários: `suppliers-integration.test.ts`, `projects.test.ts` (texto longo, datas, privacidade histórica, zero versus desconhecido).
- MySQL: `suppliers-integration-bindings.integration.ts`, `suppliers-integration-orders.integration.ts` (salvar/recarregar/revincular, texto autoritativo, escopo, idempotência, concorrência, rebase, custo, encerramento, rollback/reaplicação).
- Playwright: `suppliers-integration.spec.ts` (criação com texto longo, vínculo de nova revisão, aprovação/ativação, proposta/edição/revisão/aplicação, recarga/histórico, mobilização e bloqueio de alteração).
- TypeScript strict e build aprovados localmente. CI executa npm ci, regressão integral, MySQL isolado duas vezes, migrations/checksum/down/up, Playwright e auditoria. Resultados finais e links por SHA registrados na PR; não substituir execução de CI por esta descrição.

## Parcial e futuro

Compensações após mobilização/validação, rateios e distribuição histórica por competência/unidade, poderes documentais/alçadas, fidelidade gráfica Word e variantes de dashboard continuam evoluções. Não há assinatura, pagamento, quitação ou aprovação jurídica automática. A revisão do compêndio não bloqueia o desenvolvimento; versões privadas posteriores são controladas. Preparação para homologação visual: verificar texto integral, datas, modal de vínculo, redação por escopo, decisões independentes, rebase, saldo e histórico com dados sintéticos. Nenhuma homologação externa autorizada nesta entrega.
