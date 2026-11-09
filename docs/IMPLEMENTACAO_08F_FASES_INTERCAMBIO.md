# 08F — Gráficos por fase e perfil XML de intercâmbio

Base: PR #19, `dev/comando-08e-relatorios-especializados`, commit `6331b0a1baf22a97cfc2a5c694290858d28d8b21`, CI 111 aprovada. Continuação em branch própria, com dependência explícita da PR anterior. Sem merge, deploy, integração externa, alteração dos aplicativos originais ou migração de dados reais. IA permanece preparada e desligada.

## Entrega funcional

### Execução por fase

`shared/projects/phases.ts` consolida estados de atividades **folha** por projeto/fase, preservando fases vazias e o grupo Sem fase. Resumos não duplicam seus filhos; fases de projetos diferentes não são fundidas por nome. O filtro usa a sobreposição inclusiva das datas planejadas. Origem de fase indisponível é identificada, sem descartar sua contagem. Estado desconhecido impede a consolidação, sem classificação presumida.

Os relatórios Progresso de Projetos e Gantt congelam `phaseSummary`, revisões das fases e tabela de estados no mesmo snapshot. Recharts, já presente no SGE/Scrum, é reutilizado para barras empilhadas de quantidade por estado. PDF recebe gráficos paginados; CSV/XLSX/JSON contêm os mesmos valores tabulares. O painel mostra grupos de até 20 fases; o PDF, 12 por página. Zero não é ausência. Não se apresenta média de progresso declarado como avanço físico ponderado.

### XML de planejamento — perfil GI MSPDI

Adaptado o exportador `exportGanttToMSProject` de `client/src/lib/export-utils.ts` do ZIP original, SHA-256 `14a3d081ec9efe179bb8cc17ae74dc2a74dd7d325b457e97ace7f1001ce9ede1`, conferido byte a byte. Correções demonstradas no original:

- Um `PredecessorLink` por vínculo, em vez de vários pares agrupados em um elemento.
- Tipos corretos: FF=0, FS=1, SF=2 e SS=3.
- Escape de texto XML e rejeição de caracteres ilegais, sem remoção silenciosa.
- UUIDs GI não são inseridos em UIDs numéricos. UIDs são locais ao arquivo, determinísticos no snapshot e mapeados à identidade GI em Notes/JSON.
- Lag civil convertido exatamente em décimos de minuto: `dias * 14400`, com `LagFormat=8` (elapsed days), inclusive valores negativos.
- Hierarquia por `OutlineNumber`/`OutlineLevel`, com IDs de exibição em ordem de árvore. Resumos não recebem duração somada dos filhos.

**Não é um exportador MPP, um importador de arquivos nem uma integração ativa com Microsoft.** É um arquivo XML privado de planejamento, gerado offline, validado contra o **perfil parcial GI documentado**, não contra o XSD completo do SDK. Não foi aberto/homologado no Microsoft Project ou ProjectLibre. A presença de XML válido não prova a interoperabilidade desses aplicativos.

## Janela explícita, calendário e limites

O usuário habilita o perfil no relatório Gantt e informa início/fim de uma janela técnica no mesmo dia, sem valor padrão. Confirma explicitamente a exportação da **prévia CPM**, que não altera as datas salvas. Não se presume jornada de oito horas, remuneração, disponibilidade ou autorização de custo.

A janela exige duração positiva com quantidade par de minutos para representar meios dias sem arredondamento. Minutos/dia e semana são derivados dessa escolha e dos dias úteis do calendário GI. Feriados não têm trabalho; dia excepcional trabalhado recebe a janela completa; meio dia usa a primeira metade da janela. Não há intervalos/lunch breaks, turno noturno, fusos por recurso ou calendários individuais neste perfil.

Datas são civis, sem conversão de fuso. Criação/emissão continua identificada em UTC. Esforço em dias é convertido em minutos pela janela explícita, com término dentro do último dia de capacidade; marcos permanecem com duração zero. O término calculado deve coincidir com o CPM em dias, ou a emissão é negada.

