CREATE TABLE finance_import_batches (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,kind ENUM('titles','ofx') NOT NULL,namespace VARCHAR(30) NOT NULL,
 sha256 CHAR(64) NOT NULL,row_count INT NOT NULL,total_income DECIMAL(15,2) NOT NULL,total_expense DECIMAL(15,2) NOT NULL,
 payload JSON NOT NULL,created_by CHAR(36) NOT NULL,
 UNIQUE(id,company_id),UNIQUE(company_id,kind,namespace,sha256),FOREIGN KEY(company_id) REFERENCES companies(id),FOREIGN KEY(created_by) REFERENCES users(id)
);
CREATE TABLE finance_bank_entries (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,account_id CHAR(36) NOT NULL,batch_id CHAR(36) NOT NULL,
 fit_id VARCHAR(160) NOT NULL,effective_date DATE NOT NULL,amount DECIMAL(15,2) NOT NULL,description VARCHAR(255) NOT NULL,
 settlement_id CHAR(36) NULL,revision INT NOT NULL DEFAULT 1,
 UNIQUE(id,company_id),UNIQUE(account_id,fit_id),UNIQUE(settlement_id),FOREIGN KEY(account_id,company_id) REFERENCES finance_accounts(id,company_id),
 FOREIGN KEY(batch_id,company_id) REFERENCES finance_import_batches(id,company_id),FOREIGN KEY(settlement_id,company_id) REFERENCES finance_settlements(id,company_id)
);
