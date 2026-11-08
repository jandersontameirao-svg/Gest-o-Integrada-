# Matriz de cobertura — Financeiro 06B, incremento 1

Base funcional: PDF Zenply/UTU de 07/11/2026. Arquitetura: GI existente e Comando 06B. Código UTU atual: c63ad1c260cabfb3f5276ad7db4bf3e43b68016f. Observação de tela não equivale a teste; código encontrado não equivale a fluxo homologado. Estados abaixo são implementação/teste isolado, nunca homologação externa. Evidências finais por SHA na PR.

| ID | Evidência/regra | Implementação/módulo | Estado | Lacuna/tarefa | Aceite | Teste |
|---|---|---|---|---|---|---|
| Z01 — Navegação e contexto | PDF pp.1–2/7 | FinanceWorkspace + Core GI | Parcial | Abas/empresa integradas; ocultação de valores/preferências/contexto completo pendentes | Troca de empresa sem mistura; teclado e contexto | browser/finance.spec.ts; finance.integration.ts |
| Z02 — Dashboard | PDF pp.2/7 | financeSummary; Metric UTU | Parcial | Saldos/agenda/previsto/projeção; comparativos/gráficos semestrais/armazenamento pendentes | Mesma seleção concilia com títulos/caixa | finance.test.ts; browser/finance.spec.ts |
| Z03 — Transações | PDF pp.2/8 | UTU ContaFormDialog adaptado; finance_titles | Parcial funcional | Rascunho/editar/aprovar/baixar/estornar; lançamento em linha/lote/anexos pendentes | Salvar/recarregar/editar, erros e permissões | finance.integration.ts; browser/finance.spec.ts |
| Z04 — Parcelas e recorrência | PDF pp.2/8 | installments/nextOccurrence + schedule | Parcial funcional | Sete frequências/séries finitas; futuras/série completa pendentes; quinzenal exige 14/15 dias explícitos | Centavos exatos, âncora e bissexto, geração única | finance.test.ts; finance.integration.ts |
| Z05 — Transferências | PDF pp.2/8 | finance_transfers/cash_movements | Implementado/teste isolado | Registro e estorno atômicos; edição substituída por estorno auditado, sem alegar paridade de edição desconhecida | Dois lados iguais, consolidado e DRE preservados | finance.integration.ts; browser/finance.spec.ts |
| Z06 — 20 relatórios | PDF pp.2/9–10 | DRE/posições/JSON/PDF de títulos | Parcial | Não estão entregues os 20 relatórios e todos os filtros/gráficos | Cada um deve ter base conhecida, drilldown e exportação validada | DRE em finance.test.ts; demais pendentes |
| Z07 — Contatos e faixas de atraso | PDF pp.2/10 | business_parties/vínculos existentes | Parcial | Lista/obrigações canônicas; faixas, ficha completa e filtros avançados pendentes | Sem homônimos sobrescritos ou mestre concorrente | finance-sources.integration.ts |
| Z08 — Importação XLSX | PDF pp.2–3/11 | Nenhum importador ativado | Pendente | Prévia/linha/lote/reconciliação/deduplicação | T09 com arquivos sintéticos e rollback da carga | Pendente |
| Z09 — OFX/conciliação | PDF pp.3/11 | Fonte UTU identificada; ainda não portada | Pendente | Não confundir extrato com pagamento | Reimportação única e correspondência humana | Pendente |
| Z10 — Importação/exportação geral | PDF pp.3/11 | Exportação JSON/PDF por título | Parcial | XLSX/contatos/exportação integral pendentes | Reabrir arquivo e conferir quantidades/caracteres/datas | Títulos em browser/finance.spec.ts |
| Z11 — Perfil/preferências | PDF pp.3/11–12 | Autenticação GI existente | Parcial herdado | Sem autenticação paralela; preferências/avatar/recuperação pendentes | Persistência e efeito real; ciclo de conta seguro | Regressão da fundação; preferências pendentes |
| Z12 — Empresas/assinatura | PDF pp.3/12 | Core/Governança GI | Adaptar; decisão SaaS pendente | GI multiempresa; assinatura/planos não implementados por decisão de produto ainda aberta | Isolamento e não duplicação; não copiar preços do levantamento | finance.integration.ts; regressão Core |
| Z13 — Permissões | PDF pp.3/12 | requireAccess + financeActions + concessões GI | Parcial funcional | Backend por empresa/ação/aba e saldos separados; ciclo de convites/admin ainda GI | Negativas diretas, exportação e replay autorizados | finance.integration.ts |
| Z14 — Período e auditoria | PDF pp.3/12 | finance_periods/history/outbox | Parcial funcional | Fechar/reabrir e trilha transacional; console global/paginação pendentes | Bloqueio em todas as entradas implementadas; diretor para reabrir | finance.integration.ts |
| Z15 — Cadastros financeiros | PDF pp.3/13 | finance_accounts/categories/dimensions | Parcial funcional | Oito tipos/abertura/natureza/centros/tags; edição/arquivo seguro pendentes | IDs por empresa, abertura coerente e preservação de vínculos | finance.integration.ts |
| Z16 — Recibos/arquivos | PDF pp.4/13 | PDF de título; não é recibo configurável | Pendente específico | Editor/36 variáveis completas/anexos financeiros privados ainda não entregues | Variáveis confirmadas, versões e downloads autorizados | PDF título testado; recibos/anexos pendentes |
| Z17 — Busca geral | PDF pp.4/13 | Busca local título/documento/contato e filtros | Parcial | Busca avançada e semântica Todos/vazio ainda pendentes | Combinações verificadas, sem vazamento | browser/finance.spec.ts; ampliação pendente |
| Z18 — Exclusão de dados | PDF pp.4/12 | Cancelamentos/estornos; rollback isolado | Decisão pendente | Não há expurgo de dados reais; eventual ferramenta depende de produto/recuperação | Impacto prévio e ensaio descartável | Não executado expurgo de produção |
| Z19 — Regras/cobranças/NFS-e | PDF pp.4/8/10 | Sem provedor externo | Pendente/desligado | Regras apenas identificadas no Zenply; NFS-e futura; nenhuma homologação alegada | Especificar/testar sem envio real antes de ativar | Pendente |
| Z20 — Ajuda/estados/acessibilidade | PDF pp.4/13–14 | GI + FinanceWorkspace | Parcial | Erro/vazio/carregamento/foco/dirty; ajuda/mobile/avaliação assistiva completas pendentes | Sem sucesso simulado; teclado e telas pequenas | browser/finance.spec.ts; homologação visual pendente |
| E01 — Caixa projetado/cenários | PDF p.4 | financeSummary exato | Parcial funcional | Horizonte e pendentes; cenários e premissas editáveis pendentes | T02/T03/T04, sem misturar moedas | finance.test.ts; finance.integration.ts |
| E02 — Orçamento empresarial | PDF pp.4/17–18 | annualBudget UTU identificado, não portado | Pendente | Versões/aprovação/histórico e relação com Projetos/Estratégia | Uma fonte por domínio, comparação sem dupla contagem | Pendente |
| E03 — DRE/indicadores | PDF pp.4/17–18 | Naturezas/EBITDA gerenciais centavos | Parcial funcional | DRE por competência; sem classificação retorna desconhecido; indicadores completos/caixa analítico pendentes | Fórmulas explícitas, projeto opcional e moeda isolada | finance.test.ts; finance.integration.ts |
| E04 — IA | PDF pp.4/17–18 | Nenhum SDK/provedor ativado | Pendente/desligado | Interfaces e sugestões revisáveis futuras; não simular IA com dados fictícios | Recorte correto, cálculos verificáveis e revisão humana | Pendente; sem tráfego externo |
| E05 — Histórico/transição | PDF pp.4/18 | Origens canônicas e versões implementadas | Parcial | Ensaio histórico/importação por lote e API Zenply não disponíveis/validados | Empresa correta, origem e totais reconciliados | finance-sources.integration.ts; ensaio pendente |

