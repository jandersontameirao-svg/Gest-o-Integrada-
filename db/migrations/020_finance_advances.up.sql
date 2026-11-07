CREATE TABLE finance_advances (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,payload JSON NOT NULL,
 status ENUM('requested','approved','correction','submitted','reviewed','closed','cancelled') NOT NULL DEFAULT 'requested',
 revision INT NOT NULL DEFAULT 1,report_version INT NOT NULL DEFAULT 1,funding_title_id CHAR(36) NULL,return_title_id CHAR(36) NULL,
 UNIQUE(id,company_id),UNIQUE(funding_title_id),UNIQUE(return_title_id),FOREIGN KEY(company_id) REFERENCES companies(id),
 FOREIGN KEY(funding_title_id,company_id) REFERENCES finance_titles(id,company_id),FOREIGN KEY(return_title_id,company_id) REFERENCES finance_titles(id,company_id)
);
CREATE TABLE finance_advance_origins (
 company_id VARCHAR(40) NOT NULL,external_ref VARCHAR(120) NOT NULL,advance_id CHAR(36) NOT NULL,expense_id CHAR(36) NOT NULL,
 PRIMARY KEY(company_id,external_ref),UNIQUE(expense_id),FOREIGN KEY(advance_id,company_id) REFERENCES finance_advances(id,company_id)
);
CREATE TABLE finance_advance_files (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,advance_id CHAR(36) NOT NULL,series_id CHAR(36) NOT NULL,version INT NOT NULL,
 file_name VARCHAR(160) NOT NULL,mime_type VARCHAR(100) NOT NULL,content MEDIUMBLOB NOT NULL,size INT NOT NULL,sha256 CHAR(64) NOT NULL,created_by CHAR(36) NOT NULL,
 UNIQUE(series_id,version),FOREIGN KEY(advance_id,company_id) REFERENCES finance_advances(id,company_id),FOREIGN KEY(created_by) REFERENCES users(id)
);
ALTER TABLE finance_settlements ADD COLUMN settlement_kind ENUM('cash','advance_offset') NOT NULL DEFAULT 'cash',
 ADD COLUMN advance_id CHAR(36) NULL,ADD COLUMN funding_settlement_id CHAR(36) NULL,
 ADD CONSTRAINT fk_finance_settlement_funding FOREIGN KEY(funding_settlement_id,company_id) REFERENCES finance_settlements(id,company_id),
 ADD CONSTRAINT ck_finance_settlement_origin CHECK ((settlement_kind='cash' AND advance_id IS NULL AND funding_settlement_id IS NULL) OR (settlement_kind='advance_offset' AND advance_id IS NOT NULL AND funding_settlement_id IS NOT NULL)),
 ADD CONSTRAINT fk_finance_settlement_advance FOREIGN KEY(advance_id,company_id) REFERENCES finance_advances(id,company_id);
