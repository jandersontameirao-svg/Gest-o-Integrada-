ALTER TABLE client_contract_records MODIFY kind ENUM('amendment','milestone','obligation','measurement','item','item_change','risk','occurrence','participant') NOT NULL;
ALTER TABLE client_contract_documents ADD COLUMN mime_type VARCHAR(100) NOT NULL DEFAULT 'text/plain';
CREATE TABLE contract_balance_snapshots (
 contract_id CHAR(36) NOT NULL, revision INT NOT NULL, valuation_date DATE NOT NULL,
 snapshot JSON NOT NULL, created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 PRIMARY KEY(contract_id,revision), FOREIGN KEY(contract_id) REFERENCES client_contracts(id)
);
CREATE TABLE contract_alert_settings (
 contract_id CHAR(36) PRIMARY KEY, lead_days INT NOT NULL, FOREIGN KEY(contract_id) REFERENCES client_contracts(id)
);
CREATE TABLE contract_number_sequences (
 company_id VARCHAR(40) NOT NULL, year INT NOT NULL, document_type VARCHAR(30) NOT NULL,
 prefix VARCHAR(40) NOT NULL, next_number BIGINT UNSIGNED NOT NULL DEFAULT 1,
 PRIMARY KEY(company_id,year,document_type), FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE contract_number_allocations (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, year INT NOT NULL,
 document_type VARCHAR(30) NOT NULL, sequence_number BIGINT UNSIGNED NOT NULL,
 reference VARCHAR(160) NOT NULL, contract_id CHAR(36) NOT NULL, entity_id CHAR(36) NOT NULL,
 UNIQUE(company_id,year,document_type,sequence_number), UNIQUE(company_id,reference), UNIQUE(company_id,document_type,entity_id),
 FOREIGN KEY(contract_id) REFERENCES client_contracts(id), FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE contract_document_downloads (
 id CHAR(36) PRIMARY KEY, document_id CHAR(36) NOT NULL, actor_id CHAR(36) NOT NULL,
 downloaded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 FOREIGN KEY(document_id) REFERENCES client_contract_documents(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
