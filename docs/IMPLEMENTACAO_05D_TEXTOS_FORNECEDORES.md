# Continuidade — textos integrais privados de Fornecedores

Base: PR #9, `8cdac712301584626151493ac5af840d44ea80fa`, com CI #50 aprovada. Continuidade técnica já autorizada pelo CEO; sem novo aceite de rotina. Sem merge/deploy, serviços externos, alterações dos aplicativos originais ou dados reais nos testes/GitHub. Compêndio atual autorizado como fonte de trabalho; sua revisão não bloqueia desenvolvimento.

## Entregue e fronteira funcional

API `/api/v1/suppliers/legal` e interface integrada à mesma área de Fornecedores, inclusive no espelhamento em Projetos. Importação privada DOCX → identificação dos 13 contratos e 52 anexos → modelos canônicos existentes → edição/versionamento textual → individualização por prestador → gravação/recarga/histórico → PDF/DOCX/JSON autenticados. Nenhum desses rascunhos assina, aprova instrumento, emite OS ou gera custo/Financeiro. O fluxo operacional já existente permanece separado.

O bloco Content do `ContractEditor.tsx` original (SHA 8b5c9409) foi adaptado em `SupplierLegalContent.tsx`: texto integral, editor monoespaçado, mesmo papel funcional. IA/autofill externos não são portados. Cadastro e seleção dos modelos e rascunhos reutilizam a estrutura canônica 009, sem cadastro paralelo.

A fonte privada foi conferida localmente: SHA-256 `70c651c15eb08ec9540c086ae449ed5c6f5350052d07f424dffe1c11d8005efd`, 65 segmentos reconhecidos, 875.842 caracteres de texto e maior segmento com 53.252 caracteres. Somente metadados dessa verificação são publicados. O DOCX, seus textos preenchidos, revisões, comentários, preços e quaisquer dados particulares **não** são seeds ou arquivos do GitHub. A prova da fonte local não equivale a importar uma base de produção nem a homologar instrumentos jurídicos. O teste da persistência usa exclusivamente uma fonte sintética de 65 segmentos.

## Fonte e preservação

O importador usa a versão textual de trabalho: mantém inserções e exclui deleções/movimentações de origem marcadas no Word. Comentários não se tornam cláusulas ou regras. Conserva textos das células/tabelas como sequência de parágrafos. O DOCX original é armazenado privado com hash e download exato autorizado, permitindo conferir estilos, tabelas, numeração automática e comentários. PDF/DOCX gerados transpõem texto, não prometem fidelidade visual integral do Word. Elementos textuais não suportados (desenhos, fórmulas Office, caixas de texto, notas de rodapé/fim e altChunk) são recusados, sem simplificação silenciosa.

O compêndio autorizado possui 583 partes Word, acima do limite genérico de anexos (512). Há uma exceção **somente para os bytes com o hash exato autorizado**: o importador extrai três XML necessários e valida esse subconjunto; não carrega relacionamentos, comentários, imagens, conteúdo ativo ou URLs externas. A política genérica de anexos não foi relaxada. Fontes diferentes passam pelo validador Office estrito existente e são identificadas como personalizadas, sem autenticidade oficial presumida. O cliente não pode atribuir `recognizedCompendium` ou proveniência.

A importação exige todos os 65 cabeçalhos únicos reconhecidos. Erro interrompe a transação completa. Uma empresa/hash/segmento reutiliza o mesmo modelo canônico; repetir a importação não duplica modelos nem sobrescreve edição posterior. Cada texto guarda hash da fonte, segmento, intervalo de parágrafos e hash textual original. Edições alteram a revisão e indicam divergência do texto original, mantendo proveniência.

## Versões e individualização

Migração 013 acrescenta extensões de texto privado por ID/revisão de modelo e documento canônico, fonte original, histórico e cache próprios. A autoridade cadastral continua em `supplier_template_drafts`/`supplier_document_drafts`; os textos não são expostos pelas antigas listagens/exportações de metadados. Edição de metadados do modelo conserva sua origem e copia a extensão textual na mesma transação para a nova revisão. Versões já utilizadas por documentos são imutáveis.

