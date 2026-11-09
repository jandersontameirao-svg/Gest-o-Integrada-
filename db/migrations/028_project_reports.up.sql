CREATE TABLE project_report_snapshots (
 id CHAR(36) PRIMARY KEY,
 company_id VARCHAR(40) NOT NULL,
 actor_id CHAR(36) NOT NULL,
 report_type VARCHAR(40) NOT NULL,
 payload JSON NOT NULL,
 sha256 CHAR(64) NOT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 FOREIGN KEY (company_id) REFERENCES companies(id),
 FOREIGN KEY (actor_id) REFERENCES users(id),
 INDEX project_reports_company (company_id,created_at)
);