Cada vínculo é revalidado também nos instantes horários resultantes. Uma relação FF civil que termine na mesma data, mas antes do horário da predecessora, por exemplo, **não é exportada silenciosamente**. A emissão é bloqueada com explicação. Percentuais fracionários também bloqueiam o XML, pois não há política aprovada de arredondamento para o campo inteiro nativo. Os formatos JSON/CSV continuam preservando o valor original.

A prévia XML fixa inícios calculados via `ConstraintType=2`/`ConstraintDate`; isso é um mecanismo técnico do arquivo para conservar a prévia, não uma nova restrição gravada no projeto. Recálculo, progresso de resumos, múltiplos vínculos entre o mesmo par, tratamento de restrições e avisos pelo aplicativo consumidor continuam sujeitos à homologação nativa. Estado e progresso declarados da GI permanecem nas Notes; não se inferem datas reais de execução. Não se exportam recursos, preços, lançamentos financeiros, contratos ou usuários como novos cadastros.

XML exige projeto completo, sem filtro parcial de datas, e pelo menos uma atividade. Os limites anteriores do CPM continuam vigentes (500 atividades/2.000 dependências e horizonte de planejamento). Texto não representável, nome de tarefa acima de 255 caracteres, perfil inconsistente ou arquivo acima de 8 MiB são negados antes de persistir. Não há truncamento ou mensagem falsa de gravação.

## Persistência, segurança e compatibilidade

Reutilizada a tabela de snapshots/migração 028; nenhuma migração nova. O filtro Gantt pode conter `xmlWindow={startTime,endTime,mode:'CPM_PREVIEW',confirmed:true}`. Opções fora do escopo, ausência de confirmação ou intervalo parcial são rejeitados no backend.

O snapshot congela `metadata.xmlProfile`: janela, revisão/calendário, tarefas/UIDs locais, hierarquia, horários, durações e vínculos. O checksum JSON canônico cobre esse perfil. Nova edição do projeto exige nova emissão e não reescreve arquivo/contagens antigos.

`GET /api/v1/projects/reports/snapshots/:reportId?format=xml` verifica empresa/projeto/ação e integridade como os demais formatos. Emissões antigas sem perfil XML respondem 409; o sistema exige nova emissão e não recompõe conteúdo histórico usando dados atuais. O seletor só oferece XML para uma emissão com perfil. `Cache-Control: no-store`, auditoria por ID/formato, `X-Report-SHA256` (JSON) e `X-File-SHA256` (bytes XML) identificam o download.

Arquivo repetido da mesma emissão tem bytes idênticos. UIDs não são identidade corporativa nem ficam garantidos entre acervos diferentes; Notes preserva empresa, projeto, UUID da atividade, revisão, pai/fase, datas originais, esforço, ID/checksum da emissão e revisão do calendário. A identidade canônica permanece na GI. Razões detalhadas das exceções e conteúdo completo da plataforma permanecem no JSON/registro de origem; o XML é um subconjunto de planejamento.

Permissões DIRETORES/GERENTES/OPERADORES seguem concessões existentes de leitura/exportação, sem usuários/nome hardcoded. UTU/Vinho permanecem sem operação. Sem endpoint de upload/importação XML, chamadas externas, URL pública, geração de projeto novo, lançamento financeiro ou ativação de IA.

## Referências técnicas e perfil de validação

Referência MicrosoftDocs, commit consultado `c77602db4d0733ce57cb0e5514c6fc898c7fe2c2`:

