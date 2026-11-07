# Continuidade 05E — aditivos e encerramento de prestadores

Base validada: PR #9, `7e252aea91ed42f9e46fc69b400796359d84ae9e`, CI #54. Desenvolvimento já autorizado, sem novo aceite por incremento. PR continua em rascunho; sem merge/deploy, produção ou serviços externos. Nenhuma alteração do aplicativo original. Compêndio autorizado continua como base de trabalho, sem bloqueio por revisão.

## Fluxo funcional

API `/api/v1/suppliers/lifecycle`, integrada à área canônica de contratação de prestadores e ao espelhamento em Projetos. Aditivo: rascunho → em revisão → aprovado → aplicado por vigência. Há edição/CAS, devolução para correção/rebase explícito, cancelamento sem exclusão, histórico e exportação JSON/PDF. Aprovar não aplica termos; aplicar exige registro/evidência de execução formal e competência aberta. Não executa assinatura digital nem liquidação.

O formulário original `client/src/components/contracts/ContractAmendments.tsx` de Arq Fornecedores (SHA 8b5c9409) foi reaproveitado em `SupplierAmendmentFields.tsx`: título, número, tipo financeiro/escopo/prazo/misto, descrição, variação, novo total, novo término, cláusulas e observações. Grade, componentes, editor e cores de listagem preservados/adaptados. Novo total passa a ser calculado com decimal exato e validado no backend, em vez de dois valores editáveis independentes. Estado deixa de ser seletor livre; transições são autorizadas no backend. Importação de PDF por serviço de IA e marcos com campos de pagamento não são portados: assinatura/IA estão desligadas e Financeiro continua como autoridade futura. Exclusão física irreversível vira cancelamento auditado.

## Termos por período e integridade

Condições originais do contrato permanecem intactas. Cada aditivo aplicado acrescenta ao mesmo contrato canônico uma versão de termos, data efetiva, revisão, ator, referência e hash das cláusulas. Consulta por data retorna a versão vigente; revisões na mesma data são ordenadas pela revisão contratual. A linha do tempo e o histórico preservam versões anteriores. Consultas somente por dia representam a última revisão daquele dia; decisões de emissão preservam também a revisão/ID exatos para distinguir alterações no mesmo dia.

Permite variação positiva/negativa de teto, objeto consolidado, condições de pagamento e término. Identidade do prestador, empresa, moeda, referência original e início não são transferidos pelo aditivo. Campos adicionais ou liquidatórios são recusados. Variação e novo total precisam corresponder exatamente. Novo teto não pode ficar abaixo dos valores já autorizados/validados de OS. Novo término não pode invalidar OS existentes: requer revisão explícita dessas OS antes da redução.

Aplicação revalida a revisão-base do contrato e do aditivo na transação. Duas aplicações da mesma base não podem vencer simultaneamente. Aditivo aprovado sobre base desatualizada precisa de devolução, edição/rebase e novas decisões; não é aplicado silenciosamente. Há limite técnico de 100 versões por contrato, sem afirmar limite jurídico.

Nesta etapa, aplicação de aditivos é atual/futura e não anterior à última vigência já aplicada; versões diferentes no mesmo dia são admitidas por sequência de revisão. Inserção retroativa ou anterior a uma alteração futura já aplicada exige fluxo compensatório/reprogramação ainda não implementado. Isso é limitação técnica explícita para evitar reescrever decisões, não política jurídica presumida. Data formal é fornecida por responsável autorizado e não pode ser futura ou posterior à vigência declarada.

## Integração com OS e Projetos

Reserva continua sem custo. Criar/editar/emitir OS verifica vigência/termos por início previsto; emissão preserva `contractAuthority` com revisão contratual, versão, data-base, teto e término. Um aditivo posterior não reprecifica a OS nem substitui essa prova. Aumento futuro não pode financiar emissão retroativa anterior ao aumento. Reduções já aplicadas/agendadas restringem novas emissões para não ultrapassar o teto menor quando vigente; não se ignora redução por escolher data antiga. Toda emissão considera os valores já autorizados/validados das demais OS, sem somar compromisso e realizado da mesma OS.

