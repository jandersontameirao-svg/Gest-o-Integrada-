# 05C — primeiro fluxo operacional de contratação e OS

## Base e limites

Continuidade na PR #9, branch `dev/comando-05b-fornecedores`, base `f7b126c4ae3566162f328d0f10599233593e358b`. Compêndio atual autorizado como referência de trabalho v1; revisão final não bloqueia o desenvolvimento. Sem merge, deploy, produção, Financeiro, Clicksign, IA ou outros conectores externos.

Esta entrega é um incremento vertical. Não conclui o módulo de Fornecedores nem todos os itens do 05C. A aprovação individual registrada é uma decisão interna com evidência; ativação registra execução formal informada pelo usuário. Nenhuma assinatura digital é executada ou inferida. Não emitir documento jurídico completo a partir de um catálogo estrutural.

## Funcionalidades persistidas

1. Individualizar contrato de prestador a partir de rascunho existente, com identidade/empresa canônicas, referência histórica, tipo, objeto, representante, valor, moeda, vigência, condições e texto do instrumento. Origem e revisões são congeladas. Um rascunho não cria dois contratos canônicos.
2. Salvar/editar contrato ainda em rascunho, aprovar com concessão `suppliers:approve` e evidência dos poderes, registrar execução formal e data. Contrato aprovado fica imutável neste incremento; alteração formal futura exige instrumento próprio.
3. Criar reserva de contratação/OS vinculada ao contrato, profissional individual canônico, projeto e atividade. Sem outro mestre de prestadores/profissionais. Referência de origem única por empresa, idempotência e CAS. Uma pessoa pode estar vinculada a mais de empresa/projeto; não há bloqueio universal de sobreposição de disponibilidade.
4. Emitir OS somente com contrato ativo e execução formal registrada, moeda/vigência compatíveis e teto contratual disponível. Emissão não inicia custo ou compromisso operacional. Cancelar somente antes da mobilização.
5. Confirmar mobilização efetiva com evidência e poderes de Gerência/delegado (`projects:approve` e acesso de Fornecedores), sem nome de pessoa hardcoded. Conferir orçamento aprovado por projeto/atividade/moeda. A partir daqui surge compromisso operacional.
6. Registrar desmobilização, inclusive retroativa, com data efetiva e data de registro distintas, motivo, autoria e histórico. Enquanto aguarda validação, o compromisso original permanece visível; não há ajuste silencioso.
7. Validar execução. Diária exige datas efetivamente prestadas, evidência e valor compatível com tarifa/mínimo explícitos; não presume dias corridos trabalhados. Mínimo não informado pelo contrato não é inventado. Mesma diária integral não é aprovada duas vezes para contrato/profissional/data na mesma empresa. Mensal/entrega exige valor específico validado, dentro do teto; não aplica pró-rata 20/30 automático nem converte em diária.
8. Após validação, realizado substitui a parcela comprometida da OS. Não há pagamento, faturamento, NF ou lançamento financeiro. Valor liquidado é desconhecido (`settled=null`, `settlementStatus=not_integrated`), sem inferir recebimento/pagamento zero a partir de dados operacionais. Eventos versionados ficam em outbox local com autoria, revisão, data efetiva e unidade histórica; nenhum dispatcher externo é ativado. `unitId` situa o evento na data efetiva e não distribui o valor entre competências/unidades. Consolidação estratégica fica explicitamente inelegível (`strategyConsolidationEligible=false`) até existir alocação comprovada por período/unidade, evitando atribuir toda OS à unidade atual após uma transferência.
9. Encerrar/reabrir competências explicitamente. Reabertura exige DIRETORES e concessão `projects:reopen`, motivo e auditoria. Alterações de custo em competência encerrada são recusadas; não há flag de bypass no cliente.
10. Consultar, recarregar, ler histórico e exportar JSON autenticado de contratos/OS, inclusive pela área espelhada em Projetos. Não há emissor ou banco de OS paralelo.

## Segurança, concorrência e Core

`/api/v1/suppliers/operations` pertence ao módulo Fornecedores e usa a autenticação GI. Leituras, exportações, histórias, referências filhas e escritas verificam empresa/módulo/ação; OS exige acesso ao projeto/atividade. Criar/editar reserva exige `projects:edit`; emitir/cancelar exige `suppliers:approve`; mobilizar/desmobilizar/validar exige `projects:approve`. Toda escrita também exige `suppliers:read/edit`.

