# Entrega do Comando 01

## Estado inicial e branches

O GitHub informou repositório privado vazio (size 0), sem branches e com padrão
Geoportal. A API de criação de arquivo inicializou Geoportal com apenas README.md,
commit 68821118edfb5a1e1d1a19f89f01fd8270718fc4.
main foi criada nesse mesmo commit, sem código funcional.
dev/comando-01-fundacao partiu do mesmo ponto e recebe toda a implementação.

A configuração da branch padrão ainda requer alteração de Geoportal para main em
Settings → Branches/Default branch. O conector disponível não oferece edição dessa
configuração. Não excluir Geoportal antes de mudar o padrão.
Configure proteção de main e checks obrigatórios antes da integração.

## Verificações e limites do ambiente

- Nove testes de catálogo, isolamento, permissões e criptografia passaram ao executar
  node tests/core.test.ts. npm test também terminou sem falhas.
- npm install foi tentado e falhou por conexão/EPERM no proxy de rede do ambiente.
- npm run build foi tentado e parou em tsc: not found, pois as dependências não puderam ser instaladas.
- Compilação completa, interface no navegador, testes HTTP com MySQL, migrações
  reais e npm audit ainda não foram validados localmente.
- CI foi preparada para executar essas verificações no GitHub; resultado remoto
  precisa ser conferido na PR. Não considerar verificações pendentes como aprovadas.
- Não há lockfile de dependências validado. A CI resolve versões declaradas,
  gera lock temporário para auditoria e deve ser substituída por npm ci após
  registrar um lock revisado. Esta limitação bloqueia declarar build reproduzível.

## Entregáveis

client: aplicação React, login, navegação superior, seletor e visão corporativa.
server: API versionada, autenticação independente, autorização, banco e auditoria.
shared: catálogo dos cinco módulos e cinco empresas, tipos comuns.
db/migrations: schema versionado com up/down.
scripts: migração protegida e seed exclusivamente sintético.
tests: políticas/criptografia e integração HTTP/MySQL.
.github/workflows: compilação, testes, migrações e auditoria.
docs: arquitetura, API, segurança e este registro de entrega.

## Pendências para revisão

Conferir o Plano Mestre V03 (não fornecido/não localizado), validar identidade visual
com manual oficial, passar build/integração/auditoria, registrar lockfile e alterar
branch padrão para main. Administração de usuários/cargos, MFA, recuperação de conta,
funcionalidades de negócio e migração dos legados estão fora desta fundação.
Não houve deploy, uso de Manus, integração com ATENA OS, alteração de aplicativo
existente ou inclusão da UTU. Comando 02 aguarda aprovação.
