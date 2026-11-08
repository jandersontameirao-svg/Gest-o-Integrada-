CREATE TABLE finance_receipt_templates (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,series_id CHAR(36) NOT NULL,version INT NOT NULL,revision INT NOT NULL DEFAULT 1,
 status ENUM('active','superseded','archived') NOT NULL DEFAULT 'active',payload JSON NOT NULL,
 UNIQUE(id,company_id),UNIQUE(series_id,version),FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE finance_receipts (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,title_id CHAR(36) NOT NULL,template_id CHAR(36) NOT NULL,series_id CHAR(36) NOT NULL,
 version INT NOT NULL,revision INT NOT NULL DEFAULT 1,kind ENUM('income','expense','offset') NOT NULL,status ENUM('issued','superseded','cancelled') NOT NULL DEFAULT 'issued',
 snapshot JSON NOT NULL,pdf MEDIUMBLOB NOT NULL,sha256 CHAR(64) NOT NULL,issued_by CHAR(36) NOT NULL,
 UNIQUE(id,company_id),UNIQUE(series_id,version),FOREIGN KEY(title_id,company_id) REFERENCES finance_titles(id,company_id),
 FOREIGN KEY(template_id,company_id) REFERENCES finance_receipt_templates(id,company_id),FOREIGN KEY(issued_by) REFERENCES users(id)
);
CREATE TABLE finance_receipt_coverage (
 company_id VARCHAR(40) NOT NULL,settlement_id CHAR(36) NOT NULL,receipt_series_id CHAR(36) NOT NULL,
 PRIMARY KEY(company_id,settlement_id),FOREIGN KEY(settlement_id,company_id) REFERENCES finance_settlements(id,company_id)
);
ALTER TABLE finance_private_files ADD COLUMN status ENUM('active','archived') NOT NULL DEFAULT 'active',ADD COLUMN revision INT NOT NULL DEFAULT 1;
