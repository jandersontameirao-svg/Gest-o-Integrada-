CREATE TABLE supplier_private_files (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, supplier_id CHAR(36) NOT NULL,
 owner_kind ENUM('supplier','contract','order','measurement') NOT NULL, owner_id CHAR(36) NOT NULL, project_id CHAR(36) NULL,
 series_id CHAR(36) NOT NULL, version INT NOT NULL, file_name VARCHAR(160) NOT NULL, mime_type VARCHAR(100) NOT NULL,
 content LONGBLOB NOT NULL, size INT NOT NULL, sha256 CHAR(64) NOT NULL, metadata JSON NOT NULL,
 status ENUM('pending','accepted','rejected','archived') NOT NULL DEFAULT 'pending', revision INT NOT NULL DEFAULT 1,
 created_by CHAR(36) NOT NULL, created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 UNIQUE(company_id,series_id,version), UNIQUE(id,company_id),
 FOREIGN KEY(company_id,supplier_id) REFERENCES supplier_company_drafts(company_id,party_id), FOREIGN KEY(project_id) REFERENCES operational_projects(id), FOREIGN KEY(created_by) REFERENCES users(id)
);
CREATE TABLE supplier_file_rules (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, rule_key VARCHAR(80) NOT NULL, payload JSON NOT NULL, revision INT NOT NULL,
 UNIQUE(company_id,rule_key), UNIQUE(id,company_id), FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE supplier_file_rule_versions (
 rule_id CHAR(36) NOT NULL, revision INT NOT NULL, effective_from DATE NOT NULL, payload JSON NOT NULL, actor_id CHAR(36) NOT NULL,
 recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY(rule_id,revision), FOREIGN KEY(rule_id) REFERENCES supplier_file_rules(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_file_history (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, entity_type ENUM('file','rule') NOT NULL, entity_id CHAR(36) NOT NULL,
 revision INT NOT NULL, action VARCHAR(50) NOT NULL, actor_id CHAR(36) NOT NULL, reason TEXT NOT NULL, before_data JSON NULL, after_data JSON NOT NULL,
 recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE(entity_type,entity_id,revision), FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_file_downloads (
 id CHAR(36) PRIMARY KEY, document_id CHAR(36) NOT NULL, actor_id CHAR(36) NOT NULL,
 recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), FOREIGN KEY(document_id) REFERENCES supplier_private_files(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_file_requests (
 actor_id CHAR(36) NOT NULL, request_id CHAR(36) NOT NULL, company_id VARCHAR(40) NOT NULL, hash CHAR(64) NOT NULL, response JSON NOT NULL,
 PRIMARY KEY(actor_id,request_id), FOREIGN KEY(actor_id) REFERENCES users(id), FOREIGN KEY(company_id) REFERENCES companies(id)
);
