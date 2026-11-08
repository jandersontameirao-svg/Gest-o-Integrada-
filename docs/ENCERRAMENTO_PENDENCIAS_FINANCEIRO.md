# Encerramento técnico das pendências financeiras

Autorização: “Termine as pendências”. Base PR10, SHA5d992d4db283174ea90fa163e25f9317acd9893d / CI80. Mesma branch dev/comando-06b-financeiro, sem merge, deploy, produção ou serviços externos. Não há auto-homologação contábil/jurídica.

## Escopo entregue e autoridade

| Pendência anterior | Solução e evidência |
|---|---|
| Histórico/baixas | Arquivo de intercâmbio financeiro explícito, prévia/hash/totais esperados, confirmação transacional por diretor, origens únicas e mapeamento aos cadastros canônicos existentes;1000nominais/400baixados/600pendentes. Testes API e navegador. |
| Estornos históricos | Data efetiva independente, preservando crédito e estorno como movimentos distintos. Cálculo compartilhado de liquidações na posição evita apagar a posição anterior à reversão. Limites por título validados na linha do tempo. |
| Recuperação | Pacote privado por escopos, blobs/JSON/datas/IDs/histórico, manifesto/checksums e reconciliação por hash de dados. Restauração transacional somente em escopo financeiro vazio, sem apagar dados. Teste descarta exclusivamente dados sintéticos, restaura e compara todos os registros. |
| Conciliação avançada | Vários extratos/fatos existentes por conta, somas exatas, tolerância de datas explícita, reservas únicas, prévia/hash, cancelamento auditado e invalidação após estorno. Inclui transferências; tarifas exigem título/baixa reais, nunca diferença silenciosa. |
| Rateios/resultados | Pesos explícitos de10000 pontos-base, centavos conservados, CAS/aprovação e origem única. Eixos projeto operacional ou centro de custo, sem misturar eixos no mesmo rateio. Resultados substituem a atribuição original no eixo escolhido; não adicionam outra despesa ao título. |
| Câmbio | Cotações manuais imutáveis aprovadas por diretor, par/data/período/fonte, arredondamento exato e resíduo identificados. Sem inversão automática, taxa padrão, busca externa ou mistura implícita de moedas. |
| Interempresa | Transferência canônica pareada em transação, permissão em ambas as empresas, contas/moedas/datas verificadas, idempotência e estorno das duas pontas. Não gera receita, despesa ou título duplicado. |
| Consolidação | Empresas deduplicadas, leitura autorizada de cada escopo, unidade vigente na posição e conversão por cotação explícita. Taxa ausente bloqueia o total agregado, preservando componentes/proveniência. É consolidação gerencial de caixa; não é balanço societário. |
| Dados legais para recibos | Campos legais opcionais na própria companies, com revisão, diretor e auditoria. Nome de exibição não vira razão social automaticamente. Razão social/cidade/estado alimentam as variáveis conhecidas quando preenchidos. |
| Preferências entre empresas | Identificador de auditoria derivado de usuário+empresa evita colisão de revisão; registros legados permanecem preservados. Teste atualiza o mesmo ator em duas empresas. |
| Formatos | OFX com UTF8 ou Windows1252/Latin1 declarados; calendário Excel1904 explícito, com verificação contra o workbook. Sem adivinhar codificação ou calendário. |

Interface: nova área **Integridade**, integrada à navegação GI. Mantidos os componentes/cálculos/fluxos anteriores. Reutiliza primitivas GI de autorização, transação, idempotência, auditoria, contas, títulos, arquivos, relatórios e importação; não executa aplicativos originais nem cria cadastros mestres concorrentes.

## Histórico e recuperação — limites de autorização

Endpoints de histórico/recuperação exigem NODE_ENV=test, banco terminado em `_demo`, perfil DIRETORES e concessões de leitura integral/governança/exportação/anexos/recibos/adiantamentos. Histórico exige também aprovação/liquidação, inclusive por tipo do título. Produção é recusada no backend, mesmo que haja replay de uma requisição anterior.

O pacote exclui empresas/cadastros mestres/usuários/credenciais/sessões/cache de requisições. Cadastros canônicos referenciados devem existir no destino; FKs continuam ativas. Pacotes com interempresa devem incluir ambas as pontas e suas relações conectadas. Hash de dados e versão/checksums do schema devem coincidir. Não há endpoint para apagar o destino ou sobrescrever lançamentos.

No ensaio automatizado, os próprios testes limpam somente o banco descartável autorizado, em ordem de FKs, incluindo caches efêmeros. O serviço de restauração não faz essa limpeza. Artefatos de CI guardam somente manifesto/hash/contagens e capturas sintéticas; o pacote de dados baixado é verificado e removido, não publicado como dump.

O formato histórico importa títulos aprovados, baixas e estornos com identificadores externos; aprovação é realizada agora pelo diretor da GI, preservando a data de aprovação informada pela origem como proveniência. Não falsifica aprovação antiga da GI. Datas futuras, contas incompatíveis, períodos fechados, baixas acima do saldo em qualquer posição e duplicidades rejeitam o lote inteiro. Não busca dados ausentes em produção e não presume backup completo Zenply/UTU. Migração real continua sujeita à autorização específica original.

## Contrato de intercâmbio histórico

