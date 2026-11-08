# 08B — Calendário operacional e caminho crítico

## Base e escopo

Continuidade da PR #15, SHA `fafc39e453a587852969aa40e68baefe0e16921d`, em branch própria `dev/comando-08b-calendario-projetos`. Não altera branches anteriores, aplicações originais ou produção. Sem merge, deploy ou conectores externos. Mantém autenticação GI, empresa canônica, permissões por ação e exclusão operacional de UTU/Vinho.

Incremento: calendário original por projeto; dias de trabalho e exceções persistentes; prévia, impactos, caminho crítico, folgas, Gantt proposto e aplicação confirmada/transacional. Não se declara Projetos integralmente homologado.

## Origem verificada

ZIP de Projetos novamente acessível, hash `14a3d081ec9efe179bb8cc17ae74dc2a74dd7d325b457e97ace7f1001ce9ede1`.

- `client/src/pages/Calendar.tsx`: 416 linhas; SHA-256 `ad8d3c9bd8ebb4eb63eee94fcd43006083147f804b4ff068b151b260d407d531`. Cópia extraída comparada byte a byte com o ZIP antes do port. Destino `client/projects/legacy/Calendar.tsx`; preservados grade de seis semanas, navegação mensal, seleção diária, prioridades, indicadores de status, próximos vencimentos e edição pelo contexto da tarefa.
- `server/gantt-engine.ts`: reaproveitadas regras de capacidade por dia, feriado, dia extraordinário e meio dia; topologia; dependências e agregação de datas de pais. Backend Drizzle/Manus e consultas globais não foram copiados.
- `server/routers.ts:calculateCriticalPath`: reaproveitados passes de avanço/retrocesso, vínculos FS/SS/FF/SF, lag, folga e classificação crítica, corrigidos para os registros canônicos e calendário efetivo.
- `client/projects/legacy/MSProjectGantt.tsx`, já portado: reutilizado para exibir a prévia, com barras críticas vermelhas e leitura apenas. Não há componente Gantt paralelo.

## Divergências corrigidas e semântica explícita

O recálculo original anunciava calendário, mas calculava datas simplificadas sem aplicar as exceções; o CPM usava `dueDate`, enquanto o modelo operacional usa `endDate`, e selecionava apenas a primeira aresta por par. Havia divergência de contagem de dias e dependências. O novo motor considera todas as arestas, rejeita ciclos/relacionamentos estrangeiros e usa um único cálculo para prévia, exportação e aplicação.

Datas são civis `YYYY-MM-DD`, inclusivas. Uma atividade de um dia pode começar e terminar na mesma data. Capacidade diária representada em meios dias inteiros: normal = 2 unidades, meio dia = 1, feriado = 0. Exceção extraordinária prevalece sobre dia semanal. Não há arredondamento monetário nem inferência de jornada de oito horas. Marcos possuem esforço zero, sem custo.

`durationDays` é esforço explícito de planejamento, em passos de 0,5 dia; datas continuam sendo o cronograma gravado. Se ausente em registro legado, a primeira prévia deriva a extensão inclusiva atual entre início/fim, **não presume que seja esforço útil aprovado**. Essa premissa é mostrada na interface; usuário revisa o esforço antes de confirmar. Aplicação grava o esforço explícito, impedindo que novas recontagens de fins de semana aumentem a duração em reaplicações.

Lag permanece em dias corridos, preservando a semântica do motor canônico anterior; é mostrado no formulário e no relatório. O início atual de cada atividade é limite mínimo explícito da prévia: o motor não antecipa silenciosamente datas já planejadas. Folga é medida em datas/dias corridos, sem precisão de horas. CPM usa o horizonte da própria prévia, não um prazo contratual inferido. Datas tarde e folgas foram comparadas a enumeração exaustiva independente em testes.

Tarefas resumo recebem datas agregadas dos filhos, sem somar novamente sua duração ou alterar progresso realizado. Dependências que apontam para resumos são rejeitadas com orientação para atividades executáveis; essa variante exige tratamento posterior, não se apresenta um CPM incorreto. Não há nivelamento de recursos ou calendário por profissional.

## Persistência, revisão e segurança

Migração sequencial 026 (`project_work_calendars`) armazena configuração por projeto, versão, autor e UTC; reversível, com checksum do mecanismo existente. Histórico completo das versões em `operational_project_history`, sem sobrescrever as evidências anteriores.

- `GET /api/v1/projects/:id/schedule`: prévia consistente em transação de leitura com lock do projeto; exige read e registra consulta. Inclui empresa, projeto, revisão de projeto, versão do calendário, premissas, impactos e hash da prévia.
- `GET .../schedule?export=json`: mesma análise, requer export adicional; origem e conteúdo testados no download.
- `POST .../schedule/calendar`: exige approve, CAS de projeto/calendário e justificativa; configura sem mover nenhuma data.
- `POST .../schedule/apply`: exige edit, justificativa e confirmação humana. Recalcula em transação, compara revisão e hash, rejeita prévia adulterada/obsoleta e persiste as alterações com uma revisão/auditoria/outbox. Requisição repetida idempotente não duplica alterações.

