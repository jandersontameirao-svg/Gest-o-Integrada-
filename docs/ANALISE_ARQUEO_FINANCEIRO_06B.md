# Fonte adicional — Arqueo Financeiro (06B)

## Proveniência e alcance

ZIP recebido durante o incremento 1: `arqueo-financeiro-codigo-fonte-992e3f01.zip`. SHA-256 do arquivo: `2913c89be94d26822ed17ec0c0b5c492c1a58984b8e8c783b318cf34923a3482`. 192 arquivos, 1.764.567 bytes descompactados. Versão declarada no guia de exportação: `992e3f013886f7513a00bbc294952714d3749f11`, exportação de 07/11/2026. Não é clone Git; não se presume que seja a versão publicada.

Os 190 arquivos originais conferem com o manifesto SHA-256, sem divergência. ZIP extraído em diretório privado separado; nenhum script, seed, migração, instalação, build ou teste do legado foi executado. Não foram encontradas entradas com travessia de diretório/symlink nem arquivos de ambiente no inventário. A varredura de padrões comuns de credenciais nos arquivos de código não encontrou correspondências; isso não é certificação de ausência de dados privados. Scripts de população/importação e documentos com números de exemplo não serão republicados ou usados como histórico real.

Inspeção estática das páginas centrais, schema, rotas, helpers de DRE/dashboard/importação e testes. Não se afirma homologação funcional por leitura de código. Documentos de banco limpo e de dados de demonstração descrevem momentos diferentes/contraditórios; não provam o estado atual de produção.

## Parecer

Fonte útil sobretudo para a camada gerencial: DRE comparativa, análises vertical/horizontal, metas, gráficos históricos, dashboard corporativo e apresentação de relatórios. Complementa a referência Zenply/UTU, mas não comprova a rotina operacional completa de contas, baixas parciais, séries, conciliação e períodos.

Recomendação: adaptar componentes visuais e fluxos gerenciais, mantendo como autoridade o núcleo financeiro GI de títulos/liquidações e seus cálculos centesimais. Não importar o aplicativo independente, seu banco, empresas, usuários ou autenticação. Este relatório não declara que os componentes adicionais já foram portados.

## Matriz de reaproveitamento

| Fonte | Classificação | Uso proposto / requisito | Adaptação e prova necessária |
|---|---|---|---|
| client/src/pages/DRE.tsx | ADAPTAR | Z06/E03: tabela comparativa, gráfico e análise vertical/horizontal | Props/REST GI, moeda explícita, períodos completos, valores de financeSummary; testar recarga/filtros/exportação |
| client/src/pages/EmpresaDetalhes.tsx | ADAPTAR parcialmente | Navegação contextual, transações e DRE por empresa | Reutilizar layout/blocos pertinentes dentro do módulo GI; não criar outro mestre de empresas |
| client/src/pages/DashboardMacro.tsx e Dashboard.tsx | ADAPTAR | Z02/E03: KPIs, evolução e comparação | Consolidação só com empresas permitidas; nenhuma soma BRL/MZN sem câmbio |
| client/src/pages/AnaliseHistorica.tsx | ADAPTAR | E01/E03: visualização histórica e tendências | Uma base autorizada por período/moeda; comparar snapshots coerentes e dados reais sintéticos de teste |
| client/src/pages/ConfiguracoesMetas.tsx | ADAPTAR | Metas financeiras/realizado | Metas não equivalem a orçamento empresarial aprovado/versionado; integrar E02 sem mestre concorrente |
| client/src/pages/Relatorios.tsx e server/pdfGenerator.ts | ADAPTAR | Z06: seleção de período/conteúdo e impressão | Não copiar HTML arbitrário/document.write sem revisão; exportação autorizada e sanitização/escape de dados |
| client/src/components/DateRangePicker.tsx e lib/formatters.ts | REAPROVEITAR/ADAPTAR | Filtros e apresentação | Remover BRL fixo; datas UTC/date-only e centavos exatos; componentes GI já existentes têm preferência |
| client/src/pages/ImportacaoDados.tsx | ADAPTAR interface | Z08/Z10/E05: seleção de arquivo e histórico | Prévia/erros por linha/lote/deduplicação; nenhum sucesso sem persistência; nomes vinculados aos cadastros oficiais |
| server/fileProcessor.ts | RECONSTRUIR pipeline determinístico | Z08/Z09/Z10: leitura de arquivos | Mesmo Excel/CSV depende de invokeLLM. Não ativar esse caminho. Parsing/validação locais antes de eventual sugestão futura |
| server/dreHelper.ts e dashboardHelper.ts | ADAPTAR conceitos, RECONSTRUIR regras afetadas | E03 e dashboard | Corrigir deduções/receita financeira/depreciação/tributos; autorização por empresa e regra central GI |
| drizzle/schema.ts/migrações | ADAPTAR mapeamento, NÃO MIGRAR diretamente | Modelo analítico/origens | IDs inteiros privados não são IDs GI; valor int em centavos difere de DECIMAL/string da UTU e GI. Converter uma vez por procedimento controlado |
| server/routers.ts e server/security.ts | RECONSTRUIR fronteira GI | Z13/Z14 | Reaplicar autorização por empresa/entidade/ação, CAS, auditoria e transações; não reutilizar apenas protectedProcedure |
| OAuth/SDK/ManusDialog/storage/LLM/notification | NÃO MIGRAR como dependência obrigatória | Autonomia GI | Provedores externos continuam desligados; nenhuma chave/URL pública em instrumento financeiro |
| seeds/populate/import-transactions/scripts e dados exemplificativos | NÃO MIGRAR neste incremento | Proteção de dados | Sem banco de produção/backup presumido. Não criar empresas adicionais do seed sem mapeamento autorizado |

