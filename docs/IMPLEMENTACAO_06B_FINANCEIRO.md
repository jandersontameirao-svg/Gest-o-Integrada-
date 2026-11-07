# Comando 06B — Financeiro integrado, incremento 1

## Base e fontes conferidas

Branch `dev/comando-06b-financeiro`, derivada de `dev/comando-05b-fornecedores` / PR #9 em `40fa7ec143fd1c58312134b827fe411ad22daafa` (CI #62 aprovado). PR #9 não foi integrada; dependência preservada, sem merge. Nenhuma branch anterior foi alterada.

Arquitetura GI: React/TypeScript/Vite, Express REST `/api/v1`, MySQL 8.4/mysql2, migrações SQL sequenciais/checksum e sessões opacas próprias. Foram lidos architecture.md, security.md, relatórios 03D/05G e interfaces existentes. Não foram encontrados AGENTS.md nos diretórios/repositórios inspecionados. Sete diferenças de arquivos locais em relação à base remota foram identificadas; apenas a nova cópia de trabalho foi alinhada ao SHA remoto, preservando os diretórios anteriores.

O usuário esclareceu que não há plano mestre específico do Financeiro porque a construção estava pausada. O V03 global ou posterior não foi localizado nos anexos, arquivos/repositório alvo ou buscas conectadas. Não se afirma conformidade documental integral com um documento ausente. Este incremento segue o Comando 06B explicitamente autorizado e a arquitetura/governança existentes; as decisões novas ficam neste relatório.

Referência funcional: Documento_Reconstrucao_Integral_Zenply_UTU.pdf, versão 1 de 07/11/2026, 18 páginas, Z01–Z20/E01–E05/T01–T14. Mapa é observação de interface, não homologação. Não há conjunto completo de capturas Zenply; fidelidade visual não foi comprovada. Código atual UTU: `jandersontameirao-svg/gestao-estrategica-utu`, main `c63ad1c260cabfb3f5276ad7db4bf3e43b68016f`, inspecionado somente para leitura. README descreve VPS/PM2, mas versão publicada não foi verificada e nenhuma VPS/produção foi acessada. O ZIP de 05/11 não foi presumido como atual.

## Plano e execução

1. Conferir fontes e autoridades; criar branch e matriz.
2. Entregar núcleo vertical: contas, classificações, títulos, aprovação, baixas, estornos, séries e transferências.
3. Integrar preparação explícita por medição de cliente/boletim de prestador, com revisão e posição financeira canônica.
4. Validar banco isolado, navegador, escopo, concorrência, migrações e regressão.
5. Prosseguir posteriormente para relatórios completos, recibos/anexos, importações/conciliação, orçamento e IA independente.

Este incremento implementa 1–4, sem encerrar o 06B nem declarar rotina completa Zenply. Não é uma entrega só de planejamento.

## Implementado

- Navegação Financeiro na GI, com Dashboard/Transações/Relatórios/Contatos/Importar-Exportar/Configurações e cinco abas financeiras mais transferências. Identidade GI, empresa selecionada, estados de carregamento/erro/vazio e proteção de alterações não salvas.
- Formulário de lançamento substancialmente adaptado de UTU `operacao.tsx/ContaFormDialog`, mantendo organização, detalhe recolhido, contatos, categoria, valores, datas e recorrência. Métricas reutilizadas do mesmo arquivo. tRPC, OAuth, armazenamento público e hooks legados removidos; dados injetados pela GI. Não é atribuído ao Zenply código não fornecido.
- Oito tipos de conta, abertura positiva/negativa/zero, moeda e data explícitas; categorias por ID/natureza gerencial, centros de custo e marcadores. Cadastro inicial implementado; edição/arquivamento versionado desses cadastros ainda pendente.
- Títulos empresariais sem exigir projeto/contrato, detalhes e vínculos opcionais; salvar/editar/recarregar rascunho, aprovar/devolver/cancelar com evidência. A edição da ocorrência não altera outras parcelas.
- Baixas totais/parciais por fatos incrementais; CAS, idempotência, estorno auditado e saldo pendente. Não há comando bancário. Estorno nesta versão restaura a data efetiva original, exige período aberto e conserva data de registro no histórico; outras políticas contábeis de estorno exigem definição própria.
- Parcelamento conserva centavos, limite técnico de 120 ocorrências, sete frequências e âncora original para fim de mês/bissexto. Sem geração infinita/job externo. Quinzenal exige escolha explícita de 14 ou 15 dias: a referência não comprovou essa regra. Metadados de série preservados; edição de futuras/toda a série ainda pendente.
- Transferências internas atômicas, duas contas da mesma empresa/moeda, histórico e estorno dos dois lados. Não geram receita/despesa. Não há câmbio ou transferência interempresa automática. Registro financeiro pode produzir saldo negativo; não é autorização bancária ou política de crédito.
- Projeção configurável de 1–730 dias com somente saldo pendente aprovado, saldos iniciais e moeda isolada; agenda e consultas de origem. Cenários ainda pendentes.
- DRE gerencial por natureza explícita/competência, EBITDA e margem, sem depender de projeto. Resultados finais ficam indisponíveis quando há título aprovado sem classificação. Não representa demonstração fiscal/contábil homologada. Os outros 19/20 relatórios não estão declarados entregues.
- Contatos consultam `business_parties` e vínculos existentes, sem segundo mestre. A lista financeira não substitui formulários oficiais de pessoas/clientes/prestadores.
- Preparação financeira de medição de cliente/boletim de prestador faturável: mesma origem, chave única, valor/revisão buscados no backend. Gera rascunho; não aprova, fatura, paga nem recebe automaticamente.
- Alteração da origem: indicador de conciliação, bloqueio de aprovação/novas liquidações, conciliação explícita quando não há baixa ativa e retorno a rascunho. Cancelamentos não apagam caixa já registrado; estorno e decisão financeira são separados.
- Posições canônicas por título/origem, histórico e PDF/JSON autenticados. Interface reversa dentro de Projetos/Fornecedores ainda não foi portada; os endpoints existem e são testados.
- Fechamento/reabertura de competências, perfil DIRETORES e concessão para reabrir. Bloqueio protege criação, aprovação, baixa, estorno, transferência, séries e integrações implementadas.

