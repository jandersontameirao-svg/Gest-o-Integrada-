CREATE TABLE finance_accounts (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,name VARCHAR(160) NOT NULL,kind VARCHAR(40) NOT NULL,currency CHAR(3) NOT NULL,
 opening_balance DECIMAL(15,2) NOT NULL,opening_date DATE NOT NULL,active BOOLEAN NOT NULL DEFAULT TRUE,revision INT NOT NULL DEFAULT 1,
 UNIQUE(id,company_id),UNIQUE(company_id,name,currency),FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE finance_categories (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,name VARCHAR(160) NOT NULL,bucket VARCHAR(20) NOT NULL,nature VARCHAR(30) NOT NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE,revision INT NOT NULL DEFAULT 1,UNIQUE(id,company_id),UNIQUE(company_id,name,bucket),FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE finance_dimensions (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,kind ENUM('cost_center','tag') NOT NULL,name VARCHAR(160) NOT NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE,revision INT NOT NULL DEFAULT 1,UNIQUE(id,company_id),UNIQUE(company_id,kind,name),FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE finance_titles (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,payload JSON NOT NULL,status ENUM('draft','approved','cancelled') NOT NULL DEFAULT 'draft',
 revision INT NOT NULL DEFAULT 1,series_id CHAR(36) NULL,origin_key VARCHAR(180) NULL,
 UNIQUE(id,company_id),UNIQUE(company_id,origin_key),FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE finance_settlements (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,title_id CHAR(36) NOT NULL,account_id CHAR(36) NOT NULL,
 amount DECIMAL(15,2) NOT NULL,payment_date DATE NOT NULL,method VARCHAR(80) NOT NULL,notes TEXT NOT NULL,reversed BOOLEAN NOT NULL DEFAULT FALSE,
 UNIQUE(id,company_id),FOREIGN KEY(title_id,company_id) REFERENCES finance_titles(id,company_id),FOREIGN KEY(account_id,company_id) REFERENCES finance_accounts(id,company_id),CHECK(amount>0)
);
CREATE TABLE finance_transfers (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,from_id CHAR(36) NOT NULL,to_id CHAR(36) NOT NULL,
 amount DECIMAL(15,2) NOT NULL,effective_date DATE NOT NULL,description VARCHAR(255) NOT NULL,reversed BOOLEAN NOT NULL DEFAULT FALSE,
 UNIQUE(id,company_id),FOREIGN KEY(from_id,company_id) REFERENCES finance_accounts(id,company_id),FOREIGN KEY(to_id,company_id) REFERENCES finance_accounts(id,company_id),CHECK(amount>0),CHECK(from_id<>to_id)
);
CREATE TABLE finance_cash_movements (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,account_id CHAR(36) NOT NULL,effective_date DATE NOT NULL,
 amount DECIMAL(15,2) NOT NULL,source_type VARCHAR(30) NOT NULL,source_id CHAR(36) NOT NULL,
 UNIQUE(company_id,source_type,source_id,account_id),FOREIGN KEY(account_id,company_id) REFERENCES finance_accounts(id,company_id)
);
CREATE TABLE finance_periods (
 company_id VARCHAR(40) NOT NULL,period CHAR(7) NOT NULL,status ENUM('open','closed') NOT NULL,revision INT NOT NULL,
 PRIMARY KEY(company_id,period),FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE finance_history (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,entity_type VARCHAR(40) NOT NULL,entity_id CHAR(36) NOT NULL,revision INT NOT NULL,
 action VARCHAR(60) NOT NULL,actor_id CHAR(36) NOT NULL,reason TEXT NOT NULL,before_data JSON NULL,after_data JSON NOT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),UNIQUE(entity_type,entity_id,revision),FOREIGN KEY(actor_id) REFERENCES users(id),FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE finance_requests (
 actor_id CHAR(36) NOT NULL,request_id CHAR(36) NOT NULL,company_id VARCHAR(40) NOT NULL,hash CHAR(64) NOT NULL,response JSON NOT NULL,
 PRIMARY KEY(actor_id,request_id),FOREIGN KEY(actor_id) REFERENCES users(id),FOREIGN KEY(company_id) REFERENCES companies(id)
);
