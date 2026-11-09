CREATE TABLE project_template_catalog (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL,
 version INT NOT NULL, revision INT NOT NULL,
 status ENUM('draft','approved','archived') NOT NULL,
 origin_key VARCHAR(160) NULL,
 UNIQUE(company_id,origin_key), FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE project_template_versions (
 template_id CHAR(36) NOT NULL, version INT NOT NULL, payload JSON NOT NULL,
 sha256 CHAR(64) NOT NULL, provenance JSON NOT NULL, actor_id CHAR(36) NOT NULL,
 reason TEXT NOT NULL, created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 PRIMARY KEY(template_id,version), FOREIGN KEY(template_id) REFERENCES project_template_catalog(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE project_template_history (
 id CHAR(36) PRIMARY KEY, template_id CHAR(36) NOT NULL, version INT NOT NULL,
 revision INT NOT NULL, action VARCHAR(60) NOT NULL, actor_id CHAR(36) NOT NULL,
 reason TEXT NOT NULL, created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 FOREIGN KEY(template_id,version) REFERENCES project_template_versions(template_id,version), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE project_template_applications (
 id CHAR(36) PRIMARY KEY, project_id CHAR(36) NOT NULL, template_id CHAR(36) NOT NULL,
 template_version INT NOT NULL, template_revision INT NOT NULL, project_revision INT NOT NULL,
 preview_sha256 CHAR(64) NOT NULL, template_sha256 CHAR(64) NOT NULL,
 calendar_revision INT NOT NULL, options JSON NOT NULL, record_map JSON NOT NULL,
 actor_id CHAR(36) NOT NULL, reason TEXT NOT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 UNIQUE(project_id,template_id), FOREIGN KEY(project_id) REFERENCES operational_projects(id),
 FOREIGN KEY(template_id,template_version) REFERENCES project_template_versions(template_id,version), FOREIGN KEY(actor_id) REFERENCES users(id)
);
