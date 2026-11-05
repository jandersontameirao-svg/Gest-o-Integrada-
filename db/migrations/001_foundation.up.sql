CREATE TABLE companies (
 id VARCHAR(40) PRIMARY KEY, name VARCHAR(160) NOT NULL,
 is_holding BOOLEAN NOT NULL DEFAULT FALSE, sort_order INT NOT NULL
);
CREATE TABLE users (
 id CHAR(36) PRIMARY KEY, email VARCHAR(254) NOT NULL UNIQUE,
 name VARCHAR(160) NOT NULL, password_hash VARCHAR(255) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE roles (id VARCHAR(40) PRIMARY KEY, name VARCHAR(80) NOT NULL);
CREATE TABLE permissions (id VARCHAR(80) PRIMARY KEY);
CREATE TABLE role_permissions (
 role_id VARCHAR(40) NOT NULL, permission VARCHAR(80) NOT NULL,
 PRIMARY KEY(role_id,permission), FOREIGN KEY(role_id) REFERENCES roles(id), FOREIGN KEY(permission) REFERENCES permissions(id)
);
CREATE TABLE memberships (
 user_id CHAR(36) NOT NULL, company_id VARCHAR(40) NOT NULL, role_id VARCHAR(40) NOT NULL,
 corporate BOOLEAN NOT NULL DEFAULT FALSE,
 PRIMARY KEY(user_id,company_id), FOREIGN KEY(user_id) REFERENCES users(id),
 FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(role_id) REFERENCES roles(id),
 CHECK (corporate = FALSE OR company_id = 'holding')
);
CREATE TABLE sessions (
 token_hash CHAR(64) PRIMARY KEY, user_id CHAR(36) NOT NULL, expires_at DATETIME NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id), INDEX(expires_at)
);
CREATE TABLE demo_records (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, module_id VARCHAR(40) NOT NULL,
 label VARCHAR(255) NOT NULL, FOREIGN KEY(company_id) REFERENCES companies(id), INDEX(company_id,module_id)
);
CREATE TABLE audit_events (
 id CHAR(36) PRIMARY KEY, actor_id CHAR(36) NULL, company_id VARCHAR(40) NULL, module_id VARCHAR(40) NULL,
 action VARCHAR(80) NOT NULL, outcome ENUM('allowed','denied') NOT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 FOREIGN KEY(actor_id) REFERENCES users(id), FOREIGN KEY(company_id) REFERENCES companies(id),
 INDEX(company_id,created_at)
);
