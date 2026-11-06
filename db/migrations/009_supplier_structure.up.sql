CREATE TABLE supplier_company_drafts (
 company_id VARCHAR(40) NOT NULL, party_id CHAR(36) NOT NULL, details JSON NOT NULL,
 revision INT NOT NULL DEFAULT 1, status ENUM('draft') NOT NULL DEFAULT 'draft',
 PRIMARY KEY(company_id,party_id), FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(party_id) REFERENCES business_parties(id)
);
CREATE TABLE supplier_template_drafts (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL,
 family ENUM('contract','service_order','measurement','amendment','indicators') NOT NULL,
 payload JSON NOT NULL, revision INT NOT NULL, status ENUM('draft','in_review') NOT NULL,
 UNIQUE(id,company_id), FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE supplier_template_revisions (
 template_id CHAR(36) NOT NULL, revision INT NOT NULL, payload JSON NOT NULL,
 status ENUM('draft','in_review') NOT NULL, actor_id CHAR(36) NOT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 PRIMARY KEY(template_id,revision), FOREIGN KEY(template_id) REFERENCES supplier_template_drafts(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_document_drafts (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, supplier_id CHAR(36) NOT NULL,
 family ENUM('contract','service_order','measurement','amendment','indicators') NOT NULL,
 template_id CHAR(36) NOT NULL, template_revision INT NOT NULL, parent_id CHAR(36) NULL,
 project_id CHAR(36) NULL, task_id CHAR(36) NULL, payload JSON NOT NULL,
 revision INT NOT NULL, status ENUM('draft','in_review') NOT NULL,
 UNIQUE(id,company_id),
 FOREIGN KEY(company_id,supplier_id) REFERENCES supplier_company_drafts(company_id,party_id),
 FOREIGN KEY(template_id,company_id) REFERENCES supplier_template_drafts(id,company_id),
 FOREIGN KEY(template_id,template_revision) REFERENCES supplier_template_revisions(template_id,revision),
 FOREIGN KEY(parent_id,company_id) REFERENCES supplier_document_drafts(id,company_id),
 FOREIGN KEY(project_id) REFERENCES operational_projects(id),
 FOREIGN KEY(task_id,project_id) REFERENCES operational_project_records(id,project_id)
);
CREATE TABLE supplier_document_revisions (
 document_id CHAR(36) NOT NULL, revision INT NOT NULL, payload JSON NOT NULL,
 status ENUM('draft','in_review') NOT NULL, actor_id CHAR(36) NOT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 PRIMARY KEY(document_id,revision), FOREIGN KEY(document_id) REFERENCES supplier_document_drafts(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_structure_history (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, entity_type ENUM('supplier','template','document') NOT NULL,
 entity_id CHAR(36) NOT NULL, revision INT NOT NULL, actor_id CHAR(36) NOT NULL,
 action VARCHAR(80) NOT NULL, before_data JSON NULL, after_data JSON NOT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 INDEX(company_id,entity_type,entity_id), FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_structure_requests (
 actor_id CHAR(36) NOT NULL, request_id CHAR(36) NOT NULL, company_id VARCHAR(40) NOT NULL,
 hash CHAR(64) NOT NULL, response JSON NOT NULL, PRIMARY KEY(actor_id,request_id),
 FOREIGN KEY(actor_id) REFERENCES users(id), FOREIGN KEY(company_id) REFERENCES companies(id)
);