## Cálculos e correções comprovadas

O arquivo UTU `server/financeCalc.ts` foi inspecionado como módulo puro, sem imports/I/O, e executado isoladamente apenas com entradas sintéticas. No SHA atual reproduziu projeção 1.400 para título 1.000/recebido 400 e DRE zerada para competência Date. O motor GI usa centavos BigInt e datas explícitas; não importa os caminhos defeituosos, heurísticas por nome/projeto nem Number para somar moeda.

- `paid`: soma das baixas não estornadas; `pending`: valor do título menos baixas, ou zero se cancelado.
- `cashBalance`: abertura por data mais movimentos efetivos, incluindo os dois lados de transferências/estornos.
- `projectedBalance`: caixa na posição + pendentes aprovados a receber − pendentes aprovados a pagar até o horizonte, incluindo atrasados. Liquidação posterior à posição não reduz previsão anterior.
- DRE: receita operacional − deduções − custos − despesas operacionais = EBITDA; depreciação/amortização leva ao operacional; resultado financeiro e tributos sobre resultado compõem resultado líquido gerencial. Classificação ausente impede indicador final.
- Margem EBITDA: EBITDA / receita líquida, em percentual; indisponível com base não positiva. Percentual exibido com truncamento a duas casas; valores monetários permanecem exatos.
- Títulos de origem divergente mantêm obrigação até decisão explícita; não se apaga passivo/recebível por mudança operacional. Alerta e bloqueio evitam nova baixa silenciosa.

## Segurança e persistência

Migração 017 cria estruturas financeiras específicas com chaves por empresa, precisão DECIMAL(15,2), versões, razão/ator e caixa rastreável. Journal/checksum/dirty/down do runner existente preservados. Down é destrutivo e só deve ocorrer com backup/banco descartável e opt-in; remove dados financeiros e suas notificações, não representa estorno de negócio.

Consultas compostas de títulos, posições, exportações e indicadores usam transação REPEATABLE READ com snapshot consistente, evitando combinar caixa posterior com saldo pendente anterior durante uma liquidação concorrente. Há prova de banco do saldo projetado invariável sob leituras e baixa em paralelo.

Backend nega por padrão. Concessões por empresa/módulo/ação e aba; leitura da aba é pré-requisito para sua escrita. Saldos têm concessão separada. Seed acrescenta somente concessões sintéticas em banco *_demo. Nenhum bootstrap público ou elevação automática no runtime. UTU/Vinho permanecem sem Financeiro operacional; reaproveitar código UTU não habilita essas empresas.

Locks de ator/empresa, transações, CAS, IDs validados e cache por hash/requestId; permissões revalidadas antes do replay. Contatos, projetos e contratos são validados na autoridade existente, incluindo participantes de Contratos. Notificações usam `module_event_outbox`, sem despacho externo ou elegibilidade automática para consolidação monetária de Estratégia.

## Validação e estado

