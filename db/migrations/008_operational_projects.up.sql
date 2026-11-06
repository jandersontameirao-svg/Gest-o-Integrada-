CREATE TABLE operational_projects (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, contract_id CHAR(36) NULL UNIQUE,
 origin_key VARCHAR(100) NOT NULL UNIQUE, payload JSON NOT NULL, revision INT NOT NULL DEFAULT 1,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(contract_id) REFERENCES client_contracts(id)
);
CREATE TABLE operational_project_records (
 id CHAR(36) PRIMARY KEY, project_id CHAR(36) NOT NULL,
 kind ENUM('phase','task','dependency','sprint','comment','allocation','deliverable','work_fact') NOT NULL,
 payload JSON NOT NULL, revision INT NOT NULL DEFAULT 1,
 UNIQUE(id,project_id), FOREIGN KEY(project_id) REFERENCES operational_projects(id)
);
CREATE TABLE operational_project_history (
 id CHAR(36) PRIMARY KEY, project_id CHAR(36) NOT NULL, project_revision INT NOT NULL,
 actor_id CHAR(36) NOT NULL, action VARCHAR(80) NOT NULL, before_data JSON NULL, after_data JSON NOT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 FOREIGN KEY(project_id) REFERENCES operational_projects(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE operational_project_requests (
 actor_id CHAR(36) NOT NULL, request_id CHAR(36) NOT NULL, hash CHAR(64) NOT NULL,
 response JSON NOT NULL, PRIMARY KEY(actor_id,request_id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE operational_project_budgets (
 id CHAR(36) PRIMARY KEY, project_id CHAR(36) NOT NULL, project_revision INT NOT NULL,
 kind ENUM('original','ceiling','reallocate') NOT NULL, allocations JSON NOT NULL, total DECIMAL(15,2) NOT NULL,
 currency CHAR(3) NOT NULL, reason TEXT NOT NULL, actor_id CHAR(36) NOT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 UNIQUE(project_id,project_revision), FOREIGN KEY(project_id) REFERENCES operational_projects(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE project_person_links (
 company_id VARCHAR(40) NOT NULL, party_id CHAR(36) NOT NULL, linked_by CHAR(36) NOT NULL,
 PRIMARY KEY(company_id,party_id), FOREIGN KEY(company_id) REFERENCES companies(id),
 FOREIGN KEY(party_id) REFERENCES business_parties(id), FOREIGN KEY(linked_by) REFERENCES users(id)
);
CREATE TABLE project_documents (
 id CHAR(36) PRIMARY KEY, project_id CHAR(36) NOT NULL, target_id CHAR(36) NULL,
 file_name VARCHAR(160) NOT NULL, mime_type VARCHAR(100) NOT NULL, content LONGBLOB NOT NULL,
 sha256 CHAR(64) NOT NULL, series_id CHAR(36) NOT NULL, version INT NOT NULL,
 actor_id CHAR(36) NOT NULL, created_at TIMESTAMP(6) NOT NULL,
 UNIQUE(project_id,series_id,version), FOREIGN KEY(project_id) REFERENCES operational_projects(id),
 FOREIGN KEY(target_id,project_id) REFERENCES operational_project_records(id,project_id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
