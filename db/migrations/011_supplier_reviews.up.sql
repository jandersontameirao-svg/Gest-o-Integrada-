CREATE TABLE supplier_measurements (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, order_id CHAR(36) NOT NULL, order_revision INT NOT NULL, currency CHAR(3) NOT NULL,
 payload JSON NOT NULL, status ENUM('draft','submitted','approved','billable','rejected','changes_requested','cancelled','reversed') NOT NULL DEFAULT 'draft',
 revision INT NOT NULL DEFAULT 1, UNIQUE(id,company_id), FOREIGN KEY(order_id,company_id) REFERENCES supplier_service_orders(id,company_id)
);
CREATE TABLE supplier_evaluations (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, supplier_id CHAR(36) NOT NULL, project_id CHAR(36) NULL, order_id CHAR(36) NULL,
 origin_key VARCHAR(160) NOT NULL, payload JSON NOT NULL, status ENUM('active','void') NOT NULL DEFAULT 'active', revision INT NOT NULL DEFAULT 1,
 created_by CHAR(36) NOT NULL, UNIQUE(company_id,origin_key), UNIQUE(id,company_id),
 FOREIGN KEY(company_id,supplier_id) REFERENCES supplier_company_drafts(company_id,party_id),
 FOREIGN KEY(project_id) REFERENCES operational_projects(id), FOREIGN KEY(order_id,company_id) REFERENCES supplier_service_orders(id,company_id), FOREIGN KEY(created_by) REFERENCES users(id)
);
CREATE TABLE supplier_review_history (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, entity_type ENUM('measurement','evaluation') NOT NULL,
 entity_id CHAR(36) NOT NULL, revision INT NOT NULL, action VARCHAR(50) NOT NULL, actor_id CHAR(36) NOT NULL,
 reason TEXT NOT NULL, before_data JSON NULL, after_data JSON NOT NULL, recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 UNIQUE(entity_type,entity_id,revision), INDEX(company_id,entity_type,entity_id), FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_review_requests (
 actor_id CHAR(36) NOT NULL, request_id CHAR(36) NOT NULL, company_id VARCHAR(40) NOT NULL, hash CHAR(64) NOT NULL, response JSON NOT NULL,
 PRIMARY KEY(actor_id,request_id), FOREIGN KEY(actor_id) REFERENCES users(id), FOREIGN KEY(company_id) REFERENCES companies(id)
);