Aditivo não aumenta orçamento aprovado de Projeto, não remaneja atividades, não cria outra OS e não altera execução/custo já validado. Mobilização continua exigindo orçamento e habilitação documental. O espelhamento em Projetos usa os mesmos IDs e serviço de Fornecedores; não cria mestre concorrente.

## Encerramento

Registro autorizado de conclusão/rescisão exige evidência, motivo, data efetiva e revisão. Bloqueia enquanto houver OS reservada/emitida/mobilizada/aguardando validação, aditivos pendentes ou alteração aplicada com vigência posterior ao encerramento. Não cancela reservas nem desmobiliza automaticamente. Data não pode anteceder início, execução formal ou execução operacional validada; competência fechada exige reabertura autorizada.

Quando válido, marca o mesmo contrato como encerrado, mantém versões, autoria, datas e snapshot do custo operacional realizado. Novas reservas/OS e mobilizações ficam negadas. Boletins e documentos históricos não são apagados. Encerramento operacional não implica pagamento, quitação, multa, desconto ou distrato jurídico automático; liquidado permanece desconhecido. Não se exige informação financeira inexistente para fingir uma quitação.

## Segurança, migração e rollback

Leitura do ciclo exige Fornecedores/read e anexos; edição exige edit; decisões de aprovação/aplicação/cancelamento/devolução/encerramento exigem approve; exportação exige export. Submissão pode ser realizada com edit. Se a origem pertence a projeto, exige leitura e anexos de Projetos; beneficiária de Estratégia é revalidada. UTU/Vinho permanecem sem operação. Permissões são revalidadas antes de replay idempotente. Lock de empresa, lock do ator, CAS e transação protegem decisões e limites. Sem nomes de pessoas hardcoded em concessões.

Migração 014 acrescenta propostas/revisões textuais e cache próprios, sem alterar 001–013. Fatos efetivamente aplicados são guardados no payload versionado do contrato canônico e no histórico/eventos de operação já existentes, com termos e hashes, em transação. O domínio Contratos de clientes não é modificado. Eventos locais permanecem sem envio externo e inelegíveis para consolidação monetária automática de Estratégia, até a distribuição por competência/unidade histórica ser implementada.

Down 014 apaga **textos/revisões de proposta** e cache dessa extensão. Não desfaz decisões aplicadas nem restaura teto antigo: preserva versões contratuais, encerramento, histórico operacional/eventos e custos. Reaplicação de schema não recupera cláusulas de propostas apagadas; restauração integral exige backup privado. Aplicar novamente um ID de proposta apagado não devolve sucesso/ID fantasma; encerrar novamente não cria segunda decisão. Não usar rollback de schema para cancelar aditivo. Troca para código antigo que não compreenda as versões duráveis exige avaliação de compatibilidade própria; o teste cobre schema up/down com o código atual.

## Validação e pendências

Unitários: precisão, temporalidade/revisões, limites de redução futura, custo autorizado versus validado e DTOs. Integração MySQL sintética: cadastro/edição/concorrência, revisão, competência, aplicação idempotente, consulta histórica, emissão sem usar aumento retroativamente, redução e limite, duas aplicações concorrentes, devolução/rebase, agendamento, encerramento bloqueado/permitido, valores preservados, escopo/IDs/UTU/Vinho/revogação, PDF/JSON e rollback/reaplicação. Playwright: formulário original, edição/recarga, revisão/aprovação/aplicação, consulta por data, histórico/PDF e encerramento. Regressão de Estratégia/Contratos/Projetos/Fornecedores e auditoria de dependências.

Resultados finais por SHA/CI/artefato ficam registrados na PR #9 após execução. Não declarar aprovados checks em andamento.

Próximos blocos: vínculo explícito do texto 05D ao instrumento operacional, poderes/delegações e alçadas documentais, aditivos/correções de OS emitidas, revisão de vigência anterior/agendamento, compensações após validação, rateios e consolidação temporal. Encerramento jurídico com texto de distrato, remissões e diagramação integral exigem evolução própria. Nada disso bloqueia a continuidade técnica já autorizada, e não há homologação integral.
