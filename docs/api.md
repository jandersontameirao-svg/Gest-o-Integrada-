# API v1

Autenticação por Authorization: Bearer <token>. JSON. Sem integração ATENA OS.

| Método | Rota | Comportamento |
|---|---|---|
| GET | /api/v1/health | Disponibilidade do processo; não valida banco |
| POST | /api/v1/auth/login | Recebe email/password, retorna token e usuário |
| POST | /api/v1/auth/logout | Revoga sessão corrente |
| GET | /api/v1/me | Usuário e permissões atuais |
| GET | /api/v1/companies | Empresas visíveis para o usuário |
| GET | /api/v1/modules/:module/overview?companyId=:id | Registros sintéticos do contexto autorizado |

module: projects, contracts, suppliers, finance, strategy.
companyId: identificador de empresa ou corporate (concessão explícita da Holding).
401: sessão ausente/inválida/expirada. 403: empresa ou módulo sem concessão.
400: contexto ausente ou formato inválido. 404: rota/módulo inexistente.
429: limite de requisições. 500: falha interna sem detalhes sensíveis.

Os endpoints de módulos são exclusivamente de leitura e retornam demonstration=true.
Não são contratos finais de negócio. Não há APIs de edição dos módulos nesta fase.