- [PredecessorLink](https://github.com/MicrosoftDocs/office-developer-msproject-xml-docs/blob/c77602db4d0733ce57cb0e5514c6fc898c7fe2c2/project-xml-data-interchange/predecessorlink-element.md)
- [Type: FF/FS/SF/SS](https://github.com/MicrosoftDocs/office-developer-msproject-xml-docs/blob/c77602db4d0733ce57cb0e5514c6fc898c7fe2c2/project-xml-data-interchange/type-element-multiple-parents.md)
- [LinkLag](https://github.com/MicrosoftDocs/office-developer-msproject-xml-docs/blob/c77602db4d0733ce57cb0e5514c6fc898c7fe2c2/project-xml-data-interchange/linklag-element.md)
- [DurationFormat e tempo decorrido](https://github.com/MicrosoftDocs/office-developer-msproject-xml-docs/blob/c77602db4d0733ce57cb0e5514c6fc898c7fe2c2/project-xml-data-interchange/durationformat-element.md)
- [Campos e sequência Tasks](https://github.com/MicrosoftDocs/office-developer-msproject-xml-docs/blob/c77602db4d0733ce57cb0e5514c6fc898c7fe2c2/project-xml-data-interchange/xml-schema-for-the-tasks-element.md)
- [Calendars](https://github.com/MicrosoftDocs/office-developer-msproject-xml-docs/blob/c77602db4d0733ce57cb0e5514c6fc898c7fe2c2/project-xml-data-interchange/xml-schema-for-the-calendars-element.md)
- [Project](https://github.com/MicrosoftDocs/office-developer-msproject-xml-docs/blob/c77602db4d0733ce57cb0e5514c6fc898c7fe2c2/project-xml-data-interchange/xml-schema-for-the-project-element.md)

Os documentos exibem fragmentos, com `. . .`, e não um XSD completo diretamente utilizável. O namespace comum MSPDI `http://schemas.microsoft.com/project` também foi conferido na declaração JAXB do leitor aberto [MPXJ](https://github.com/joniles/mpxj/blob/master/src/main/java/org/mpxj/mspdi/schema/package-info.java); isso não é um teste de importação nesse leitor. Não se substituiu o SDK ausente por um esquema chamado “oficial”.

`tests/schema/gi-mspdi-profile.xsd` é o perfil estrito GI, de autoria local, restrito aos elementos emitidos, com sequência/tipos referenciados, unicidade de IDs e referências entre predecessoras. Valores válidos em outros perfis (como LagFormat de semanas) também podem ser rejeitados por estarem fora deste subconjunto. A documentação Microsoft é CC-BY-4.0; exemplos de código são MIT (atribuição/licença em `docs/licenses/MicrosoftDocs-LICENSE-CODE.txt`).

`scripts/ValidateProjectXml.java` usa somente JDK padrão para testes; não adiciona Java à aplicação Node/React. DTD, entidades externas e schemas remotos são bloqueados, com processamento seguro e limite de arquivo. Nenhum recurso de rede é carregado pelo validador.

## Verificação e estado

- TypeScript/build locais aprovados.
- 166 de 167 testes Node locais passaram; o teste que chama Java de dentro do Node recebeu `EPERM` do sandbox. O teste não foi desabilitado nem marcado como skip.
- Java executado diretamente no mesmo ambiente validou o XML completo sintético e negou quatro arquivos negativos (enum fora do perfil, referência inexistente, elemento estranho e DTD). A execução integral do teste Node/Java continua obrigatória na CI.
- Novos MySQL: emissão transacional/idempotente, fases/resumos/zero, calendário real, formatos/checksums, reedição sem reescrever snapshot, controle de escopo/revogação e respostas 409 para XML ausente.
- Novo Playwright: configuração/confirmacão da janela pela interface, gráfico de fases, download real, parsing DOM/XML, todos os quatro tipos de vínculo, recarga/histórico e bytes antigos preservados após edição. Dados exclusivamente sintéticos e tráfego externo bloqueado.

CI e evidências finais serão registradas na PR após execução, com toda a regressão, 28 migrações/rollback/reaplicação e auditoria mantidas. Não se confunde validação XSD/DOM com homologação de negócio ou do aplicativo consumidor.

## Checklist de revisão humana e melhorias futuras

- Conferir screenshots e contagens das fases, incluindo vazio/Sem fase e exclusão de resumos.
- Conferir a janela explícita e a distinção entre datas salvas e prévia no XML/JSON.
- Validar arquivo em versão identificada/licenciada do Microsoft Project antes de afirmar compatibilidade ou liberar troca operacional externa.
- MPP binário, importação/roundtrip, recursos/turnos/intervalos e calendários individuais permanecem fora deste incremento.
- Homologação visual/negócio, conteúdo arqueológico integral ausente na fonte e personalizações de impressão permanecem identificados, sem inventar aprovação ou conteúdo.

Sem merge ou deploy. Não se declara conclusão integral de todas as variantes da Gestão de Projetos.
