# Correção e validação do Comando 01

O repositório foi inicializado com README no commit
68821118edfb5a1e1d1a19f89f01fd8270718fc4; main permanece nesse ponto.
Toda a implementação e suas correções estão em dev/comando-01-fundacao, PR nº 1.
Sem merge, deploy, integração ATENA OS/Manus, migração de legados ou inclusão da UTU.

## Correção do TS2769

O helper rows aceitava unknown[], incompatível com ExecuteValues do mysql2.
Agora SqlParameter restringe parâmetros a string, number, boolean, Date, Buffer
ou null. Não há any, supressão de erro ou relaxamento do TypeScript.
Consultas continuam parametrizadas.

## Dependências reproduzíveis

package-lock.json v3 gerado pelo npm no runner GitHub e versionado (205 pacotes).
Manifesto raiz e dependências do lock conferidos.
CI e instruções locais usam npm ci; cache baseado no lockfile.
CI verifica que package.json e package-lock.json não mudam durante a execução.
A configuração final não gera lock temporário.

## Evidência inicial da correção

[Foundation CI — execução 42117254283](https://github.com/jandersontameirao-svg/Gest-o-Integrada-/actions/runs/42117254283)
concluiu com sucesso no commit 248265100a8b52f8edc2ca8b2d360bec71542eaa:

- TypeScript estrito e bundle React/Vite.
- 9 testes unitários; 7 testes HTTP de integração com MySQL 8.4.
- Migração up, repetição idempotente e seed sintético.
- Rollback down explícito e reaplicação up.
- Auditoria npm: zero vulnerabilidades.

Essa execução gerou o lockfile. A configuração definitiva usa npm ci com o lock
versionado e adiciona seed e os sete testes de integração novamente após down/up.
Consulte os checks do último commit e o comentário de evidências na PR nº 1 para
a confirmação da rodada definitiva; o resultado inicial não substitui o final.

O ambiente local continua sem acesso funcional ao registro npm. Verificações com
dependências e MySQL são executadas no runner GitHub, sem alegação de execução local.
Os nove testes unitários também passaram localmente.

## Pendências de produto

Plano Mestre V03 não fornecido/não localizado: conferir aderência.
Marca tipográfica provisória: validar com manual oficial.
Padrão inicial informado como Geoportal: revisar configuração para main e proteção.
Administração de usuários/cargos, MFA, recuperação de conta e requisitos operacionais
permanecem fora desta fundação; veja architecture.md e security.md.
Comando 02 não iniciado.