Permissões atuais são revalidadas antes do replay idempotente. Revisões CAS, locks transacionais e serialização por empresa evitam corrida entre tetos, competências e aprovadores diferentes. A serialização por empresa é opção conservadora inicial, passível de otimização com medição. Tabelas e FKs preservam empresa, contrato, profissional, projeto e atividade.

UTU/Vinho continuam sem acesso operacional. Não se copiam bootstrap, OAuth, login privilegiado ou tokens do legado. Seeds de novos direitos são exclusivamente sintéticos no banco `_demo`.

Mudanças limitadas em Projetos: consumir custos canônicos por atividade, proteger remanejamentos contra compromissos/realizados, negar reinterpretação da moeda e impedir que fatos próprios e OS representem custos na mesma atividade sem conciliação explícita. Antes de existir OS em projeto legado, os campos de compromisso continuam sem cálculo; com OS, o orçamento usa a fonte canônica. Não mistura moedas. Reserva/confirmação de equipe continua sem custo.

## Banco e migração

Migração 010 incremental e reversível: contratos de prestadores, OS, histórico, competências, origens de diárias aprovadas e cache idempotente própria. Não altera migrações 001–009 nem cadastros mestres. Down 010 remove também a cache das operações e seus eventos locais; cache dos rascunhos 009 permanece intacta. Teste incremental prova que uma repetição após rollback/reaplicação não recebe ID fantasma de registro removido. Down exige banco descartável conforme executor vigente e remove dados do incremento. Em ambiente com dados, rollback destrutivo exige plano próprio de preservação, não execução automática. Checksum, dirty state, down/reaplicação e regressão são exercitados na CI.

## Reaproveitamento demonstrado

Fonte `arqueo-fornecedores@8b5c94098333922e9dcc00ca5c67b612da24a26a`, `ContractEditor.tsx`: blocos Identification, Parties e Financial & Dates adaptados em `SupplierContractFields.tsx`, mantendo campos e hierarquia visual. Contratante é somente leitura e canônica; removidos desse trecho o escopo inseguro all_group, status arbitrário e premissa de moeda BRL. Autorização e transições ficam no backend. Não se declara port do editor inteiro, itens, importadores, IA, assinatura, anexos ou PDFs. Blocos existentes de cadastro e histórico de 05B continuam em uso.

Não foi localizada na árvore auditada uma interface madura específica de mobilização/OS para copiar. Fluxo novo atende o contrato interno aprovado. Matriz JSON traz hashes e estados, sem confundir cópia de arquivo com paridade funcional.

## Testes e evidências

Build/TypeScript estrito e unitários locais. CI: npm ci, MySQL isolado, idempotência, migrações/checksum, rollback/reaplicação, regressão de Estratégia/Contratos/Projetos/05B, Playwright e auditoria de dependências. Evidência final vinculada ao SHA no comentário da PR #9; não presumir aprovação de execução em andamento.

Novos testes: reserva/emissão sem custo, precisão decimal, datas/minímo e regimes distintos, edição concorrente, referência única, replay/revogação, duas aprovações em corrida contra um teto, orçamento por atividade, competência encerrada/reaberta, data retroativa, diária duplicada, IDs adulterados, empresa alheia, UTU/Vinho e exportação. E2E percorre contrato → edição → aprovação → execução formal → reserva → emissão → mobilização → desmobilização → validação → histórico/exportação no espelhamento do projeto.

## Parcial e futuro

Boletim de fornecedor completo (linhas, glosas, rejeição/correção/reapresentação e faturabilidade), avaliações originais e anexos/qualificação documental não estão completos neste incremento. A validação da OS não deve ser chamada de boletim completo. Textos integrais dos 13 modelos, 52 anexos individualizados, PDF/DOCX, aditivos operacionais, procurações/delegações documentais com validade/limite, reconciliação de custos preexistentes e eventos compensatórios pós-validação ficam no backlog.

O texto individualizado é informado pelo usuário e auditado; não há atestado automático de regularidade fiscal, validade jurídica ou veracidade da execução formal. Referências e numeração são manuais, sem padrão jurídico inventado. Limite técnico deste incremento: OS de até 366 dias, sem afirmar que esse seja um limite jurídico; períodos maiores exigem evolução do validador. Validação de diária integral por data não contempla fracionamento/rateio multiprojeto da mesma diária neste incremento. Ordens já validadas são imutáveis; correções futuras exigirão fluxo compensatório.
