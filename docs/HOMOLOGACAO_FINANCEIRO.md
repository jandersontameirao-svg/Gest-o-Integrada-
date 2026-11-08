# Financeiro — roteiro de homologação e preparação de transição

Estado: **preparado para revisão; nenhuma homologação humana registrada**. Esta etapa organiza a entrega já implementada, sem alterar regras financeiras, ativar integrações ou executar produção. PR10 permanece em rascunho.

## Versão e evidência de partida

Código funcional: `75a4f608e7996a9af8241115457b1bda8ec24718`. [CI87 aprovada](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/actions/runs/42477391019): build/TypeScript,114 unitários,173 integrações MySQL executadas duas vezes,23 migrações,21 jornadas Playwright, auditoria sem vulnerabilidades. Estes números pertencem a esse SHA, não a código futuro.

[Evidência sintética](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/actions/runs/42477391019/artifacts/13616226015), SHA256 `afc4e9368fa045b7d8073674b74f3053a2a795ed306afbfc8c0c00d0190775c3`; expiração15/11/2026. Após expiração, repetir CI; não tratar um link expirado como evidência acessível. O pacote contém capturas/relatórios e manifesto sintético; não é backup de produção. Traces são retidos nas falhas conforme playwright.config.ts.

## Preparação do ambiente isolado

Usar Node24, MySQL8.4 e checkout do SHA registrado. Instalar com `npm ci`; configurar `.env` local, fora do Git, com conexão para banco **novo e exclusivo terminado em _demo**, `NODE_ENV=test` e DEMO_PASSWORD sintética de16–256 caracteres. Não usar credenciais ou banco de produção. Não encaminhar chamadas para Zenply, bancos ou provedores de IA.

Executar `npm run build`, `npm test`, `npm run migrate`, novamente `npm run migrate` para idempotência e `npm run seed` somente no banco inicial sem usuários. O seed recusa banco já populado; não tentar contornar a proteção. `npm run test:integration` executa cenários que alteram o banco de teste. Não usar uma sessão de revisão humana no mesmo banco enquanto testes ou rollback estão em execução.

Para a suíte de navegador usar outro banco descartável novo, aplicar migrações e seed e executar `npx playwright install chromium` e `npm run test:e2e`. A configuração Playwright inicia a aplicação em127.0.0.1:3001. As21 jornadas devem manter a sequência do package.json: a importação histórica é a última, para não contaminar os totais iniciais conhecidos das jornadas anteriores. Não rodar novamente sobre o mesmo banco esperando os mesmos totais; provisionar outro banco de teste. O pipeline reproduz o fluxo completo, inclusive rollback/reaplicação. Não executar down em ambientes compartilhados.

Para revisão manual preparar banco separado novo, migrar, semear e usar `npm start`. O usuário sintético de diretoria é `holding@example.test`, com a senha local configurada. Não publicar `.env`, sessão, token, pacote privado de recuperação ou screenshots com dados reais. A revisão manual usa apenas cadastros fictícios.

## Casos de aceite a serem executados pelo responsável

Preencher resultados em registro separado por SHA, empresa, moeda e período. “Preparado” não significa “aprovado”. Cada caso exige captura dos dados/resultado e, quando aplicável, ID do evento auditado; ocultar credenciais. Um erro de persistência, isolamento ou soma é impeditivo, mesmo que o restante funcione.

