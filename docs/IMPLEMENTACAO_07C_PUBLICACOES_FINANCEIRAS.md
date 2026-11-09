# 07C — Apurações financeiras versionadas vinculadas a KPIs

Base: PR12/07B, SHA34118344e0bed54a5f7eddb9ab024b92571ede36/CI93 aprovada. Branch própria dev/comando-07c-publicacoes-financeiras; PRs/branches anteriores preservadas. Autorização de continuidade cobre desenvolvimento isolado, não aprovações reais, merge/deploy ou integrações externas.

## Incremento funcional

Em **Indicadores e valores → Apurações financeiras dos KPIs**, usuário autorizado carrega, prepara uma apuração mensal, confere valor/hash, aprova ou rejeita, recarrega e exporta histórico. Vincula empresa/plano/KPI/indicador corporativo/competência/moeda à fonte financeira. Meta e observações manuais não são sobrescritas. Não cria observação flutuante fictícia nem mistura a série manual/gráfico legado com a financeira; esses gráficos permanecem uma evolução específica.

Fontes desta rodada: receita líquida, EBITDA, resultado líquido e margem EBITDA, calculados pelo mesmo financeSummary/strategyFinancialIndicators. Valores permanecem decimais exatos com seis casas; margem preserva a truncagem canônica em duas casas percentuais. Limite técnico de18 dígitos inteiros; excesso é recusado, nunca arredondado silenciosamente. Margem exige unidade% e indicador não somável; demais fontes exigem unidade ISO igual à moeda do KPI e indicador corporativo. Sem caixa/projeção/estoques publicados como fluxo mensal somável.

Preparação exige plano aprovado, KPI mensal, período estratégico aberto, competência mensal completa terminada até hoje e fonte financeira classificada/aprovada. Sem fatos não publica zero. Até5000 fatos operacionais de competência por apuração. Não é alçada comercial. Alterações de classificações/valores/aprovação da fonte tornam a apuração desatualizada ou indisponível; a versão aprovada continua intacta. Pagamento/estorno que apenas muda revisão de caixa não altera a assinatura semântica do resultado por competência.

## Persistência, decisões e concorrência

Migração024 cria strategy_financial_publications (identidade e ponteiro vigente), strategy_financial_versions (snapshots/hash/autor/decisão), strategy_financial_requests (idempotência). Versão pendente só muda de estado; seu conteúdo/hash não é editado. Nova aprovação troca approved_version, conservando versões anteriores e eventos em strategy_history. Rejeitar prévia não remove a última versão aprovada.

Hash SHA256 de JSON canônico protege o pacote completo; semanticSha256 verifica definições/plano/KPI/competência/moeda/unidade/valor/fatos monetários, sem invalidar a DRE por revisão de baixa. Versão guarda também revisões observadas para auditoria. Aprovação exige hash, revisão atual e recálculo semântico na mesma transação sob lock de empresa/plano; se fonte mudou, exige rejeição e nova prévia. Histórico/exportação verificam integridade do snapshot antes de responder.

Aprovar/rejeitar exige DIRETORES e concessão de aprovação na Estratégia. Preparação exige edição estratégica e leitura financeira completa dos tipos necessários. Leitura/histórico exigem ambos os domínios; exportação exige export nos dois. Cache idempotente é consultado depois de autorização e estado aberto do plano/período. Replays idênticos não duplicam versões; conteúdos diferentes/conflitos retornam409. Competições têm um resultado vigente, sem sobrescrever a decisão anterior. Nenhuma decisão é tomada em nome do CEO pelo processo de desenvolvimento.

A fonte financeira de uma empresa/competência/moeda só pode ter um vínculo de KPI/indicador; indicador corporativo/competência e KPI/competência também são únicos. Preparação recusa observação manual ou contribuição concorrente já existente; as rotas manuais também recusam escrita/publicação concorrente após o vínculo financeiro. Exclusão e mudança de unidade/frequência do KPI com proveniência ficam bloqueadas. Não apaga aparentes duplicidades; exige conciliação humana. Desvinculação, transferência entre KPIs/planos e revogação de versão já aprovada não foram inventadas nesta rodada.

