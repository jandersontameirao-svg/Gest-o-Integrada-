# 05B — estrutura de Fornecedores durante revisão jurídica

## Escopo e dependência

Incremento estrutural, não conclusão do módulo de contratação. Branch `dev/comando-05b-fornecedores`, baseada na PR #8, cabeça `a59a0323345d5df31029a71ea01b3c5a71dee828`. Nenhuma alteração nas branches anteriores. O compêndio foi informado como ainda em revisão final: não há aprovação jurídica presumida.

## Entregue

- Cadastro preparatório de prestador/pessoa, usando `business_parties` como identidade canônica. Contatos e endereço segregados no vínculo por empresa; identidade não editável neste fluxo.
- Reaproveitamento dos blocos de dados básicos/endereço do `SupplierForm` e da apresentação de histórico do legado; autenticação, API e persistência adaptadas à GI.
- Cinco famílias estruturais: contrato de prestador, OS, medição, aditivo e indicadores. Catálogo de componentes, sem transcrição de cláusulas em revisão.
- Modelos e rascunhos com salvar, recarregar, editar, CAS, idempotência, revisão imutável, autoria e auditoria transacional. Documento fixa a versão do modelo, inclusive após edição posterior do modelo.
- Contratante, beneficiária proposta, prestador, projeto e atividade são referências distintas. Beneficiária estratégica não recebe habilitação operacional.
- Espelhamento em Projetos pelo mesmo componente e backend canônico. Não há base mestre ou emissor de OS paralelo.
- Exportação JSON autenticada, com marca explícita de rascunho não emitido. PDF jurídico, upload e armazenamento de anexos não estão entregues nesta etapa.
- Somente estados `draft` e `in_review`. API rejeita promoção, emissão, assinatura, mobilização, desmobilização, cálculos e liquidação. Não gera eventos operacionais/financeiros.

## Segurança e migração

API autenticada `/api/v1/suppliers`, autorização por empresa/módulo/ação, inclusive leitura, histórico, exportação e vínculos a projeto/atividade. UTU/Vinho continuam negadas em Fornecedores. Metadado de beneficiária pode referenciar escopo estratégico autorizado sem conceder operação. Payloads permitem apenas campos estruturais; preços, banco, multas, aceite automático e horas de cobrança não são aceitos. Limite JSON 64 KB. Não foram portados login, bootstrap ou endpoints públicos do legado.

Migração 009 incremental com down inverso e checksum pelo executor existente. O rollback remove rascunhos/vínculos desta etapa, preservando a identidade compartilhada em `business_parties`. Usar down somente em banco descartável; em ambiente com dados, exigir plano de preservação e revisão antes de rollback destrutivo.

As concessões edit/export adicionadas são exclusivamente para o diretor sintético da Holding pelo seed restrito a banco `_demo`; não criam política de produção. Demais concessões seguem governança existente.

## Fontes e proteção

Legado: `arqueo-fornecedores@8b5c94098333922e9dcc00ca5c67b612da24a26a`. Arquivos de origem e destino, hashes e limites de reaproveitamento constam na matriz JSON. Compêndio privado SHA-256 `70c651c15eb08ec9540c086ae449ed5c6f5350052d07f424dffe1c11d8005efd`, usado apenas como referência estrutural. Original, comentários, alterações controladas, valores preenchidos e dados privados não foram incluídos no repositório. Sem APIs externas ativas.

## Validação

Build e TypeScript estrito locais aprovados; oito arquivos unitários passaram localmente. A CI executa `npm ci`, build, unitários, integração MySQL 8.4 isolada, migrações/checksum/idempotência, down/reaplicação e nova integração, E2E Playwright, regressões de Estratégia/Contratos/Projetos e auditoria de dependências. Evidências finais devem ser lidas na execução associada ao SHA da PR; não tratar estes testes como homologação jurídica ou integral do legado.

Testes novos cobrem cinco famílias, rejeição de regras comerciais, cadastro compartilhado e contatos segregados, edição concorrente, idempotência, versões congeladas, referências adulteradas, negativa por perfil/empresa/UTU/Vinho, revogação antes de replay, ausência de efeitos operacionais e espelhamento canônico. E2E comprova cadastro, edição, recarga, modelo, rascunho, histórico e exportação JSON. Não comprova emissão real de OS ou contratação.

## Limitações e parecer

Primeiro incremento estrutural utilizável para organizar a revisão. Não homologado como sistema de contratação. CPF/CNPJ valida formato, não regularidade fiscal. Cadastro não equivale a qualificação, representação legal ou autorização de gasto. Capacidade de componentes no catálogo não significa implementação de seu fluxo jurídico. Pendências e decisões estão no backlog; manter PR em rascunho, sem merge/deploy.