| Caso | Ação e resultado esperado | Evidência automatizada de referência |
|---|---|---|
| H01 Contexto | Alternar empresas e perfis. Sem mistura de títulos, saldos, anexos ou exportações. UTU/Vinho negadas no Financeiro; permissão de leitura não concede escrita. | finance.integration.ts; finance-integrity.integration.ts |
| H02 Rotina diária | Criar/editar/recarregar título1000, aprovar, liquidar400: pago400, pendente600. Estornar com justificativa preserva os fatos e a posição de caixa. | finance.test.ts; finance-daily.integration.ts; browser/finance.spec.ts |
| H03 Caixa | Conta com abertura500; receita paga100:600. Transferir200 entre contas da mesma empresa: saldo consolidado preservado, sem receita/despesa operacional nova. | finance.test.ts; finance.integration.ts |
| H04 Séries | Parcelar100 em3:33.34+33.33+33.33. Revisar somente ocorrências elegíveis, confirmar total e recarregar. Títulos pagos/histórico protegidos; não movimentar caixa com revisão. | finance-series.test.ts; finance-series.integration.ts; browser/finance-series.spec.ts |
| H05 Origens | Medição faturável/prestação aprovada produz posição única e rastreável; replay não cria segundo título. Origem alterada exige reconciliação e nova aprovação; aprovação não é recebimento. | finance-sources.integration.ts; finance-advances.integration.ts |
| H06 Documentos | Anexar versão sintética, recarregar, baixar e comparar bytes. Emitir recibo com variáveis disponíveis, versão/hash e liquidação efetiva; negar IDs de outra empresa. | finance-receipts.integration.ts; browser/finance-receipts.spec.ts |
| H07 Importação | Mapear CSV/XLSX, conferir erros por linha e totais da prévia. Confirmar lote e reimportar: nenhuma duplicação. Exportar/reabrir XLSX e conferir valores literais. | finance-imports.integration.ts; finance-final.integration.ts; browser/finance-final.spec.ts |
| H08 Conciliação | Importar OFX sem gerar baixa automática; agrupar fatos reais da mesma conta, conferir soma e confirmar. Não aceitar diferença silenciosa, reserva duplicada ou liquidação estornada. | finance-imports.integration.ts; finance-integrity.integration.ts |
| H09 Relatórios | Conferir os20 relatórios com filtros, regime e registros de composição. Competência e caixa identificados. Transferências excluídas da receita/despesa operacional. | finance-planning.test.ts; finance-final.test.ts; browser/finance-planning.spec.ts |
| H10 Orçamento | Planejado1200, comprometido1000, realizado400, pendente600:disponível200. Revisar orçamento mantendo versão aprovada; não somar comprometido+realizado. Cenário não cria título. | finance-planning.integration.ts; finance-final.integration.ts |
| H11 Rateio | Título1000 com duas partes iguais:500/500; realizado400:200/200, pendente300/300. Soma conserva centavos. Relatório substitui atribuição no eixo escolhido, não duplica despesa. | finance-integrity.test.ts; finance-integrity.integration.ts; browser/finance-integrity.spec.ts |
| H12 Moedas | Usar taxa manual sintética com fonte/data; conferir duas pontas interempresa e estorno pareado. Sem cotação o total convertido fica indisponível. Nunca somar BRL/MZN implicitamente. | finance-integrity.test.ts; finance-integrity.integration.ts |
| H13 Histórico | No banco de teste, importar1000/400/600 com origem explícita e conferir900 de caixa com abertura500. Estorno posterior preserva posição anterior. Origem externa única. | finance-integrity.integration.ts; browser/finance-integrity.spec.ts |
| H14 Recuperação | Criar pacote privado/hash, conferir manifesto. Recusar destino preenchido, schema divergente e acesso alheio. Restaurar somente escopo vazio no banco de teste, comparar hash de dados; mestres preservados. | finance-integrity.integration.ts |
| H15 Período e concorrência | Fechar período; rejeitar interface/importação/evento afetado. Reabrir somente com autorização/auditoria. CAS e idempotência recusam revisão obsoleta sem alteração parcial. | finance.integration.ts; finance-series.integration.ts; finance-integrity.integration.ts |
| H16 Usabilidade | Revisar teclado, foco, contraste, telas estreitas, estados vazio/erro/carregando, textos e rapidez operacional. Registrar divergências contra fontes Zenply efetivamente fornecidas. | CI não substitui avaliação humana ou prova de paridade visual integral |

## Registro de resultado

Para cada H01–H16 registrar: identificador; SHA; data; responsável; empresa/moeda/período; dados sintéticos usados; esperado/observado; evidência; resultado (aprovado/reprovado/não executado); severidade; decisão e referência da correção. Não preencher aprovador, assinatura ou resultado em nome do CEO. Quando corrigir código, repetir casos afetados e regressão apropriada, com nova evidência pelo SHA.

## Limites que devem permanecer visíveis

- Não há prova de equivalência integral de UX/regras Zenply.26 nomes de variáveis e a semântica original ITEM_VALOR não foram fornecidos; não fabricar campos ou correspondências.
- Liquidações/estornos podem ser consultados por posição, mas isso não reconstrói todos os estados históricos de aprovação/cancelamento dos títulos nem um catálogo temporal completo dos nomes de categorias. Não vender relatórios de posição como demonstração auditada retrospectiva de todos os estados.
- Editor PDF conserva limitações tipográficas documentadas no tópico2. Busca global, ajuda e acessibilidade integral exigem revisão específica; teste funcional não comprova avaliação assistiva completa.
- Proposta de orçamento histórica é determinística; não é uma IA ativa. Provedores externos continuam desligados.
- Consolidação cambial é gerencial de caixa, não balanço societário nem DRE consolidada fiscal. Políticas tributárias, alçadas, faturabilidade e interempresa não podem ser inferidas pela interface.
- Histórico real/API Zenply e versão publicada da UTU não foram comprovados; os ensaios sintéticos não resolvem a disponibilidade dessas fontes.

## Transição futura — critérios e recuperação

**Agora:** somente preparação e revisão isolada. Não alterar branches anteriores, fazer merge/deploy ou conectar serviços.

Antes de propor produção: responsável financeiro identifica empresa/moeda/data de corte e reconcilia abertura, títulos/baixas, atrasos e totais por período. Mapear ambiguidades aos mestres canônicos com revisão; registrar lote/origem e bloquear reimportação duplicada. Preparar prévia sem escrita e ensaio em cópia isolada autorizada. Decidir o tratamento de baixas já incluídas no saldo inicial para não contar o histórico duas vezes.

A recuperação de ensaio não substitui backup operacional. Antes da transição é necessário testar backup/restauração completa da infraestrutura escolhida, com banco+arquivos privados consistentes, segredos fora do backup de aplicação, tempo de recuperação medido e restauração isolada. A recuperação financeira atual exige schema/checksums idênticos e destino financeiro vazio; rollback de migração destrutivo não é plano de retorno de negócio.

Definir antes de produção: TLS, gestão/rotação de segredos, usuário runtime sem DDL, armazenamento privado durável, limites, monitoração, retenção de auditoria, janela de corte e responsável por suspender operações. Esses controles dependem da infraestrutura real; não estão comprovados pela CI.

**Não avançar à transição** com divergência de soma, vazamento de escopo, recuperação não testada, política jurídica indispensável indefinida ou homologação não registrada. Produção/migração real/contratação de serviços precisam de autorização específica, após entrega revisável do plano e da recuperação. Nenhuma dessas ações foi executada neste comando.