Projetos encerrados negam escritas. Mudança que afetaria tarefa em sprint encerrada é negada integralmente, antes de gravar qualquer tarefa. Alterar configuração para o futuro não reescreve datas/histórico passado; a aplicação bloqueada requer revisão autorizada da sprint/projeto.

O botão antigo de recálculo continua compatível para projetos sem calendário/esforço explícito. Quando estes estão presentes, encaminha para prévia e confirmação; a API antiga rejeita bypass. Edição manual de tarefa continua auditada pela API canônica, sem duplicar cadastros.

Datas do calendário de vencimentos foram corrigidas para evitar recuo de um dia no fuso brasileiro. Vencimento hoje não aparece atrasado somente por comparar meia-noite com a hora corrente. Elementos de navegação/edição possuem nomes acessíveis e acesso por teclado. Dados não salvos do calendário impedem mudança de contexto até salvar/descartar.

Nenhum título, compromisso, despesa, OS, lançamento financeiro ou mobilização é criado. Pontos de Scrum, progresso físico e fatos realizados permanecem separados do planejamento de datas. Exportações não têm URLs públicas.

## Matriz de paridade

| Fonte | Destino | Estado | Evidência |
|---|---|---|---|
| Calendar.tsx | legacy/Calendar.tsx e Schedule.tsx | Funcional por projeto; visão global multiempresa não declarada | Playwright mês/dia/edição/recarga/fuso |
| gantt-engine.calculateEndDate | shared/projects/schedule.ts | Adaptado; calendário efetivo, dias inclusivos e meios dias | unitários de feriado, exceções e capacidades |
| gantt-engine.topologicalSort / parentDates | mesmo motor | Adaptado; ciclos negados, resumos sem dupla contagem | unitários e impactos auditados |
| routers.calculateCriticalPath | mesmo motor | Adaptado; FS/SS/FF/SF, lag, arestas paralelas e folga | unitários manuais + oracle independente |
| MSProjectGantt.tsx | componente já portado | Reaproveitado na prévia com realce crítico | Playwright Gantt vermelho/impactos |
| calendars/calendarExceptions | project_work_calendars + histórico GI | Adaptado, versionado e segregado | MySQL salvar/recuperar/CAS/rollback |
| relatório de planejamento | JSON com origem/revisões | Funcional com autorização | MySQL negativo e download Playwright |

## Validação e critérios de aceite

- Build com TypeScript strict e regressão unitária integral.
- Unidade de duração inclusiva, meios dias, feriado, dia extraordinário, marco zero, quatro vínculos, lag negativo, arestas paralelas, resumos, ciclos e datas inválidas.
- Oracle independente enumera cronogramas viáveis de duas atividades e compara inícios cedo/tarde em 24 combinações de calendário/tipo/lag.
- MySQL isolado: configurar sem mover datas, prévia não grava, confirmar/aplicar/recarregar, exportar, idempotência concorrente, CAS, calendário revisado, alteração posterior invalida prévia, isolamentos e bloqueio atômico por sprint encerrada.
- Playwright: telas originais, tarefas/dependência, edição via calendário, feriado, prévia CPM/Gantt, confirmação, recarga, exportação com conteúdo e histórico. Fuso `America/Sao_Paulo`; tráfego externo bloqueado; exclusivamente dados sintéticos.
- CI mantém npm ci, 26 migrações, checksum/dirty/idempotência, up/down/reaplicação, MySQL antes/depois, regressão de todos os módulos e auditoria. Resultados por SHA e links serão registrados na PR; existência de código não é homologação.

## Limites e próximos passos

- Limites técnicos explícitos: prévia até 500 atividades/2000 dependências; até 1000 exceções e horizonte máximo de 100 anos; esforço por atividade até 3660 dias. Rejeição explícita, sem truncamento ou gravação parcial.
- Não inclui calendário individual de jornada/feriados por local, nivelamento automático, intradia/hora, ligação de dependências em tarefas resumo, simulação de antecipação sem limites mínimos, MS Project XML/MPP ou port integral de Advanced/Interactive/TemplateGantt.
- Próximas pendências: templates arqueológicos com aplicação atômica; relatórios especializados; variantes Scrum por fase; disponibilidade e paridade ampliada de alocações. Demais pendências registradas dos cinco módulos não são encerradas por este incremento.
- Fonte de orçamento comercial, regras jurídicas e conectores externos não são ativados nem presumidos como disponíveis. Plano Mestre integral indisponível não foi inventado.

Parecer: incremento de planejamento pronto para revisão técnica mediante CI aprovada do SHA entregue. Homologação operacional/visual integral permanece distinta de testes automatizados.
