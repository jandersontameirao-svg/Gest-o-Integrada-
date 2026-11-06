# Interface interna Projetos–Fornecedores v1 (especificação futura)

Core mantém companyId/partyId/userId. Pessoa/profissional é business_parties/partyId; usuário é users/userId. Projetos registra somente vínculo operacional à empresa, não um novo mestre de prestadores. Contratos controla clientes/marcos/medições; Projetos controla operação/tarefas/disponibilidade; Fornecedores será autoridade de documentação, contratos de prestadores e OS. Financeiro futuro controla liquidação. Projetos estratégicos não são operacionais.

SupplierRequestV1: schemaVersion, requestId, companyId, operationalProjectId, taskId, requestedPartyId ou registrationIntent, templateId opcional, datas, reason, requesterId e expectedProjectRevision. Backend 05B deve conferir escopo/ownership e deduplicar identidade corporativa, retornando supplierPartyId canônico. Cadastro ausente não é simulado neste incremento.

ServiceOrderV1: serviceOrderId/supplierContractId, profissional/prestador, projectId/taskId/companyId, moeda, condições, período, mínimo contratual e revisão. Emissão exclusiva de 05B, UNIQUE de origem e idempotência; nenhuma segunda OS em Projetos.

OperationalValidationV1: eventId/schemaVersion/companyId/projectId/taskId/orderId/orderRevision, effectiveFrom/effectiveTo, recordedAt, actorId/validatorId, reason/evidenceIds e expectedRevision. Guard por papéis/concessões da Gerência de Projetos, nunca nome Ana hardcoded.

Reserva (sem custo) → contratação/OS canônica → mobilização efetiva → execução → desmobilização (inclusive retroativa) → validação operacional → eventos futuros. Guardar data efetiva e de registro; execução de 20 dias numa OS de 30 ajusta apuração ao efetivo, ressalvado mínimo. Períodos fechados exigem revisão autorizada; preservar fatos e compensar, nunca apagar silenciosamente. Realizado substitui a parte correspondente do compromisso, não somar previsto + compromisso bruto + realizado.

Hoje committed/saldo após compromissos são null/pending_suppliers_05b. Reserva/confirmação de disponibilidade não constitui mobilização ou OS. Fatos próprios validados exigirão linhagem/reconciliação na integração para impedir duplicidade com OS. Clicksign, notificações e APIs externas desligadas.

Critérios para 05B: identidade única, direitos por empresa/ação, OS idempotente, reserva sem custo, mobilização/desmobilização efetivas/retroativas, validação por gerente/delegado, mínimos/revisões/competência, auditoria e eventos deduplicáveis. Não implementar Financeiro para suprir ausência de autoridade canônica.

## Incremento 05B estrutural — sem emissão

O espelhamento em Projetos agora usa o mesmo `SuppliersWorkspace` e `/api/v1/suppliers`: cadastro preparatório, modelos, rascunhos e revisões. Identidade é `business_parties.id`; vínculo operacional é segregado por empresa, sem segundo mestre. `projectId/taskId` apontam para Projetos e são validados no backend. `supplierId`, `templateId/templateRevision` e `parentId` são referências canônicas internas.

Endpoints atuais: `/catalog`, `/list`, `/`, `/:id`, `/:id/history`, `/templates`, `/templates/:id/revisions`, `/documents`, `/documents/:id/revisions` e `/documents/:id/export`. Escritas usam requestId, CAS na edição, autoria e motivo. Os estados são somente draft/in_review. Exportação JSON tem marca de não emissão. Revisões de modelo/documento são imutáveis; cabeçalhos de vínculo não são alterados pelo editor.

Contrato/OS/medição/aditivo/indicadores nestes endpoints são **rascunhos documentais**. Não confundir com os contratos de cliente de Contratos, OS operacional canônica emitida ou eventos financeiros. As interfaces operacionais especificadas anteriormente continuam pendentes. API rejeita approve/issue/sign/mobilize/demobilize/calculate/settle. Orçamento comprometido/realizado não recebe valores desses rascunhos. Regras do compêndio aguardam revisão final e aprovação.
