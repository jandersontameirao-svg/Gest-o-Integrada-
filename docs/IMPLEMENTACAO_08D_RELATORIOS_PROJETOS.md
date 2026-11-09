# 08D — Relatórios de Projetos

Base: PR #17, `dev/comando-08c-templates-projetos`, commit `2b9f814827c26264cf1c2196b24dbe13dea6ccca`. PR empilhada de documentação e código; sem merge ou deploy. A área de IA dos templates continua preparada e desligada, conforme decisão do usuário.

## Incremento funcional

Reaproveitamento adaptado das quatro famílias e estrutura visual de `client/src/pages/Reports.tsx` do arqueo-gestao: Progresso de Projetos, Resumo de Tarefas, Resumo Executivo e Visão por Empresa. Preservados seletor de tipo, filtros em painel lateral, identificação de fase, estado, prioridade e responsável. Adaptados à autenticação GI e aos componentes já instalados. Seleção de empresa usa a navegação canônica de Projetos.

`server/reports.ts` fornece a estrutura projeto/fase/atividade e os rótulos; `client/src/lib/export-utils.ts` fornece a base de exportação tabular jsPDF/autoTable. O ZIP original foi conferido byte a byte contra os arquivos extraídos; SHA-256 `14a3d081ec9efe179bb8cc17ae74dc2a74dd7d325b457e97ace7f1001ce9ede1`. Hashes individuais e destinos na matriz de paridade.

Correções demonstradas no original: espera simulada de geração; seleção de projeto/período não aplicada a todas as saídas; estatísticas globais; rota pública de relatório; HTML interpolado sem escape; sucesso sem confirmação de arquivo. Esses mecanismos não são portados. Nenhuma alteração no aplicativo original.

## Persistência e consistência

Migração 028 cria `project_report_snapshots`, com empresa, autor, tipo, conteúdo JSON imutável, hash canônico SHA-256 e data. Nova emissão gera novo ID; uma emissão anterior não é reescrita ao editar o projeto. Referências de projeto, revisão, origem, moeda e revisões das atividades/fases ficam registradas. Não é uma reconstrução retrospectiva de execução.

Geração em transação: autorização de leitura/exportação, bloqueio dos projetos em ordem estável, leitura de registros na mesma conexão, gravação e auditoria atômicas. Ledger idempotente existente impede emissão duplicada no reenvio da mesma operação. Não altera revisões do projeto nem gera fatos financeiros. Limites explícitos: 100 projetos e 5.000 registros por emissão; histórico mostra as 50 emissões mais recentes.

Datas filtram sobreposição inclusiva do intervalo planejado de atividades. Projetos sem atividade no intervalo permanecem com zero. Conclusão é contagem de folhas concluídas/folhas elegíveis, não média de progresso físico. Pais aparecem identificados e não entram novamente nos totais. Zero é preservado; sem denominador retorna indisponível. Atraso é fim planejado anterior ao dia civil UTC de emissão, excluindo concluídas; hoje não é atraso. Moedas são identificadas, sem somar valores monetários.

## API e arquivos privados

- `POST /api/v1/projects/reports/snapshots`: `companyId`, `filter` e `requestId`.
- `GET /api/v1/projects/reports/history?companyId=…`: histórico autorizado.
- `GET /api/v1/projects/reports/snapshots/:reportId?format=json|pdf|csv|xlsx`: releitura e download da emissão, com nova verificação de permissões da empresa e dos projetos de origem, checksum e auditoria.

Sem URLs públicas, HTML de impressão ou imagens remotas. `Cache-Control: no-store`; SHA-256 do conteúdo JSON em `X-Report-SHA256`, não um hash dos bytes de cada formato. CSV neutraliza fórmulas; XLSX reutiliza o escritor OOXML de strings da GI, sem fórmulas, macros ou vínculos externos. O reaproveitamento desse utilitário de formato não cria dependência de domínio financeiro. PDF usa jsPDF/autoTable no servidor, com metadados, filtros, limitações e proveniência. Arquivos são gerados a partir do snapshot, sem persistir cópias públicas.

