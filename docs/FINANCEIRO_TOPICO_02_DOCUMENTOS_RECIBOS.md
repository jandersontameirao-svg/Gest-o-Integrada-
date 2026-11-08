# Financeiro — tópico 2: documentos e recibos

Base: PR10, dev/comando-06b-financeiro, tópico1 validado em6beb784f8894d1d1a9a653fe87c8f998d638d070 / CI74. Esta entrega é restrita ao tópico2; não publica rascunhos locais de outros tópicos. Sem merge, deploy, dados de produção ou conectores externos.

## Origem e reaproveitamento

Documento_Reconstrucao_Integral_Zenply_UTU.pdf, seção Z16, descreve editor, modelos de recebimento/pagamento, duplicar/salvar/excluir/imprimir e catálogo de36 variáveis. Somente10 nomes são efetivamente apresentados: DATA_ATUAL, HORA_ATUAL, DATA_HORA_ATUAL, MES_ANO_ATUAL, CONTATO_NOME, ITEM_VALOR, ITEM_DESCRICAO, MINHA_EMPRESA_CIDADE, MINHA_EMPRESA_ESTADO, MINHA_EMPRESA_RAZAO_SOCIAL. Os outros26 não são inventados. Emissão/substituição efetiva não foi comprovada pela observação original. UTU SHA c63ad1c: editor equivalente não localizado na análise existente. A ausência justifica editor próprio, sem alegar port desse componente.

Reutilizados: painel FinanceDocuments, autenticação/escopos GI, arquivo privado/validador de formatos de Contratos, primitivas transacionais/idempotentes/auditoria do Financeiro, jsPDF/autoTable e identidade visual. As bibliotecas e a abordagem de PDF já utilizadas em Contratos são adaptadas com cabeçalho e rodapé financeiros. Nenhum cadastro mestre concorrente.

## Fluxos implementados para validação

- Aba Recibos e painel documental do título: modelos por empresa e tipo (recebimento, pagamento ou compensação interna), gravação real, recarga, edição por nova versão, duplicação, arquivamento e restauração. Exclusão é lógica; versões/documentos anteriores permanecem preservados.
- Editor estruturado seguro: parágrafos, listas numeradas/não numeradas, tabelas, quebra de página, fontes/tamanho/negrito/itálico/sublinhado/alinhamento/entrelinha por bloco, localizar/substituir, duplicar/remover/subir blocos, prévia e ampliação. Não aceita HTML executável, scripts, imagens remotas ou expressões. Formatação é por bloco; não é editor arbitrário de HTML ou estilização por seleção.
- Catálogo com origem e disponibilidade explícitas. ITEM_VALOR tem semântica original não comprovada e bloqueia emissão; use VALOR_DOCUMENTO (soma exata dos fatos selecionados) ou TITULO_VALOR_NOMINAL. Nome de exibição da empresa não é presumido como razão social. Cidade/estado/razão social não existem no cadastro canônico atual e bloqueiam emissão quando usados. Sem fabricação ou segundo cadastro. CONTATO_NOME/CONTATO_DOCUMENTO dependem de vínculo canônico válido da empresa.
- Prévia persistida por usuário/empresa, token/expiração15min e revalidação transacional da origem/modelo. Emissão exige confirmação e motivo; o relógio UTC é fixado na emissão. A prévia não gera documento definitivo nem movimentação financeira.
- Recibo somente de liquidações já existentes, selecionadas e não estornadas.400 liquidados em título1000 geram documento de400, com posição na emissão e saldo600 explícitos. Compensação não é pagamento bancário e não pode misturar fatos de caixa no mesmo documento.
- Snapshot imutável, versão do modelo, autor, fatos/IDs, período, moeda e PDF privado com SHA256. Reimpressão vigente devolve os mesmos bytes. Revisão do modelo não altera recibos antigos. Novos pagamentos não alteram recibos de pagamentos parciais anteriores.
- Cobertura única de liquidação por série documental. Cancelamento não libera a origem para criar série concorrente; reemissão usa a mesma série e preserva o histórico. Não há sequência jurídica presumida: UUID interno e versão explícitos.
- Cancelamento auditado sem estorno financeiro. Origem estornada ou documento cancelado/substituído impedem download vigente; cópia histórica tem identificação em todas as páginas. O PDF original permanece preservado internamente.
- Anexos existentes PDF/DOCX/XLSX/PNG/JPEG mantêm validação de formato/MIME/assinatura/limites e armazenamento privado. Arquivar/restaurar requer revisão, motivo, período aberto e permissão por empresa/título/ação. Arquivo arquivado somente pode ser baixado mediante pedido explícito histórico. Substituição não apaga bytes de versões anteriores.

