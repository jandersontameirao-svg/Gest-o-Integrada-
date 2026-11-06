# Comando 03B — incremento inicial de Contratos

**Estado: PARCIAL, primeiro fluxo funcional para revisão. Não é homologação integral.**
Branch dev/comando-03b-contratos; base PR #3, SHA
467a9f7d56fddf286600983912bab3e333c0a770, que contém a governança e Estratégia 02C.
PR #1 b60ab6adf058b4cc5cce2dcadce2bb7efc6c6da3 e PR #3 continuam sem merge.
SHAs e checks foram conferidos antes de criar a branch; nenhuma branch existente
foi alterada. Auditorias PR #5/#4/#6 são referências, não merges/cherry-picks.

## Fontes e reaproveitamento comprovável

ARQUEO-CONTRATOS c799a92100998c92a2b480c8ab8ddeb1d33ec77c. Reaproveitamento
real de ContractManagement.tsx e dos blocos JSX manuais de CompanyDetails,
ContractDetails e MilestonesSection. [Manifesto de origem e hashes](PARIDADE_03B_CONTRATOS.json).
O manifesto mede origem selecionada, não equivalência integral do aplicativo.

Interface de gestão conserva painéis, abas, informações, listas de marcos e
aditivos; formulários conservam campos/controles/experiência manual da origem.
O adaptador finito usa REST autenticado GI, não tRPC/SDK remoto, OAuth Manus ou IA.
Controles UI compartilhados da GI/SGE são reutilizados sem novas dependências.
A infraestrutura simples de abas substitui o transporte/contexto legado; ainda
precisa de revisão completa de acessibilidade/teclado e paridade visual.

Não foram copiados dump, ZIP, certificados, chaves, sessões ou credenciais. Fontes
Projetos ZIP14a3d081ec9efe179bb8cc17ae74dc2a74dd7d325b457e97ace7f1001ce9ede1 e
Fornecedores8b5c94098333922e9dcc00ca5c67b612da24a26a orientam interfaces, não
implementam seus aplicativos nesta entrega. O código legado não foi executado.

## Fluxo funcional entregue

1. Login independente GI; selecionar Contratos e empresa habilitada.
2. Cadastrar/vincular contraparte corporativa por CPF/CNPJ normalizado. Identidade
   é única; contato comercial é por empresa. Nesta fatia valida-se formato de 11/14 dígitos, não consulta cadastral ou
   verificação jurídica; validação cadastral completa continua pendente. Identidade divergente gera conflito
   e exige revisão controlada; não sobrescreve nome global de outra empresa.
3. Criar contrato cliente com referência interna provisória, moeda explícita,
   valor base decimal, vigência, descrição, observações, código legado,
   gestor/aprovador e e-mails. Editar/recarregar mantém os campos e revisões.
4. Criar/editar aditivos com sequência local estável, tipo, delta, status,
   vigência, término, descrição/observações. Valor vigente é derivado da base e
   aditivos ativos/concluídos cuja vigência chegou; não incrementado duas vezes.
   Reduções que produzam valor negativo em qualquer vigência são recusadas.
5. Criar/editar marcos com valor previsto, prazo, condição e estado contratual;
   API permite vínculo a aditivo do mesmo contrato. Obrigações possuem prazo,
   responsável e estado. Nenhum desses estados significa pagamento.
6. Medições/boletins básicos: múltiplos itens ligados a marcos do mesmo contrato,
   total decimal exato, período, observações, rascunho, submetida, aprovada,
   rejeitada ou devolvida. Aprovação exige ação approve e justificativa. Edição
   de submetida/aprovada é bloqueada até devolução autorizada; história preservada.
   UI oferece submissão/aprovação/devolução; rejeição também existe na API.
7. Anexar/baixar documento texto privado (.txt) com permissões read/edit e
   attachments conforme ação. Manifesto e eventos de anexação também são ocultados de leitor sem attachments.
   Somente backend entrega bytes; nenhuma URL pública
   ou externa aceita. JSON de contrato inclui manifesto, não conteúdo do anexo.
8. Exportar JSON confirmado com read+export; consultar história de alterações.
9. Diretor autorizado decide pré-projeto: justificativa, limite/expiração
   escolhidos humanamente, referência UUID reservada. Não cria projeto operacional,
   alocação, despesa ou OS. Status efetivo indica expiração, sem job externo.
   Registro posterior de assinatura formal conserva a MESMA referência. Revogar
   preserva referência/história e não apaga eventual informação de integração.

Assinatura é registro humano de data/evidência, não assinatura digital ou emissão
Clicksign. Data de assinatura formal é imutável nesta fatia. Projeto efetivo e
validação do consumo da autorização pertencem ao futuro 04B.

