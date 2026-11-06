# Transição proposta — Gestão de Contratos (sem implementação)

A rodada 02C mantém a PR #3 em rascunho. Estratégia possui fluxos funcionais,
mas não está integralmente concluída. Contratos deve começar somente após revisão
expressa do CEO. Não houve acesso nem alteração no ARQUEO-CONTRATOS nesta rodada.
Não presumir acesso ao seu código, schema, banco ou backup.

## Fontes necessárias para o próximo comando

- Cópia autorizada do código ARQUEO-CONTRATOS, inventário de funcionalidades,
  licença/proveniência, schema/migrações sem dumps reais ou segredos.
- Fluxos maduros de contrato/aditivos/marcos/medições e regras de autorização;
  caracterização antes de decidir reaproveitar/adaptar/reconstruir.
- Confirmar base aprovada da fundação e destino de integração da PR #3; não fazer
  merge para viabilizar desenvolvimento sem autorização.

## Fronteiras que devem ser preservadas

| Autoridade | Informação | Integração futura |
|---|---|---|
| Governança comum | Empresas, pessoas, perfis, escopos e habilitações | Reusar IDs; nenhum cadastro mestre paralelo |
| Contratos | Contrato, aditivos, partes, marcos, obrigações | Fonte única dos seus estados e eventos |
| Projetos operacionais | Execução operacional vinculada ao contrato | Referência explícita; não reutilizar entrada project estratégica como projeto operacional |
| Estratégia | Objetivos, metas, OKRs, iniciativas e projetos estratégicos | Referência futura a contrato/projeto operacional, com proveniência |
| Financeiro | Escrituração, recebimentos, pagamentos | Consumir projeções/eventos, não gerar segundo livro na Estratégia |
| Arq Fornecedores | Cadastro/qualificação de fornecedores | Módulo integrado, espelhamento funcional futuro em Projetos |

UTU/Vinho 24 Horas continuam sem habilitação operacional de Contratos/Projetos/
Fornecedores/Financeiro; participar da Estratégia não concede essas permissões.
Uma empresa mantém uma unidade ativa, com histórico por vigência. Holding é única.

## Contratos internos a definir e testar antes de conectar

IDs de origem imutáveis + tipo/versão do evento + idempotency key; competência,
moeda e unidade; eventos de alteração/cancelamento sem reatribuição retrospectiva.
Contribuições de Estratégia usam source_id/revision/plan_version, escopo e período.
Não publicar cópia de total corporativo como contribuição de empresa. Sem moeda
ou câmbio homologado, manter moedas separadas. Publicação atual é manual e
controlada; não presumir que já existe conector automático de Contratos.

Leituras/escritas/exportações/anexos/jobs precisam passar pelo guard central.
Provar isolamento entre empresas, negações, UTU/Vinho, idempotência e referências
antes de liberar qualquer integração. IA, Manus e ATENA OS seguem desconectados.

## Backlog de Estratégia após esta rodada

PESTEL e variantes completas restantes; riscos/respostas; PDFs/relatórios; anexos,
comentários e templates; orçamento/cenários e análises financeiras com fórmulas
homologadas; agregações avançadas/FX, paginação e acessibilidade. CI e cenários
sintéticos existentes devem permanecer como regressão nos próximos comandos.
