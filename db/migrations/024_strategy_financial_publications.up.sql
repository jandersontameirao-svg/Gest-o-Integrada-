CREATE TABLE strategy_financial_publications (
 id CHAR(36) PRIMARY KEY,company_id VARCHAR(40) NOT NULL,plan_id CHAR(36) NOT NULL,kpi_id CHAR(36) NOT NULL,metric_id CHAR(36) NOT NULL,
 metric_key VARCHAR(40) NOT NULL,period_start DATE NOT NULL,period_end DATE NOT NULL,currency CHAR(3) NOT NULL,origin_unit_id VARCHAR(40) NOT NULL,
 revision INT NOT NULL DEFAULT 1,latest_version INT NOT NULL DEFAULT 1,approved_version INT NULL,
 UNIQUE(company_id,metric_key,period_start,currency),UNIQUE(company_id,metric_id,period_start,currency),UNIQUE(kpi_id,period_start,currency),
 FOREIGN KEY(company_id) REFERENCES companies(id),FOREIGN KEY(plan_id) REFERENCES strategy_plans(id),FOREIGN KEY(kpi_id) REFERENCES strategy_entries(id),FOREIGN KEY(metric_id) REFERENCES strategy_metrics(id),FOREIGN KEY(origin_unit_id) REFERENCES business_units(id)
);
CREATE TABLE strategy_financial_versions (
 publication_id CHAR(36) NOT NULL,version INT NOT NULL,snapshot JSON NOT NULL,sha256 CHAR(64) NOT NULL,
 status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',prepared_by CHAR(36) NOT NULL,prepared_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 decided_by CHAR(36) NULL,decided_at TIMESTAMP(6) NULL,decision_reason TEXT NULL,decision_evidence TEXT NULL,
 PRIMARY KEY(publication_id,version),FOREIGN KEY(publication_id) REFERENCES strategy_financial_publications(id),FOREIGN KEY(prepared_by) REFERENCES users(id),FOREIGN KEY(decided_by) REFERENCES users(id)
);
CREATE TABLE strategy_financial_requests (
 actor_id CHAR(36) NOT NULL,request_id CHAR(36) NOT NULL,company_id VARCHAR(40) NOT NULL,hash CHAR(64) NOT NULL,response JSON NOT NULL,
 PRIMARY KEY(actor_id,request_id),FOREIGN KEY(actor_id) REFERENCES users(id),FOREIGN KEY(company_id) REFERENCES companies(id)
);