## Segurança e persistência

Migração021 cria templates, recibos e cobertura com FKs compostas de empresa, unicidade por série/versão e origem. Acrescenta estado/revisão nos anexos. Down isolado e destrutivo somente pelo mecanismo já autorizado para banco descartável; destrói documentos deste incremento e reverte colunas, sem ser plano de migração real.

Concessões específicas: receipts.read, receipts.issue, receipts.templates, receipts.cancel. Leituras exigem finance.read e leitura do tipo do título; emissão exige export+issue; modelos exigem governance+templates; cancelamento exige approve+cancel. Reemissão de cancelado exige approve. A validação de permissões ocorre antes do cache idempotente, inclusive em replay. UTU/Vinho continuam bloqueadas nos módulos operacionais.

Escritas usam transação, bloqueio da empresa e do ator, CAS e histórico/outbox internos sem despacho externo. Uma liquidação não pode gerar duas séries concorrentes de recibos. Reimpressão não gera caixa, DRE, título ou evento de cobrança.

## Evidências e critérios

- tests/finance-receipts.test.ts: catálogo/proveniência, limites, single-pass, dados ausentes, blocos/estilos, PDF multipágina/histórico.
- tests/finance-receipts.integration.ts: MySQL, salvar/recarregar/versionar/duplicar/arquivar/restaurar, parcial400/1000, concorrência/idempotência, hash PDF, cancelamento/estorno, isolamento/perfis/UTU/Vinho/replay revogado e anexos históricos.
- tests/browser/finance-receipts.spec.ts: editor real, editar/recarregar, emissão parcial, PDF, recarga e cancelamento/histórico, sem tráfego externo. Captura e PDFs exclusivamente sintéticos no artefato de CI.
- CI existente executa TypeScript/build/unitários, migrações/checksum/idempotência/down/up, integração duas vezes, regressão Estratégia/Contratos/Projetos/Fornecedores/Financeiro, Playwright e npm audit. Resultado por SHA e link ficam na PR10; testes adicionados não são evidência de aprovação antes da execução.

## Limites e melhorias futuras

Não se declara equivalência completa às36 variáveis Zenply, nem homologação visual/jurídica. Impressão pode usar o PDF gerado. Estilização parcial por seleção, pixel parity com editor original, assinaturas, logos de terceiros, conversão entre moedas, validação fiscal e distribuição por e-mail não estão incluídas. O PDF usa fontes embutidas padrão, com limitações para caracteres fora da cobertura Latin1. Alinhamento justificado em PDF é apresentado à esquerda; não é declarada paridade tipográfica desse atributo. Tabelas respeitam fonte/tamanho/alinhamento, sem toda a estilização individual do editor. Essas diferenças precisam de melhoria antes de afirmar paridade visual integral.

Unificação de séries documentais que já emitiram separadamente para eventos distintos não é automática; cada série deve ser reemitida separadamente. Nenhuma regra comercial/jurídica nova é imposta. Cadastros legais ausentes e catálogo não comprovado permanecem limitações de dados específicas, sem bloquear os modelos GI que usam campos disponíveis.

Próximo tópico somente em rodada própria, conforme sequência escolhida pelo usuário.
