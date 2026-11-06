# Backlog de Contratos após 03C

Esta rodada não homologa integralmente o módulo. Nenhum item autoriza implementar 04B, 05B ou Financeiro.

| Prioridade | Pendência | Aceite futuro |
|---|---|---|
| Alta | Identificador de item contratual e quantidades/unidades de serviço | Limites por item canônico, medição incremental e testes de concorrência; hoje limites são monetários por marco e contrato |
| Alta | Prevenção de duplicidade entre boletins parcialmente sobrepostos | Referência externa única e conciliação humana; hoje detecta cópias integrais ativas, não equivalência semântica de textos distintos |
| Alta | Upload PDF/binário privado, antivírus e política documental | Tamanho, MIME/conteúdo, quarentena, ownership, retenção e download; hoje apenas TXT e PDF gerado |
| Alta | Demais templates e relatórios especializados do legado | Inventário e homologação visual e funcional de cada template; gerador tabular reaproveitado não implica paridade de todos os relatórios |
| Alta | Riscos/ocorrências e responsáveis/aprovadores com usuários canônicos | CRUD auditado e permissões; campos livres atuais não constituem alçadas automáticas |
| Média | Alertas internos e painel gerencial ampliado | Alertas persistidos, regras de vencimento e confirmação, sem envio externo automático |
| Média | Evidências estruturadas por item e assinatura documental | Anexos autorizados associados a decisões; evidência textual atual não comprova assinatura legal |
| Média | Revogação/revalidação temporal avançada do pré-projeto | Renovação autorizada, preservação da mesma referência, integração 04B idempotente |
| Média | Desempenho e paginação | Limites de registros, relatórios extensos e divisão do bundle frontend; build alerta bundle >500 kB |

## Decisões do CEO ainda necessárias

- Alçadas por valor, expiração e renovação do pré-projeto. Limite informado é decisão humana individual, não política geral.
- Numeração jurídica definitiva e tratamento de referências legadas.
- Regras de glosa, recursos, faturabilidade, medição parcial e competências. A ferramenta registra a decisão; não define automaticamente tais políticas.
- Quem pode atuar como responsável/aprovador, substituição e segregação de funções.
- Retenção documental, formatos, limites, assinaturas e restrições de acesso específicas.
- Regras de custos/competência de OS para 05B, sem implementação nesta rodada.