## Testes T01–T14

| ID | Estado e alcance |
|---|---|
| T01 | Implementado: título/aprovação/baixa, saldos e DRE; demais 20 relatórios pendentes. |
| T02 | Unitário/MySQL: 1.000 − 400 = 600 pendentes; caixa 400 + pendente 600 = 1.000 sem abertura. |
| T03 | Unitário/MySQL: abertura 500 + recebido 100 = 600. |
| T04 | Unitário/MySQL/navegador: transferência 200 preserva consolidado e DRE. |
| T05 | Unitário/MySQL: 100 em 3 = 33,34 + 33,33 + 33,33. |
| T06 | Unitário/MySQL: datas, âncora de mês e bissexto; datas normalizadas no SQL. |
| T07 | Séries finitas em sete frequências; edição de série/futuras ainda pendente. |
| T08 | Parcial: moeda/conta/competência/situação; filtros completos e Todos/vazio pendentes. |
| T09 | Pendente: importação por arquivo/lote. Idempotência de comandos/eventos de origem já testada. |
| T10 | MySQL: empresa, perfil, ação/aba, IDs alheios e UTU/Vinho negados. |
| T11 | MySQL: fechamento protege entradas implementadas e reabertura requer diretor/concessão. Importadores futuros deverão usar a mesma guarda. |
| T12 | Pendente: recibos/anexos financeiros; não confundir PDF de título com recibo. |
| T13 | Parcial: JSON/PDF de título reabertos no navegador; exportações gerais/XLSX pendentes. |
| T14 | Pendente: orçamento/IA. |

