# Segurança

## Implementado

Sessões opacas de 256 bits; somente digest armazenado no banco. Senhas scrypt com salt
aleatório. Token em memória do navegador, sem persistência em localStorage ou cookies.
Não há cookies de autenticação, portanto a sessão não é enviada implicitamente por
requisições cross-site. Não habilitamos CORS. Limites de requisição e login, Helmet,
limite de payload, erros genéricos e consultas parametrizadas.
Autorização no backend por empresa, cargo, módulo e ação; negação por padrão.

Auditoria registra login permitido/negado, logout e leitura de módulos permitida/negada,
com ator quando conhecido, contexto e instante UTC. Login negado não armazena e-mail
nem senha. Dados de módulo só são retornados após gravação do evento de auditoria.
Não há endpoints públicos de administração, auditoria ou concessão de acesso.

## Limites explícitos

MySQL não oferece RLS equivalente ao PostgreSQL nesta implementação; isolamento é
da aplicação e exige o mesmo padrão em toda nova consulta. Novos módulos devem
reutilizar authorize e adicionar testes de leitura e escrita entre empresas.

A trilha está em tabela append-only por convenção da aplicação; o runtime futuro
deve receber SELECT/INSERT nessa tabela, sem UPDATE/DELETE. Não há armazenamento
externo imutável, assinatura de eventos ou política de retenção nesta fase.
A credencial de demonstração também executa DDL; não é uma configuração produtiva.

Antes de qualquer uso operacional: separar credenciais de migração e runtime,
configurar TLS de banco e HTTPS, cofre e rotação de segredos, backups e restauração,
MFA e recuperação de conta, ciclo de vida de usuários/cargos, monitoramento,
rate limit distribuído e revisão independente de segurança.
Não existe cadastro público, redefinição de senha, interface de gestão de usuários
ou mecanismo de elevação de privilégio. A fundação modela os cadastros e permissões;
sua administração será especificada em etapa posterior.

Testes de integração exigem DB_NAME *_demo e alteram apenas dados sintéticos.
O rollback é destrutivo e protegido por variável explícita.
Credenciais de CI são descartáveis, restritas ao serviço MySQL do job.