## Unidade histórica e consolidação

Apuração requer uma única unidade cobrindo o mês inteiro. Transferência intramês é recusada até existir política explícita de distribuição; não faz pró-rata nem usa a unidade atual. Unidade de origem é imutável na identidade da apuração. Transferência posterior não reatribui o resultado histórico.

Alinhamento e consolidação mostra contribuições financeiras aprovadas por empresa, unidade histórica ou Holding, com apenas a última versão aprovada de cada origem. Permissões de empresa/Financeiro e escopo estratégico são revalidadas, inclusive na exportação; ausência de contribuição autorizada não significa zero. Limite técnico200 contribuições por intervalo, exigindo recorte menor quando excedido.

**Total monetário continua indisponível (total=null, automaticAggregation=false)**: versões financeiras não entram nos grupos manuais nem são somadas entre empresas. Eliminações interempresa e câmbio para DRE/resultados ainda exigem política; margem não é somável. A consulta conserva contribuição e proveniência sem produzir consolidação incorreta. O catálogo additive não libera soma financeira por si só.

## Contrato de API /api/v1/strategy

- GET financial-publications?companyId&planId: prévia, versão aprovada e saúde da fonte.
- POST financial-publications: companyId/requestId/planId/kpiId/metricId/metricKey/period(YYYY-MM)/currency/revision/reason. Retorna versão pendente, valor e hash.
- POST financial-publications/:id/approve|reject: companyId/requestId/revision/version/sha256/reason/evidence.
- GET financial-publications/:id/history?companyId[&export=true]: versões imutáveis e eventos autorizados.
- GET consolidation: grupos manuais preservados; financialContributions separado, sem total monetário. Financeiro permanece autoridade dos fatos; os novos endpoints não criam títulos, custos ou lançamentos.

## Validação

Build/TypeScript e124 unitários locais aprovados. Testes novos: calendário/precisão/canonicalização; integração com preparação/concorrência/replay, alteração de fonte, rejeição, preservação de versões, pagamento sem falsa mudança de DRE, fechamentos, papel de diretor, permissões/exportação/IDs/UTU/Vinho, transferência e unidade histórica; navegador com duas versões aprovadas, recarga e JSON reaberto. Fixture negativa intramês modifica somente história sintética de teste e restaura-a; não muda a regra pública de transferência efetiva hoje.

CI deve validar182 testes MySQL antes/depois de rollback,24 migrações sequenciais/checksum/reaplicação,25 jornadas de navegador, auditoria/lockfile e regressão de Estratégia/Contratos/Projetos/Fornecedores/Financeiro. Números previstos não são aprovação antecipada; resultado por SHA e artefatos na PR. Dados exclusivamente sintéticos, tráfego externo bloqueado.

## Rollback e limites

Down024 elimina versões/vínculos/cache desta funcionalidade; não reverte fatos financeiros nem decisões de negócio e requer backup antes de qualquer uso fora do banco descartável. Eventos de strategy_history podem sobreviver ao down; reaplicação não recria snapshots apagados. Ensaio privado de recuperação financeira não inclui as novas tabelas de Estratégia; não é backup integral da aplicação. Plano operacional de backup deve cobrir ambas as autoridades antes de produção.

Snapshots registram a posição calculada a partir dos estados/classificações disponíveis no instante da preparação. Não reconstituem todos os estados históricos do banco. Consolidação monetária, vínculo dos gráficos manuais, revogação/transferência de vínculo e desempenho/paginação em grandes volumes são pendências específicas. Homologação humana, arquivos reais, infraestrutura e produção continuam separados. Sem IA, serviços externos, dados reais, merge ou deploy.