## Arquitetura/persistência e mudanças comuns

Migração 005 incremental: business_parties/customer_parties (mestre corporativo e
papel cliente por empresa), client_contracts, client_contract_records, documentos,
história, autorização de pré-projeto, requisições idempotentes e outbox local.
Não duplica companies/users/escopos, fornecedores ou projetos. O futuro 05B deve
referenciar a mesma contraparte ao atribuir papel prestador, não criar segundo
mestre de pessoa jurídica. Profissional não é automaticamente usuário autenticado.

Valores são strings decimais normalizadas, cálculos em bigint/centavos; sem
misturar moedas ou inferir câmbio. Moeda do contrato é imutável. Datas validadas,
relacionamentos e referências parametrizados. Atualizações usam lock no contrato,
revisão esperada do agregado e revisão do registro; concorrência obsoleta retorna
409. Sequências por tipo/contrato são geradas sob lock. Toda escrita contratual,
história e evento associado acontece na mesma transação.

Chaves requestId UUID por ator: mesma requisição retorna a resposta confirmada,
sem reaplicar efeito; chave com outro conteúdo/caminho/empresa é recusada.
Repetir autorização de pré-projeto revalida DIRETORES antes de devolver resposta
idempotente; rebaixamento de perfil não é contornado por replay. Lock do
ator serializa tentativas e a constraint é proteção adicional. A UI mantém a
mesma chave ao repetir uma solicitação falha com conteúdo inalterado; não há
sucesso de salvamento antes da resposta persistida. Revisão conflitante conserva
erro/entrada até recarga explícita. Edição não salva impede troca de módulo.

Outbox fica armazenada SEM dispatcher/conector. Envelope versionado inclui
empresa, unidade vigente na data efetiva do evento (UTC da escrita nesta fatia),
ator, revisão, correlação, timestamps e payload mínimo. Vigência do contrato/item
permanece em seu próprio registro; não confundir data de evento com competência
fiscal/financeira. Transferências não reescrevem eventos antigos.

Core alterado somente para montar router após authenticate, expor navegação do
módulo, incluir CSS de seus arquivos e ampliar fixtures sintéticas de permissões.
Não há novo login, bootstrap, mudança global de permissões, provider ou deploy.
Seed concede ao diretor sintético contratos edit/approve/export/attachments; ele
continua recusando produção/DB não descartável e usuários preexistentes. Upgrade
real exige concessões por administrador autorizado; nunca executar seed em upgrade.

## Segurança e auditoria 03A

| Referência | Tratamento nesta fatia | Limite |
|---|---|---|
| C01/C02 login demo/bootstrap inseguros | Não transportados; só autenticação GI | Administração de identidades permanece no backlog comum |
| C03 leituras sem escopo | Guard por empresa/módulo/ação antes de lista/get/history/export e por recurso relacionado | Nenhum recurso de módulos futuros é presumido protegido sem implementação |
| C04 anexos | Conteúdo privado no DB; dono validado pelo contrato; read+attachments; upload edit+attachments | Apenas .txt neste incremento; PDFs/ZIPs/antimalware/transporte produtivo pendentes |
| IDs adulterados | Contraparte vinculada à empresa, aditivo/marco/item e documento pertencentes ao contrato | IDs de outro escopo não são referências válidas por serem conhecidos |
| C08–C12 semântica financeira | Nenhuma baixa/paid/valorPago aceitos; medição aprovada não modifica marco como pago | Glosa/faturabilidade/nota/recebimento não implementados |
| Perfis/UTU/Vinho | DIRETORES/GERENTES/OPERADORES e concessões/negações GI; habilitação anterior ao grant | Pré-projeto exige DIRETORES e approve explícito; Ana não é identificada por nome fixo |

Histórico antes/depois e autor por revisão, export/download e recusas de guard
registrados. Auditoria SQL ainda depende dos privilégios de runtime/retention da
fundação: não se afirma imutabilidade contra administrador do banco. Não houve
pentest/prova produtiva. Não há envio de eventos externos.

## Matriz de paridade por capacidade