## Achados que impedem port direto

- **A01 — isolamento:** rotas DRE calcular/comparativo e dashboard consolidado/performance recebem empresa opcional ou abrangem várias empresas sem filtro explícito de empresas permitidas no trecho inspecionado de server/routers.ts. protectedProcedure prova sessão, não autorização corporativa. Reimplementar a fronteira com requireAccess/allowedCompanies GI e testes negativos.
- **A02 — propriedade:** transacoes.update/delete verificam papel, mas encaminham ID ao banco sem revalidar associação à empresa no trecho inspecionado. Não portar; exigir propriedade por empresa antes de escrita/exclusão.
- **A03 — DRE/tributos:** dreHelper calcula IR estimado fixo de 25%, iguala EBITDA a EBIT e classifica por textos específicos. Receita financeira entra no conjunto geral de receitas e depois é adicionada novamente no resultado financeiro. Essas regras não são política aprovada e não podem orientar valores definitivos da GI.
- **A04 — importação externa obrigatória:** fileProcessor processarExcel/CSV/PDF e a rota de importação invocam LLM e/ou storage externo. Não executar nem ativar. Parsing determinístico, prévia e validação serão independentes desses serviços.
- **A05 — unidade monetária:** transacoes.valor usa int em centavos e formatters assumem BRL. Não combinar diretamente com valores decimais da UTU/GI, nem truncar, converter duas vezes ou misturar moedas.
- **A06 — testes/limpeza:** server/importacao.test.ts usa getDb e DELETE de empresas acima de um ID fixo na limpeza. Não executar esse teste apontando para qualquer ambiente existente. Reescrever isolamento/fixtures com banco descartável e IDs do próprio teste.
- **A07 — autoridade:** há tabelas próprias de empresas/usuários e scripts que presumem IDs locais. Somente mapeamento explícito para identidades GI, sem importar automaticamente cadastros adicionais.

Achados são evidências estáticas, não exploração de produção. Nenhuma alegação de vulnerabilidade em ambiente publicado foi testada.

## Integração ao plano 06B

O incremento operacional já construído permanece válido e não será substituído por um segundo financeiro. Priorizar este ZIP na próxima entrega de DRE comparativa, gráficos, metas e relatórios, com rastreabilidade arquivo/hash → destino → teste. UTU permanece fonte de formulários operacionais/orçamento; Zenply permanece catálogo funcional e referência de navegação; GI permanece arquitetura e autoridade.

IA preditiva e importadores com LLM não estão ativos. Metas não substituem versões/aprovação de orçamento. Recursos apenas encontrados no código não estão marcados homologados. PR #10 registra o estado real do Financeiro e as evidências por SHA.
