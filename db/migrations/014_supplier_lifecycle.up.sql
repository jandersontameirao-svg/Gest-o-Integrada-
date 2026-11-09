CREATE TABLE supplier_contract_amendments (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, contract_id CHAR(36) NOT NULL, base_contract_revision INT NOT NULL,
 payload JSON NOT NULL, status ENUM('draft','in_review','approved','applied','cancelled') NOT NULL DEFAULT 'draft', revision INT NOT NULL DEFAULT 1, decision JSON NULL,
 UNIQUE(id,company_id), FOREIGN KEY(contract_id,company_id) REFERENCES supplier_contracts(id,company_id)
);
CREATE TABLE supplier_lifecycle_history (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, amendment_id CHAR(36) NOT NULL, revision INT NOT NULL,
 action VARCHAR(40) NOT NULL, actor_id CHAR(36) NOT NULL, reason TEXT NOT NULL, before_data JSON NULL, after_data JSON NOT NULL,
 recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE(amendment_id,revision),
 FOREIGN KEY(amendment_id,company_id) REFERENCES supplier_contract_amendments(id,company_id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_lifecycle_requests (
 actor_id CHAR(36) NOT NULL, request_id CHAR(36) NOT NULL, company_id VARCHAR(40) NOT NULL, hash CHAR(64) NOT NULL, response JSON NOT NULL,
 PRIMARY KEY(actor_id,request_id), FOREIGN KEY(actor_id) REFERENCES users(id), FOREIGN KEY(company_id) REFERENCES companies(id)
);
