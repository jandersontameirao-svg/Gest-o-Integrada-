CREATE TABLE finance_scenarios (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,name VARCHAR(160) NOT NULL,payload JSON NOT NULL,revision INT NOT NULL DEFAULT 1,
 FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE finance_preferences (
 user_id CHAR(36) NOT NULL,company_id VARCHAR(40) NOT NULL,revision INT NOT NULL DEFAULT 1,payload JSON NOT NULL,
 PRIMARY KEY(user_id,company_id),FOREIGN KEY(user_id) REFERENCES users(id),FOREIGN KEY(company_id) REFERENCES companies(id)
);