UTU/Vinho permanecem negadas em Projetos; grants atuais são revalidados ao consultar emissões antigas. Não são incluídos conteúdo de anexos, comentários privados ou dados de outros módulos. Erro de gravação não produz mensagem de sucesso. Requisições pendentes impedem navegação interna; resultados de um contexto desmontado são descartados.

## Validação e limites

Testes novos verificam filtros, datas, pais, zero, conclusão, checksum independente da ordenação JSON MySQL, proteção CSV/XLSX; integração verifica concorrência idempotente, salvar/recarregar/editar sem reescrever histórico, formatos reais, auditoria, concessão revogada, empresa adversa e UTU/Vinho. Playwright exercita criação real de projeto/atividade, emissão, downloads dos quatro formatos, recarga do histórico e período vazio, bloqueando tráfego externo. CI mantém regressão completa, migrações up/down/reaplicação e auditoria de dependências. Evidências finais e SHA da execução ficam na PR para evitar disparar CI apenas para atualizar links.

Build e TypeScript locais aprovados; 150 testes unitários locais aprovados. Integração MySQL e Playwright dependem do executor CI isolado: não são declarados aprovados antes da execução. Lockfile e workflow da fundação preservados.

## Paridade e pendências

| Capacidade | Estado | Evidência/limitação |
|---|---|---|
| Tela original e quatro famílias | Adaptadas, parciais frente à cobertura total do legado | Filtros reais e snapshots; resumo executivo e visão por empresa atualmente compartilham a tabela gerencial por projeto |
| Projeto/fase/tarefa, prioridades, responsáveis | Funcional no recorte entregue | Fase em coluna; não há painel gráfico agregado de fases nesta rodada |
| PDF, CSV, XLSX e JSON privados | Implementados; evidência final na CI | Mesma emissão e origem; XLSX textual, sem fórmulas |
| Histórico e nova emissão após edição | Implementados | Imutabilidade, revisão de origem e checksum |
| Relatórios especializados de Gantt, Scrum e orçamento | Pendentes | Exportações específicas JSON existentes continuam disponíveis; não confundir com port completo das variantes PDF do legado |
| XML MS Project | Pendente | Original contém interpolação insegura e mapeamento incorreto de dependências; não portado sem validação |
| Homologação visual e de negócio | Pendente de revisão | CI não equivale a homologação pelo CEO |

Não se declara conclusão integral do módulo Projetos. Não foram ativadas integrações externas, IA, envio de mensagens, migração real, merge ou deploy.

## Correção de regressão detectada no CI 107

Build, 150 unitários e 207 integrações MySQL passaram duas vezes, incluindo rollback/reaplicação. A regressão Playwright de Estratégia demonstrou uma consulta de consolidação antes da confirmação da publicação recém-iniciada: um toast anterior ainda visível não garantia o término da nova gravação, e os botões de consulta/exportação estavam habilitados enquanto a escrita corria. Correção mínima em `client/strategy/Alignment.tsx`: ambos aguardam o estado de gravação já existente. O teste mantém a verificação exata de `25.000000`, segura deliberadamente a resposta real da publicação e exige os dois botões desabilitados até sua liberação. Não houve alteração de cálculo, autorização ou backend estratégico. Nenhum retry, aumento de timeout ou teste desabilitado. CI 107: https://github.com/jandersontameirao-svg/Gest-o-Integrada-/actions/runs/42578413475.

CI 108: a regressão estratégica corrigida e os 29 fluxos anteriores passaram. O novo fluxo 08D confirmou gravação e tabela, mas identificou rótulo implícito de seletor incompatível com busca exata de label (o texto das opções integrava o label). Adicionados nomes explícitos `aria-label` aos seletores de projeto/formato, preservando o teste original. O novo fluxo passa a executar primeiro para reduzir o tempo de diagnóstico; todos os 29 fluxos anteriores permanecem na suíte, sem skips/retries ou aumento de timeout. Execução: https://github.com/jandersontameirao-svg/Gest-o-Integrada-/actions/runs/42579310827.
