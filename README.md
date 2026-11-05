# Gestão Integrada — Grupo Arqueo

Fundação do Comando 01: plataforma independente, modular e multiempresa.
React + TypeScript, API Node/Express e MySQL 8.4. Sem integração com ATENA OS,
sem Manus, sem deploy, sem migração dos legados e sem participação da UTU.

## Executar localmente

Requisitos: Node 24 e MySQL 8.4 em banco descartável. Crie `arqueo_demo` e um
usuário exclusivo com acesso apenas a esse banco. Para ambiente operacional futuro,
separe a credencial de migração da credencial da API; veja [segurança](docs/security.md).

1. `cp .env.example .env` e ajuste a conexão.
2. Defina `DEMO_PASSWORD` sintética (16–256 caracteres).
3. `npm ci`
4. `npm run migrate`
5. `npm run seed` (uma única vez, apenas em banco vazio).
6. Em terminais separados: `npm run dev:api` e `npm run dev`.
7. Abra o endereço informado pelo Vite.

Contas sintéticas: `holding@example.test`, `projetos@example.test`,
`oceano@example.test` e `restrito@example.test`; todas usam a senha
fornecida no seed. As contas não são criadas automaticamente pela API.
Holding tem concessão corporativa explícita; o usuário restrito não acessa módulos.
As cinco empresas são cadastradas pelo seed, usando apenas os nomes solicitados.

## Verificação

- `npm test`: política de acesso e criptografia, sem serviços externos.
- `npm run build`: TypeScript estrito + compilação React/Vite.
- `npm run test:integration`: API HTTP real contra banco descartável já migrado e semeado.
- `npm audit --audit-level=high`: auditoria do lockfile versionado.
- `ALLOW_DESTRUCTIVE_ROLLBACK=yes npm run migrate -- down`: rollback destrutivo apenas em banco descartável.

CI em [.github/workflows/ci.yml](.github/workflows/ci.yml) executa compilação,
testes, migração idempotente, seed, integração, rollback e reaplicação.
A API também serve `dist/client` após build, usando `npm start`.
O servidor escuta somente loopback. Acesso remoto futuro exige proxy HTTPS e revisão operacional.

## Documentação e revisão

- [Arquitetura e decisões](docs/architecture.md)
- [Segurança e isolamento](docs/security.md)
- [API v1](docs/api.md)
- [Entrega, validação e limitações](docs/delivery.md)

A main contém somente a inicialização mínima. Toda a fundação é proposta em
`dev/comando-01-fundacao` para revisão por PR. O Comando 02 depende de aprovação.

