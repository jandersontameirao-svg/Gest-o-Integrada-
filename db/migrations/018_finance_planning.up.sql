CREATE TABLE finance_budgets (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,name VARCHAR(160) NOT NULL,currency CHAR(3) NOT NULL,
 year SMALLINT NOT NULL,status ENUM('draft','approved','superseded') NOT NULL DEFAULT 'draft',revision INT NOT NULL DEFAULT 1,
 version INT NOT NULL,series_id CHAR(36) NOT NULL,payload JSON NOT NULL,
 UNIQUE(id,company_id),UNIQUE(series_id,version),FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE finance_private_files (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,title_id CHAR(36) NOT NULL,
 series_id CHAR(36) NOT NULL,version INT NOT NULL,file_name VARCHAR(160) NOT NULL,mime_type VARCHAR(100) NOT NULL,
 content MEDIUMBLOB NOT NULL,size INT NOT NULL,sha256 CHAR(64) NOT NULL,created_by CHAR(36) NOT NULL,
 UNIQUE(series_id,version),FOREIGN KEY(title_id,company_id) REFERENCES finance_titles(id,company_id),FOREIGN KEY(created_by) REFERENCES users(id)
);
