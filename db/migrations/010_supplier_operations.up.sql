CREATE TABLE supplier_contracts (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, supplier_id CHAR(36) NOT NULL,
 document_id CHAR(36) NOT NULL UNIQUE, payload JSON NOT NULL,
 status ENUM('draft','approved','active','terminated') NOT NULL DEFAULT 'draft', revision INT NOT NULL DEFAULT 1,
 UNIQUE(id,company_id), UNIQUE(company_id,document_id),
 FOREIGN KEY(company_id,supplier_id) REFERENCES supplier_company_drafts(company_id,party_id),
 FOREIGN KEY(document_id,company_id) REFERENCES supplier_document_drafts(id,company_id)
);
CREATE TABLE supplier_service_orders (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, contract_id CHAR(36) NOT NULL,
 project_id CHAR(36) NOT NULL, task_id CHAR(36) NOT NULL, professional_id CHAR(36) NOT NULL,
 origin_key VARCHAR(160) NOT NULL, payload JSON NOT NULL,
 status ENUM('reserved','issued','mobilized','demobilization_pending','validated','cancelled') NOT NULL DEFAULT 'reserved',
 revision INT NOT NULL DEFAULT 1, UNIQUE(company_id,origin_key), UNIQUE(id,company_id),
 FOREIGN KEY(contract_id,company_id) REFERENCES supplier_contracts(id,company_id),
 FOREIGN KEY(project_id) REFERENCES operational_projects(id), FOREIGN KEY(task_id,project_id) REFERENCES operational_project_records(id,project_id),
 FOREIGN KEY(professional_id) REFERENCES business_parties(id)
);
CREATE TABLE supplier_operation_history (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL,
 entity_type ENUM('contract','order','period') NOT NULL, entity_id CHAR(36) NOT NULL, revision INT NOT NULL,
 action VARCHAR(60) NOT NULL, actor_id CHAR(36) NOT NULL, reason TEXT NOT NULL,
 effective_date DATE NOT NULL, before_data JSON NULL, after_data JSON NOT NULL,
 recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 UNIQUE(entity_type,entity_id,revision), INDEX(company_id,entity_type,entity_id),
 FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_operational_periods (
 company_id VARCHAR(40) NOT NULL, period CHAR(7) NOT NULL, id CHAR(36) NOT NULL UNIQUE,
 status ENUM('closed','open') NOT NULL, revision INT NOT NULL,
 PRIMARY KEY(company_id,period), FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE supplier_daily_approvals (
 company_id VARCHAR(40) NOT NULL, contract_id CHAR(36) NOT NULL, professional_id CHAR(36) NOT NULL,
 service_date DATE NOT NULL, order_id CHAR(36) NOT NULL,
 PRIMARY KEY(company_id,contract_id,professional_id,service_date),
 FOREIGN KEY(order_id,company_id) REFERENCES supplier_service_orders(id,company_id),
 FOREIGN KEY(contract_id,company_id) REFERENCES supplier_contracts(id,company_id), FOREIGN KEY(professional_id) REFERENCES business_parties(id)
);