| Origem | Destino | Estado e prova exigida/implementada |
|---|---|---|
| CompanyDetails: formulário manual contrato | legacy/ContractFields | Portado; teste browser cria/edita/recarrega campos; APIs CAS/escopo |
| ContractDetails: formulário manual aditivo | legacy/AmendmentFields | Portado; delta/edit/recarga e cálculo sem dupla aplicação |
| MilestonesSection: formulário marco | legacy/MilestoneFields | Portado; exclui baixa financeira ativa e mantém regra contratual |
| ContractManagement: página/abas/painéis/listas | legacy/ContractManagement | Portada/adaptada; Riscos explicitamente pendente, não contagem inventada |
| Clients / empresas locais | business_parties + vínculo cliente, empresas GI | Adaptado; identidade única, sem copiar autenticação/cadastro empresa |
| Numeração global/assinatura | UUID/seq e referência provisória humana | Parcial; padrão definitivo não imposto nem número legado renumerado |
| AditivoWizardDrawer IA/PDF | Fonte preservada no repositório de origem | Pendente; não ativo; formulário manual disponível |
| Estados medição/boletim e histórico | client_contract_records + history/outbox | Fatia funcional nova segura; não se afirma port integral das três variantes conflitantes |
| Obrigações | Registro manual básico | Novo preenchimento; extração inteligente/controle completo pendentes |
| Anexos/relatórios | Texto privado + JSON autorizado | Parcial; PDF, relatório especializado, assinatura/token público, OCR e ZIP não portados |
| Gestores/aprovadores | Campos do contrato | Parcial; múltiplos responsáveis, diretório/gestão de aprovadores e notificações pendentes |
| Riscos/controle de mudanças/negociação | Fonte original | Pendente; nenhuma falsa integração ou sucesso simulado |
| Pré-projeto | Decisão/reserva de referência | Funcional como preparação; Projeto não implementado; alçadas automáticas não inventadas |
| Operacional/Financeiro/IA | Interfaces versionadas/outbox local | Especificado, não conectado/implementado |

Não é certificação de todas as variantes, calendários, PDFs, relatórios,
numeração definitiva ou aprovação externa do legado. Nenhuma função original
foi apagada; pendências continuam rastreadas para futuras rodadas.

## Verificação e evidências

CI mantém TypeScript strict, Vite build, unitários, integração MySQL 8.4 descartável,
checksum/dirty/up/down/reaplicação, repetição da integração, Chromium/Playwright,
npm audit e package-lock preservado. Nenhuma dependência nova introduzida.
Cenários novos: idempotência concorrente, CAS, escopo/IDs/UTU/Vinho, deltas,
marcos/obrigações/medições, anexos, export, pré-projeto diretor e assinatura no
mesmo ref. Testes browser usam formulários manuais originais e recarga de
contrato/aditivo/marco, submissão/aprovação de medição, JSON e história.

As famílias de testes usam instâncias separadas mantendo rate limits normais.
Browser Contratos e Estratégia são executados em processos de API independentes,
com banco sintético compartilhado e resultados em diretórios separados. Isso não
desabilita limite de requisições nem autorização. Código legado não foi executado.
Resultados efetivamente observados, SHA final e links de CI ficam no comentário
de entrega da PR; não se presume aprovação futura pela presença de teste.

## Checklist de decisões do CEO (sem bloquear partes independentes)

- [ ] Alçadas por valor/risco, expiração/revogação e segregação de pré-projeto.
      Enquanto abertas: decisão explícita por diretor com concessão, não regra automática.
- [ ] Numeração definitiva global/empresa/período e política de aditivos;
      referências nesta fatia são provisórias e não substituem número jurídico.
- [ ] Glosa, medição parcial, faturabilidade e evidências/autoridade de aceite;
      aprovação atual é registro contratual humano, não caixa ou nota fiscal.
- [ ] Competência/custos/diárias/mínimos/retroatividade e períodos fechados de OS;
      reserva permanece sem custo; Financeiro não implementado.
- [ ] Restrições documentais/PII, retenção, assinatura/token externo e armazenamento;
      não ativar provedor sem autorização própria.
- [ ] Homologar correspondência de contrapartes/identidade, inclusive papéis cliente/
      prestador e revisão de cadastro já compartilhado; nenhuma fusão real executada.

## Recomendações para 04B/05B

04B: fonte ZIP já auditada; corrigir P04-01…16, reaproveitar variantes Gantt/Kanban/
Scrum e formulários, consumir projectRef reservado e autorização vigente/revogada,
sem criar outro projeto ao assinar contrato. Não interpretar alocação ACTIVE como
mobilização com custo. Separar profissional/usuário e ligar prestador canônico.

05B: corrigir F05-01…15; reusar mestre business_parties e escopos GI; novos papéis
prestador, contrato prestador/OS canônicos, interfaces espelhadas em Projetos.
Reserva zero; mobilização efetiva conforme OS; desmobilização retroativa validada
por Ana (principal autorizado/delegado, sem hardcode de nome), ajustes auditados;
avaliação com origem/revisão/idempotência. Disponibilidade multprojeto/empresa e
conflitos exigem dados temporais, permissões e testes antes de inferir custo.

Não há autorização implícita para executar esses módulos. Aguardar revisão do CEO;
sem merge, deploy, publicação automática ou homologação externa.