## Contratos de integração

Origens de medição/boletim faturável → preparação explícita de rascunho; aprovação e liquidação separadas. Chave de origem única, revisão, estorno e conciliação mantêm o mesmo título. /positions retorna posição autorizada. Compras gerais/adiantamentos/câmbio/consumidores Estratégia ainda são contratos a desenvolver, conforme INTERFACES_FINANCEIRO_MODULOS.md.

## Descoberta pendente

Sem capturas completas Zenply, sem confirmação de API no plano contratado, sem conteúdo de todos os arquivos exportados e sem nomes completos das 36 variáveis. SaaS/planos/assinatura dependem de decisão de produto. Não se infere autorização para bancos/IA/cobranças/NFS-e. Não foi feito ensaio com histórico real ou homologação de produção.


## Delta de cobertura — incremento 2

| Requisito | Implementação atual | Evidência | Limite |
|---|---|---|---|
| Z06 | 20 seletores, agrupamentos, regime, filtros, drilldown, gráficos temporais, CSV/PDF, mês/ano normalizado e comparação anterior | finance-planning unit/integration/browser | Performance sem todos os quadros originais; paridade/homologação visual pendentes |
| Z07/Z17 | Faixas 1–30/31–60/61–90/>90 e filtros semânticos vazio/Todos/seleção em relatórios | reports.ts + unit/integration | Busca global e tela contatos com todos os recursos pendentes |
| Z10 | CSV e PDF de relatórios com origem/filtros | unit/integration/browser | Importação/exportação XLSX/contatos pendentes |
| Z14 | Auditoria global paginada por concessão, além de trilha existente | integration | Console visual global pendente |
| Z16 | Anexos privados versionados e recibo gerencial de liquidações | integration/browser | Editor completo, 36 variáveis e identidade de recibo pendentes |
| E02/T14 | Orçamento por categoria/mês, versões, aprovação, comparação e proposta histórica determinística | budget.ts + unit/integration/browser | Rateios e IA posteriores; não duplica orçamento operacional |

Estados são código implementado; a CI do SHA é evidência de comportamento testado, não homologação externa.


## Delta de cobertura — incremento 3

Z08/Z10/T09: importação CSV/XLSX no modelo explícito com prévia por linha, lote atômico, origem estável, hash, totais e rejeição de duplicidades. Z09: OFX UTF-8 XML/SGML, conta/FITID, conciliação manual com liquidação já existente e sinalização de estorno. T11: bloqueio de período revalidado na carga. T10: escopos/grants revalidados. Estado parcial funcional até validar CI do SHA; não equivale a importador de qualquer layout ou migração histórica homologada. Evidências: tests/finance-imports.test.ts, tests/finance-imports.integration.ts, tests/browser/finance-imports.spec.ts.


## Delta — tópico1, adiantamentos e prestação

