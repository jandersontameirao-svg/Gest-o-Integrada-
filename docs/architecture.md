# Arquitetura e decisões

## Contexto comprovado

O repositório alvo estava vazio, sem branches, e a configuração padrão informava
Geoportal. O package.json de arqueo-fornecedores foi consultado somente para leitura:
React 19, TypeScript, Vite, Node/Express, mysql2, Drizzle e tRPC estão presentes.
Nenhum código, dado ou credencial dos sistemas existentes foi importado ou alterado.

O Plano Mestre V03 não foi fornecido nem localizado na busca GitHub por
“Plano Mestre”. Esta entrega segue os requisitos explícitos do Comando 01 e
depende da conferência contra o documento antes de evoluir o escopo.

## Decisões

- Monólito modular: client, server, shared, db, scripts e tests. Reduz complexidade
  operacional inicial e mantém contratos de domínio tipados. Os cinco módulos são
  um catálogo estável; não há funcionalidades de negócio migradas.
- React/TypeScript/Vite: compatibilidade com a referência existente.
- Express 5 + TypeScript: mesma família de backend, com suporte a erros async.
- MySQL 8.4 + mysql2: compatibilidade de banco e driver. SQL explícito nesta fundação
  torna o filtro de empresa e o rollback inspecionáveis. Não copiar ORM e autenticação
  legados evita trazer dependências e acoplamentos desnecessários.
- API REST /api/v1: fronteira versionada para integrações futuras. A opção por REST,
  em vez de tRPC do legado, simplifica consumo por clientes externos.
- Autenticação local: scrypt com salt aleatório, sessão opaca com digest SHA-256 no banco,
  validade de oito horas, revogação por logout e revalidação de vínculos a cada chamada.
- Cargos e permissões: vínculo por usuário/empresa, cargo com permissões módulo:ação.
  Somente leitura é concedida nesta fase. Concessão corporativa exige vínculo
  na Holding, flag explícita e permissão do módulo solicitado.
- Empresas são cadastradas no seed de desenvolvimento junto de registros claramente
  sintéticos. Não há dados de produção nem criação automática ao iniciar servidor.

## Fluxo de isolamento

O cliente envia companyId. A API autentica a sessão, carrega vínculos atuais e
autoriza módulo e ação antes da consulta. Consulta individual sempre usa
company_id = ?; o contexto corporate exige concessão válida na Holding.
Permissões de um vínculo local não se somam a outro vínculo para autorizar módulos.
O cliente não decide autorização. Não há endpoint genérico de consulta ou SQL remoto.

## Migrações

Arquivos SQL up/down numerados, diário de versão e advisory lock por banco.
MySQL DDL não é transacional: um marcador dirty bloqueia nova execução após falha,
exigindo diagnóstico e restauração em banco descartável. Não se promete rollback
automático de DDL parcial. O down elimina dados e requer opt-in explícito.
A CI verifica up repetido e down/up em MySQL real.

## Interface

Navegação superior dos cinco módulos, seletor de empresa, visão corporativa,
cards e componentes reutilizáveis. Bordô #702338, azul #203e5a e laranja #b94912.
Marca tipográfica provisória; nenhum manual de marca ou logotipo oficial foi fornecido.
Responsividade por CSS, labels, foco visível e mensagens acessíveis; revisão visual
e teste assistivo completos permanecem pendentes.