Marcadores explícitos `{{campo}}` substituem valores literalmente; sem eval, fórmulas ou chamadas externas. Empresa/prestador/IDs e datas do rascunho vêm do banco. O cliente não pode sobrescrevê-los. Campos próprios devem estar declarados no texto; faltantes, expressões e valores com novos marcadores são recusados. Trechos preenchidos do arquivo original não são inferidos como placeholders nem preços vigentes: a governança edita explicitamente as versões antes da individualização apropriada.

Gerar grava texto, hash, bindings e proveniência, incrementando a revisão do documento e registrando ator/motivo. Não há mensagem de sucesso antes da confirmação. Alterar dados do rascunho torna a geração anterior desatualizada para exportação corrente. A revisão anterior permanece consultável/exportável por seleção explícita. Novas revisões do modelo não mudam o documento congelado.

## Segurança e rollback

Leitura textual exige leitura de Fornecedores e `attachments`. Edição/importação de modelos exige ainda `edit` e `governance`; geração exige `edit`; exportação exige `export`; download do compêndio original exige também `governance`. Projeto e beneficiária de Estratégia são revalidados quando aplicáveis. Textos vinculados a projeto exigem também `projects:attachments`, inclusive leitura, histórico, geração e exportação, com teste negativo próprio. UTU/Vinho não ganham operação. A autorização precede replay idempotente. Lock por empresa, lock do ator e CAS protegem importação/edição/geração concorrentes. Conteúdo é texto escapado na interface e no DOCX; não há HTML executável, URLs públicas ou chamadas externas.

Down 013 é destrutivo para **fontes e textos dessa extensão** e exige o controle de rollback existente. Preserva identidades e revisões cadastrais de 009, OS/custos e funções anteriores. Reaplicação não recupera bytes apagados; uma restauração real exige backup privado. Reimportação explícita da fonte restaura textos de origem em nova revisão nos mesmos modelos, sem fingir recuperar edições perdidas. Instrumentos congelados sem seu texto histórico não são exportados como se completos. Testes usam somente banco descartável e comprovam ausência de IDs fantasma/duplicação após reaplicação. Não usar down como mecanismo de revisão documental.

## Validação e limites remanescentes

Unitários: 65 segmentos/famílias, hash/autenticidade sintética, marcadores/literalidade, revisões Word, DOCX válido e fontes inválidas. Integração MySQL: importação idempotente, concorrência/CAS, versões, origem, bindings canônicos, congelamento, invalidação e histórico, metadados sem perda textual, exportações, empresa alheia/UTU/Vinho, anexos/governança revogados e rollback/reaplicação. Playwright: importação, download original exato, edição com componente legado, individualização, recarga, PDF/DOCX/JSON, congelamento e histórico. Regressão integral de Estratégia/Contratos/Projetos/Fornecedores; checks não desabilitados.

Resultados por SHA e artefatos serão registrados na PR #9 após execução; não confundir build local com CI aprovada.

Ainda não entregue neste bloco: aditivos/encerramento operacionais, poderes/delegações, remissões jurídicas automáticas, fidelidade gráfica integral do Word, integração automática do rascunho gerado ao texto do contrato operacional, rateios/compensações e consolidação temporal. Dados cadastrais congelados e o contrato operacional não mudam por editar texto de rascunho. Esses próximos blocos continuam autorizados, sem pedir aceite de rotina e sem tratar revisão do compêndio como bloqueio. Não há homologação integral.

A primeira CI 05D passou 57 unitários, 86 integrações MySQL nas duas execuções e oito jornadas anteriores. A jornada nova percorreu importação/edição/individualização/exportações/histórico, mas a etapa de reload assumiu persistência de navegação que a aplicação não oferece; o teste agora reabre Fornecedores antes de conferir os dados recarregados. Nenhuma verificação foi removida, nem timeout ou retry ampliado.
