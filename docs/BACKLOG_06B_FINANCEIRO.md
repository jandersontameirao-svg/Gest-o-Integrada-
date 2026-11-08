# Backlog vivo — Financeiro 06B

Comando 06B autoriza implementação isolada sem novos aceites de rotina. Sem merge/deploy, produção, dados reais ou serviços externos. Incremento 1 não é conclusão integral.

## Entregue neste incremento — evidências por SHA na PR

Contas/categorias/classificações iniciais; título manual sem projeto obrigatório; rascunho/edit/aprovação/devolução/cancelamento; baixas parciais, estornos e caixa rastreável; séries finitas e sete frequências; transferências internas atômicas; DRE/EBITDA gerenciais e projeção exata; origens de medição/boletim, posição canônica e conciliação; permissões/competências/auditoria e testes sintéticos.

## Próximas entregas

1. Concluir relatórios 01–20 do PDF e filtros completos, com drilldown/exportação próprios; indicadores de inadimplência separados de atrasos gerais.
2. Edição/arquivamento de contas/categorias/classificações com vigência e proteção de histórico; edições de série/futuras e preferências. Não reclassificar retrospectivamente por mudança silenciosa de natureza.
3. Recibos configuráveis, variáveis comprovadas, anexos financeiros privados e auditoria global paginada; espelhamento de posições autorizadas nos módulos de origem.
4. XLSX/OFX/contatos: prévia, erros por linha, lotes, duplicidade, reprocessamento, conciliação e ensaio sintético com totais reconciliados.
5. Orçamento empresarial por categoria/período, versões/aprovação/comparativos e proposta histórica; fonte distinta do orçamento operacional de Projetos e analítico de Estratégia.
6. Cenários, resultados por projeto/contrato, rateios financeiros e indicadores completos com dados suficientes.
7. Adiantamentos/prestações de contas, compras gerais, câmbio e interempresa: definir origem/autoridade/competência/eventos antes de ativar automações.
8. Interfaces de sugestões/IA com recorte e revisão; nenhum provedor ou tráfego externo ativado. Não simular IA.

## Descoberta e decisões — não impedem partes independentes

- Regras de alteração de séries Zenply, quinzenalidade de referência e filtros Todos/vazio precisam de confirmação. Convenção quinzenal exige escolha humana de 14/15 dias nesta implementação.
- Catálogo completo das 36 variáveis e resultados reais de importação/exportação ainda ausentes.
- SaaS/assinatura/plano comercial não são automaticamente parte da GI; decisão específica.
- Alçadas, política de estorno em outra competência, plano de contas definitivo, câmbio/interempresa e regras fiscais não serão inventados.
- API oficial Zenply no plano contratado e equivalência de código UTU com sua versão publicada não foram comprovadas. Sem dependência operacional presumida.
- Homologação visual requer capturas completas Zenply e revisão do responsável. Homologação contábil/produção exige etapa própria.

## Recuperação e implantação futura

Migração 017 down apaga somente estruturas financeiras novas e suas notificações; exige opt-in e backup e não é estorno de negócio. Preparar backup/restauração, conciliação de saldos/títulos, runtime sem DDL, TLS/segredos, observabilidade e procedimento de retorno antes de pedir autorização para produção. Nenhum ensaio de migração histórica foi aprovado neste incremento.

## Fonte adicional recebida durante o incremento 1

Arqueo Financeiro, versão declarada 992e3f013886f7513a00bbc294952714d3749f11, ZIP com manifesto verificado. Priorizar reaproveitamento de DRE comparativa, análises históricas, metas/gráficos e relatórios conforme ANALISE_ARQUEO_FINANCEIRO_06B.md. Não portar autenticação, banco independente, importação dependente de LLM, IR fixo ou endpoints sem escopo. O código foi analisado estaticamente, sem executar scripts/serviços; ainda não é port funcional na GI.


## Atualização — incremento 2

Implementados para validação: catálogo de relatórios 01–20/filtros/CSV/PDF/gráficos, orçamento empresarial versionado com aprovação e proposta histórica, anexos privados versionados, recibo gerencial básico, auditoria paginada API. Substitui os estados de “não implementado” específicos acima, sem afirmar paridade visual completa. Performance ainda requer maiores gastos/receitas, distribuição e comparativos de saldo; 36 variáveis e templates completos continuam pendentes. Importação/conciliação e ensaio histórico são a próxima prioridade operacional.