| Frente | Origem → destino | Estado e evidência | Limites |
|---|---|---|---|
| Adiantamentos | UTU Adiantamentos.tsx AdvanceForm/lista/ficha → legacy/AdvanceForm.tsx + FinanceAdvances; backend adaptado para GI | Implementado para validação: solicitar/editar/aprovar/baixar; fonte SHA c63ad1c | Submissão exige liberação integral; não homologa alçadas |
| Prestação | UTU advanceExpenses/AdvanceDetail → finance_advances.payload.expenses e origens únicas | Itens/comprovantes/correção/aprovação/reembolso/devolução/histórico; integração + E2E | Paginação e exceções documentais futuras |
| Z03/T01/T02 | Liquidação real e compensação separadas | finance-advances unit/integration:1000/700/300 e1000/1200/200, caixa/DRE sem dupla contagem | Não é demonstração contábil fiscal homologada |
| Z13/Z14/T10/T11 | Concessões/escopo/período/CAS/idempotência GI | Segurança e reabertura por diretor; testes negativos de empresa, pessoa, moeda e documento | Sem convites/notificações externas |
| Z16/T12/T13 | Comprovantes privados e exportação do caso | Hash, versões, autorização, PDF/JSON; integração/E2E | Editor geral de recibos/36 variáveis permanece em outro tópico |
| E02/E03/T14 | Naturezas patrimoniais + compensação rastreável por FK | FinanceSummary/reports/budget usam a mesma fonte; unitários conferem soma e saldo | Câmbio/interempresa não ativados |

Resultado final por SHA/CI na PR #10. Testes sintéticos não equivalem a homologação de produção.


## Delta final do tópico1 — Z03/Z04/Z13/Z14/T05/T06/T07/T10/T11

| Capacidade | Destino | Prova | Situação |
|---|---|---|---|
| Edição financeira/datas de série | SeriesReview + server/finance/series.ts | unit/integration/browser finance-series | Implementado; rascunhos elegíveis, entrada explícita por ocorrência |
| Cancelamento de série | Mesmo serviço, modo cancel | Parcial paga preservada; demais canceladas por evento; sem caixa | Implementado com finance.approve e concessão do tipo |
| Prévia e confirmação | finance_requests existente, token servidor/ator/empresa/expiração | Total incorreto, CAS, período, expirado, replay e IDs adulterados | Implementado; sem esquema/migração nova |
| Preservação | Payload/IDs/âncora/índice/origem/histórico e títulos protegidos | Snapshot antes/depois e saldo bancário no E2E | Sem redistribuição implícita ou alteração de pagos |

Substitui as antigas lacunas de séries neste documento. Aprovação da CI por SHA consta na PR; homologação externa/produção e outros tópicos não são declarados concluídos.


## Delta tópico2 — Z16/T12/T13

| Requisito | Origem → destino / estado | Critério e evidência | Limite |
|---|---|---|---|
| Modelos recebimento/pagamento | PDF Z16; equivalente UTU não encontrado → Receipts.tsx + shared/finance/receipts | Salvar/recarga/editar/versionar/duplicar/arquivar/restaurar; unit/API/browser | Editor próprio por blocos, não port alegado |
| Editor | Parágrafos/listas/tabelas/quebras/estilos/busca/ampliação | JSON validado; HTML não executado; Render/PDF | Tipografia parcial explicitada no relatório |
| Variáveis |10 nomes observados + extensões GI com origem | Ausentes bloqueiam emissão; nomes inventados negados |26 nomes não disponíveis; semântica ITEM_VALOR não comprovada |
| Emissão | Liquidações canônicas → snapshot/PDF/versionamento |400 de1000, saldo600, cobertura única, idempotência/hash/histórico | Sem emissão fiscal ou quitação jurídica automática |
| Anexos | FinanceDocuments/validador Contratos → estado/revisão/histórico privado | Arquivar/restaurar, acesso histórico explícito e IDs adulterados | Sem storage externo/antivírus remoto |
| Segurança | Core GI + novas concessões por ação | Escopos, UTU/Vinho, replay negado após revogação; regressão existente | CI por SHA na PR10; não homologação de produção |