Build/TypeScript e unitários executados localmente. `finance.test.ts` cobre cálculos/centavos/datas; `finance.integration.ts` cobre banco/negativas/concorrência; `finance-sources.integration.ts` cobre fluxo de origens e conciliação; `browser/finance.spec.ts` cobre gravação/edição/baixa/transferência/recarga/histórico/PDF/JSON. CI executa MySQL isolado duas vezes, checksum/up/down/reaplicação e regressão integral. Resultados finais por SHA e artefatos ficam registrados na PR; não substituir essa execução por este texto.

Matriz Z/E/T e backlog indicam o que falta. Não há importação histórica/OFX, 20 relatórios completos, recibos configuráveis, anexos financeiros privados, orçamento empresarial, IA ou homologação de migração neste incremento. Não há fornecedor IA/SDK/API ativo. Não foram acessados dados reais nem ativados bancos/Clicksign/Manus/ATENA OS ou serviços externos.

## Próximos incrementos e transição

1. Completar relatórios/filtros e administração versionada de cadastros/séries.
2. Recibos, anexos privados e consulta de auditoria; espelhamento autorizado das posições nos módulos de origem.
3. XLSX/OFX, prévia, lotes, deduplicação, conciliação e ensaio sintético reconciliado.
4. Orçamento empresarial/versionamento/aprovação, histórico e cenários; alinhar orçamento de Estratégia/Projetos sem somar bases concorrentes.
5. Indicadores completos e sugestões revisáveis; preparação IA independente. Provedor externo continua sujeito a autorização específica.

Implantação futura exige revisão funcional/visual/contábil, credenciais runtime separadas, TLS, backups/restauração e ensaio de migração. Antes de pedir autorização produtiva, preparar artefatos, plano de recuperação e conciliação. Nesta rodada: nenhuma implantação ou migração real.


## Incremento 2 — continuação autorizada

Base bf716b52c30be9715422ef7526222fbd2d598bbf, mesma PR #10 em rascunho. Sem merge/deploy, dados reais ou conectores externos.

- Catálogo dos 20 relatórios do Anexo A: agrupamentos de despesas/receitas, extrato, movimentos, histórico, DRE, performance mensal/anual e saldos. Filtros explícitos competência/pagamento, pago/pendente, conta, categoria, contato, tags, centro, método, plano, projeto e contrato. Vazio inclui ausentes; Todos somente preenchidos. Tags não são aditivas: total por fatos únicos. CSV com neutralização de fórmulas e PDF autenticados. Performance normaliza mês/ano e compara período anterior. Gráficos são visuais, tabelas são decimais exatas. Cobertura ainda parcial da apresentação e detalhamento completo de performance do Zenply; não há homologação visual.
- Reaproveitamento real da estrutura de seleção/séries Receita/Despesa/Resultado de Arqueo Financeiro AnaliseHistorica.tsx em client/finance/Reports.tsx. Não copiados cálculos de EBITDA/IR, autenticação, dados privados nem dependências Manus.
- Orçamento empresarial por categoria/mês/empresa/moeda: rascunho, edição, aprovação imutável, nova versão, aprovação substitutiva sem apagar histórico. Proposta determinística baseada em aprovados do ano anterior, revisável. Comprometido = realizado + pendente, disponível = planejado − comprometido. Regime por competência; não equivale a livro financeiro, orçamento de Projetos ou metas da Estratégia. Categorias de receita/despesa não devem ser somadas como custo único. Títulos sem categoria são sinalizados.
- Anexos privados PDF/DOCX/XLSX/PNG/JPEG: validação compartilhada da GI, hash, limites, versões, histórico e downloads autorizados por título/empresa/ação. Sem URL pública ou storage externo. FINANCE_ATTACHMENT_MAX_BYTES padrão 2MiB, faixa técnica 1KiB–8MiB. Recibo PDF gerencial somente de liquidações ativas, com observação personalizada; editor completo/36 variáveis ainda pendentes.
- Auditoria financeira global paginada via API, exige governança e leitura de todos os tipos.
- Migração 018 incremental, checksum pelo engine existente. Down exige ambiente/opt-in do engine; remove estruturas novas e respostas idempotentes financeiras para evitar replay de IDs apagados. Não executar em produção.

Verificação deste incremento: build/TypeScript e unitários locais; MySQL/rollback/reaplicação, segurança e Playwright na CI do SHA publicado, com resultado/evidências registrados na PR. Não confundir plano de teste com aprovação. Arquivos: tests/finance-planning.test.ts, tests/finance-planning.integration.ts, tests/browser/finance-planning.spec.ts.

