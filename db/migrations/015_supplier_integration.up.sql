CREATE TABLE supplier_order_changes (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, order_id CHAR(36) NOT NULL,
 base_order_revision INT NOT NULL, base_contract_revision INT NOT NULL, base_budget_id CHAR(36) NOT NULL,
 payload JSON NOT NULL, status ENUM('draft','in_review','approved','applied','cancelled') NOT NULL DEFAULT 'draft', revision INT NOT NULL DEFAULT 1, decision JSON NULL,
 UNIQUE(id,company_id), FOREIGN KEY(order_id,company_id) REFERENCES supplier_service_orders(id,company_id)
);
CREATE TABLE supplier_order_change_history (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, change_id CHAR(36) NOT NULL, revision INT NOT NULL,
 action VARCHAR(40) NOT NULL, actor_id CHAR(36) NOT NULL, reason TEXT NOT NULL, before_data JSON NULL, after_data JSON NOT NULL,
 recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE(change_id,revision),
 FOREIGN KEY(change_id,company_id) REFERENCES supplier_order_changes(id,company_id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE supplier_integration_requests (
 actor_id CHAR(36) NOT NULL, request_id CHAR(36) NOT NULL, company_id VARCHAR(40) NOT NULL, hash CHAR(64) NOT NULL, response JSON NOT NULL,
 PRIMARY KEY(actor_id,request_id), FOREIGN KEY(actor_id) REFERENCES users(id), FOREIGN KEY(company_id) REFERENCES companies(id)
);
