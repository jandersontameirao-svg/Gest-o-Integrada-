CREATE TABLE supplier_legal_sources (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, sha256 CHAR(64) NOT NULL, file_name VARCHAR(160) NOT NULL,
 content LONGBLOB NOT NULL, metadata JSON NOT NULL, created_by CHAR(36) NOT NULL, created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 UNIQUE(company_id,sha256), FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(created_by) REFERENCES users(id)
);
CREATE TABLE supplier_legal_template_versions (
 template_id CHAR(36) NOT NULL, revision INT NOT NULL, company_id VARCHAR(40) NOT NULL, body MEDIUMTEXT NOT NULL, sha256 CHAR(64) NOT NULL,
 source JSON NULL, actor_id CHAR(36) NOT NULL, created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 PRIMARY KEY(template_id,revision), FOREIGN KEY(template_id,company_id) REFERENCES supplier_template_drafts(id,company_id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_legal_document_versions (
 document_id CHAR(36) NOT NULL, revision INT NOT NULL, company_id VARCHAR(40) NOT NULL, body MEDIUMTEXT NOT NULL, sha256 CHAR(64) NOT NULL,
 bindings JSON NOT NULL, provenance JSON NOT NULL, actor_id CHAR(36) NOT NULL, created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 PRIMARY KEY(document_id,revision), FOREIGN KEY(document_id,company_id) REFERENCES supplier_document_drafts(id,company_id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_legal_history (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, entity_type VARCHAR(20) NOT NULL, entity_id CHAR(36) NOT NULL,
 revision INT NOT NULL, action VARCHAR(50) NOT NULL, actor_id CHAR(36) NOT NULL, reason TEXT NOT NULL, metadata JSON NOT NULL,
 recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_legal_requests (
 actor_id CHAR(36) NOT NULL, request_id CHAR(36) NOT NULL, company_id VARCHAR(40) NOT NULL, hash CHAR(64) NOT NULL, response JSON NOT NULL,
 PRIMARY KEY(actor_id,request_id), FOREIGN KEY(actor_id) REFERENCES users(id), FOREIGN KEY(company_id) REFERENCES companies(id)
);