Permanecem pendentes: XLSX/OFX e conciliação, ensaio histórico, séries futuras, configuração versionada, adiantamentos/prestação de contas, cenários avançados/câmbio, interfaces de IA e homologação contábil/visual. Continua desenvolvimento autorizado; não declarar conclusão integral.


## Incremento 3 — importação e conciliação isoladas

Incremento 2 validado na CI #67, commit bb98a3e8cceeae7eefcf10b094180106d2920e80: build, unitários, MySQL antes/depois de rollback e Playwright aprovados; zero vulnerabilidades. Link: https://github.com/jandersontameirao-svg/Gest-o-Integrada-/actions/runs/42417516980 .

Importação CSV UTF-8/XLSX no modelo explícito, até500 linhas/2MiB, cabeçalho estrito, valores decimais, datas ISO textuais e IDs canônicos. XLSX sem fórmulas/macros/links externos, uma planilha. Sem inferência por IA ou associação automática de homônimos. Prévia mostra erros por linha, valores e duplicidades; confirmação reprocessa o mesmo hash em transação e revalida vínculos/permissões/competências. Uma linha inválida/duplicada rejeita o lote inteiro. Importação cria rascunhos, não aprova nem liquida. Namespace estável e externalId obrigatório compõem origem única por empresa; proveniência/hash/linha/lote preservados inclusive na edição. Não trocar namespace para contornar duplicidade.

OFX XML/SGML UTF-8: um extrato, moeda e ACCTID confirmados pelo operador, FITID obrigatório, datas/valores exatos, deduplicação por conta/FITID. Mesmo FITID com data/valor diferente exige tratamento humano. Somente movimentos efetivos não futuros, após abertura da conta. A carga não modifica caixa/títulos/liquidações; conciliação associa liquidação existente com conta, data, sinal e valor idênticos. Estorno posterior é sinalizado como vínculo inválido; desfazer vínculo exige auditoria. Não há tolerância/inferência automática nem conexão bancária. Transferências e conciliação de muitos movimentos para muitas liquidações permanecem pendentes.

Migração019 acrescenta lotes e extratos privados segregados por empresa. Tests finance-imports unit/integration/browser cobrem parsing sintético, repetição, fechamento, concorrência idempotente, conciliação/estorno, persistência e ausência de chamadas externas. CI do SHA final documentará aprovação; o ensaio sintético não é migração histórica homologada. Arquivos reais não foram usados.

Modelo CSV: externalId;description;bucket;amount;currency;dueDate;competenceDate;categoryId;accountId;contactId;projectId;contractId;documentNumber;paymentMethod;costCenterId;notes. Tipo: income/fixed/variable/people/tax. Vínculos opcionais devem ficar vazios ou conter ID canônico autorizado. Datas AAAA-MM-DD, valor decimal positivo com ponto. Contatos devem ser resolvidos no cadastro oficial antes da carga; importação de contatos não cria mestre concorrente.


## Continuidade por tópicos — tópico1, operação diária

Consultar FINANCEIRO_TOPICO_01_OPERACAO_DIARIA.md. Correções e testes focados em pagamentos/recebimentos, parciais vencidas, edição via Todos, erro de parcelamento e metadados de série. Baixa/estorno em período de caixa aberto não reescrevem competência/vencimento de título encerrado. Sem migração adicional, permanece catálogo019; sem merge/deploy/serviços externos. Tópico1 ainda parcial; não declarar conclusão de adiantamentos/prestação de contas.


## Tópico1 — adiantamentos/prestação

Consultar FINANCEIRO_TOPICO_01_OPERACAO_DIARIA.md, subetapa de adiantamentos. Reaproveitamento do formulário/ficha UTU com persistência GI, pessoa corporativa canônica, liberação comprovada, compensação sem segunda saída, devolução/reembolso, provas privadas, versões, auditoria e reabertura por diretor. Migração020, sem alterações nas019 anteriores. DRE e orçamento não tratam liberação/devolução patrimonial como nova despesa/receita. Não ativadas APIs externas. Homologação e limitações documentadas; tópico1 ainda não encerra o Financeiro.


## Finalização do tópico1

Revisão financeira e cancelamento em lote de séries entregues com prévia persistida, confirmação explícita do total, transação/CAS/idempotência e auditoria por ocorrência. Mudanças financeiras limitadas a rascunhos elegíveis; cancelamento permitido a aprovados não liquidados mediante concessão de aprovação. Valores pagos/históricos, origens gerenciadas, períodos fechados e campos de proveniência preservados. Sem nova migração, permanecem20. Critérios e evidências: FINANCEIRO_TOPICO_01_OPERACAO_DIARIA.md e CI da PR #10. Não declarar os demais tópicos ou o Financeiro integralmente concluídos.
