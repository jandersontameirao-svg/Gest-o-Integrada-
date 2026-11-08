ALTER TABLE finance_settlements ADD COLUMN reversed_on DATE NULL;
CREATE TABLE finance_bank_groups (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,payload JSON NOT NULL,status ENUM('active','cancelled') NOT NULL DEFAULT 'active',revision INT NOT NULL DEFAULT 1,
 UNIQUE(id,company_id),FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE finance_bank_group_entries (
 company_id VARCHAR(40) NOT NULL,entry_id CHAR(36) NOT NULL,group_id CHAR(36) NOT NULL,PRIMARY KEY(company_id,entry_id),
 FOREIGN KEY(entry_id,company_id) REFERENCES finance_bank_entries(id,company_id),FOREIGN KEY(group_id,company_id) REFERENCES finance_bank_groups(id,company_id)
);
CREATE TABLE finance_bank_group_movements (
 company_id VARCHAR(40) NOT NULL,movement_id CHAR(36) NOT NULL,group_id CHAR(36) NOT NULL,PRIMARY KEY(company_id,movement_id),
 FOREIGN KEY(group_id,company_id) REFERENCES finance_bank_groups(id,company_id),FOREIGN KEY(movement_id) REFERENCES finance_cash_movements(id)
);
CREATE TABLE finance_allocations (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,title_id CHAR(36) NOT NULL,revision INT NOT NULL DEFAULT 1,payload JSON NOT NULL,
 UNIQUE(company_id,title_id),FOREIGN KEY(title_id,company_id) REFERENCES finance_titles(id,company_id)
);
CREATE TABLE finance_fx_quotes (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,payload JSON NOT NULL,
 UNIQUE(id,company_id),FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE finance_intercompany (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,target_company_id VARCHAR(40) NOT NULL,payload JSON NOT NULL,status ENUM('posted','reversed') NOT NULL DEFAULT 'posted',revision INT NOT NULL DEFAULT 1,
 FOREIGN KEY(company_id) REFERENCES companies(id),FOREIGN KEY(target_company_id) REFERENCES companies(id),CHECK(company_id<>target_company_id)
);
CREATE TABLE finance_recovery_snapshots (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,sha256 CHAR(64) NOT NULL,payload MEDIUMBLOB NOT NULL,created_by CHAR(36) NOT NULL,created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 FOREIGN KEY(company_id) REFERENCES companies(id),FOREIGN KEY(created_by) REFERENCES users(id)
);
CREATE TABLE finance_history_loads (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,namespace VARCHAR(30) NOT NULL,sha256 CHAR(64) NOT NULL,payload JSON NOT NULL,
 UNIQUE(company_id,namespace,sha256),FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE finance_history_origins (
 company_id VARCHAR(40) NOT NULL,namespace VARCHAR(30) NOT NULL,kind ENUM('title','settlement') NOT NULL,external_id VARCHAR(120) NOT NULL,entity_id CHAR(36) NOT NULL,
 PRIMARY KEY(company_id,namespace,kind,external_id),FOREIGN KEY(company_id) REFERENCES companies(id)
);
ALTER TABLE companies ADD COLUMN legal_name VARCHAR(200) NULL,ADD COLUMN legal_tax_id VARCHAR(80) NULL,ADD COLUMN legal_city VARCHAR(120) NULL,ADD COLUMN legal_state VARCHAR(80) NULL,ADD COLUMN legal_country CHAR(2) NULL,ADD COLUMN legal_revision INT NOT NULL DEFAULT 0;