POST /api/v1/finance/history-load/preview e /commit recebem companyId,requestId,data. Commit também exige expectedSha256 e reason. data: namespace estável, records e expected. Cada registro contém externalId, approvedAt, data (mesmos campos do cadastro manual GI) e settlements. Baixa contém externalId,accountId,date,amount,method,notes e reversedOn opcional. IDs de contatos/projetos/contratos/categorias/contas são canônicos autorizados; não há criação de mestres pelo importador. expected contém nominalIncome,nominalExpense,cashIncome,cashExpense,pendingIncome,pendingExpense, sempre decimais exatos. Um lote contém uma moeda e até100 títulos/100 baixas por título. Não trocar namespace para contornar origem única.

Saldos iniciais permanecem autoridade das contas existentes. Operador deve reconciliar saldo de corte antes de importar baixas para não contar duas vezes histórico já incluído na abertura. O teste usa500 de abertura anteriores aos pagamentos e400líquidos para900 de caixa.

## Rateios e câmbio

Rateio nominal conserva centavos com desempate determinístico; realização é limitada ao valor nominal de cada parte, impedindo saldo negativo por arredondamento. Relatório por eixo/moeda/período possui proveniência e grupo não alocado. Fonte alterada sinaliza resultado incompleto. Projetos estratégicos não são aceitos como projetos operacionais; projetos e centros devem ser da empresa e exigir suas permissões.

Taxa expressa unidades de destino por unidade de origem, com até10 casas decimais. Conversão arredonda meio centavo para fora de zero; o resíduo da operação é exposto na consolidação. Mesma moeda exige valores iguais nas duas pontas. Aprovação/transferência exige DIRETORES e concessões apropriadas. Valores/datas/fontes são humanos e auditados; não há política fiscal, tributária ou de alçada presumida. Tratamento societário de mútuos/juros/reclassificações não é criado automaticamente.

Consolidação de caixa não soma receitas/despesas patrimoniais nem converte DRE implicitamente. Valoração de saldos em outro período pode produzir diferença cambial gerencial explícita; não cria ajuste contábil automático. Unidade é consultada na posição; transferência de unidade não reatribui posições passadas.

## Migração e regressão

023 acrescenta metadados, data de reversão e dados legais na empresa canônica. Up/down/checksum e reaplicação são verificados no banco descartável. Down é destrutivo para metadados/ensaios/cotações e eventos interempresa deste incremento; não executar em produção nem tratá-lo como restauração de backup. O mecanismo GI exige confirmação de rollback destrutivo. O pacote de recuperação exige esquema exato, não permite ignorar checksum.

Testes: finance-integrity.test.ts (centavos, limites, câmbio/resíduos, posição histórica, formatos); finance-integrity.integration.ts (histórico, rateios, conciliação, interempresa, preferências/empresa legal, restauração integral e negativas); browser/finance-integrity.spec.ts (histórico/recarga/rateio/cotação/pacote privado), mais regressão de todos os módulos. CI e evidências do SHA final serão registrados na PR10; a existência dos testes não constitui aprovação antes da execução.

## O que depende de evidência externa

1. Homologação visual/contábil/jurídica real: deve ser feita pelo responsável, com checklist abaixo. Não é substituída por CI ou aceite automático.
2. Catálogo Zenply: fonte nomeia10 de36 variáveis;26nomes e a semântica original de ITEM_VALOR não foram fornecidos. As extensões GI têm origem própria. Não inventar correspondências ou declarar equivalência integral.
3. Histórico real/API Zenply: disponibilidade contratual/arquivos reais não comprovados; não acessados. Ensaio sintético de intercâmbio/recuperação não é migração real autorizada.

Esses itens não são falhas de persistência pendentes nem bloqueiam o teste da aplicação. São condições de homologação/transição fora da autorização de produção vigente.

## Checklist de homologação preparado

- [ ] Responsável financeiro confere rotina diária, parcelas, adiantamentos, títulos1000/400/600 e saldo500+400=900.
- [ ] Confere datas de estorno/períodos, anexos/recibos, razão social e regras jurídicas reais.
- [ ] Confere agrupamento bancário/tarifas, rateio e origem dos indicadores.
- [ ] Confere fonte/taxa/moeda das transferências e política contábil societária.
- [ ] Confere manifesto de recuperação em ambiente isolado e plano de corte do histórico.
- [ ] Registra divergências, responsável e aprovação identificada. Nenhuma caixa está marcada automaticamente.
- [ ] Autorizações separadas antes de merge, deploy e migração real; plano de recuperação revisado.


## Correção necessária identificada na regressão de Estratégia

O trace da CI83 registrou120 chamadas e HTTP429 na leitura após salvar o KPI. O frontend repetia GETs idênticos em paralelo. O helper de Estratégia passa a compartilhar somente consultas em voo por token+caminho, sem cache de resposta concluída. Escritas invalidam o contexto antes/depois, preservando a recarga após gravação e o isolamento entre usuários/planos. O limite120/min, as permissões e os testes permanecem ativos. Testes unitários verificam concorrência, tokens/planos, invalidação por escrita e propagação de429; a jornada SGE também verifica ausência de429 no fluxo normal. Nenhuma alteração dos aplicativos originais ou integração externa.