## Atualização — incremento 3

CSV/XLSX modelo estrito com prévia/linha/lote/hash/origem única e OFX com deduplicação/conciliação manual de liquidação existente implementados para validação. Pendentes: mapeador visual de layouts Zenply/outros, contatos/ambiguidade assistida, datas seriais Excel, encodings OFX além deUTF-8, conciliação de transferências/agrupamentos/taxas, exportação XLSX integral e ensaio histórico completo homologado. Nenhum desses limites autoriza inferência ou sucesso simulado.


## Execução por tópicos — tópico1

Conforme orientação do usuário, a próxima entrega fica limitada à operação diária. Correções de edição em Todos, filtro de parcial vencida, validação de parcelas, regra de período do evento de caixa e edição transacional de metadados de rascunhos de série estão descritas em FINANCEIRO_TOPICO_01_OPERACAO_DIARIA.md. Tópico1 permanece aberto: adiantamentos/prestação de contas e edição financeira/cancelamento de séries em lote ainda não entregues. Não iniciar tópico2 antes de apresentar a evolução do tópico1. Rascunhos locais dos demais tópicos foram preservados, sem publicá-los nesta subetapa.


## Delta — tópico1, adiantamentos/prestação

Implementados para validação na mesma PR: formulário/ficha UTU adaptados, solicitação/edição/aprovação, liberação real, comprovantes privados/versionados, despesas corrigíveis, submissão/devolução/aprovação, compensação, devolução/reembolso, encerramento e reabertura auditada. Substitui o estado anterior de “não implementado”, sujeito à CI do SHA. Permanecem no tópico1: edição financeira/datas e cancelamento em lote de séries; parciais de concessão antes da submissão, exceções de documentos, paginação e transferência controlada de origens são melhorias identificadas, sem política de negócio presumida. Não iniciar tópico2 nesta entrega.


## Fechamento do tópico1 — estado atual

Séries: revisão explícita de valor/vencimento/competência por ocorrência, prévia persistida por usuário/empresa, confirmação do total, CAS/idempotência e cancelamento em lote auditado implementados. Isso substitui as antigas pendências de edição financeira/datas e cancelamento de séries acima. Parcelas aprovadas não são reescritas, parcelas com histórico de liquidação ficam protegidas e o caixa não é movimentado por esses comandos.

Tópico1 encerrado no escopo documentado em FINANCEIRO_TOPICO_01_OPERACAO_DIARIA.md, condicionado ao resultado final registrado na PR. Melhorias opcionais e políticas comerciais/jurídicas não equivalem a bloqueio do incremento. Próximo tópico separado:2 — documentos e recibos; não iniciado nesta rodada. Rascunhos dos outros tópicos preservados.


## Tópico2 — estado que substitui as pendências anteriores de recibos

Modelos/editor por blocos, salvar/recarregar/editar/versionar/duplicar/arquivar/restaurar, prévia e emissão persistida de recibos, PDF privado/hash/histórico e arquivos arquiváveis implementados para validação. Detalhes e evidências: FINANCEIRO_TOPICO_02_DOCUMENTOS_RECIBOS.md. Mantêm-se limitações específicas do catálogo Zenply (10 nomes disponíveis de36), dados legais canônicos ausentes e diferenças tipográficas por bloco. Não impedem emissão com os campos GI disponíveis; não se declara paridade integral. Melhorias: estilos por seleção, alinhamento justificado no PDF, estilização adicional de tabelas, paginação e catálogo integral quando houver fonte. Nenhuma ativação de assinatura, OCR ou distribuição externa.


## Rodada dos tópicos3,4,5,6 — estado atual

Consultar FINANCEIRO_TOPICOS_03_04_05_06.md. Mapeamento explícito CSV/XLSX (datas/valores), exportação de títulos e relatórios XLSX, performance diária/rankings/distribuição, posição das liquidações orçamentárias, cenários persistidos/revisados, configuração auditada de cadastros, preferências pessoais e alertas internos implementados para validação. Migração022. Não substitui os fluxos validados dos tópicos1/2. Não declara ensaio integral de migração, conciliação avançada, rateios, consolidação cambial/interempresa ou homologação visual/contábil concluídos. Resultados por SHA na PR10.
