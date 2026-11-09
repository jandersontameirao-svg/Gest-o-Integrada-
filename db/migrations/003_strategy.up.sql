CREATE TABLE strategy_plans (
 id CHAR(36) PRIMARY KEY, scope_id VARCHAR(90) NOT NULL, title VARCHAR(160) NOT NULL,
 start_year INT NOT NULL, end_year INT NOT NULL, version INT NOT NULL DEFAULT 1,
 status ENUM('draft','approved','closed') NOT NULL DEFAULT 'draft', created_by CHAR(36) NOT NULL,
 FOREIGN KEY(scope_id) REFERENCES organization_scopes(id), FOREIGN KEY(created_by) REFERENCES users(id),
 CHECK(start_year BETWEEN 2000 AND 2100 AND end_year>=start_year AND end_year-start_year<=9)
);
CREATE TABLE strategy_cycles (
 id CHAR(36) PRIMARY KEY, plan_id CHAR(36) NOT NULL, kind ENUM('annual','quarterly','monthly') NOT NULL,
 year INT NOT NULL, period INT NOT NULL, closed BOOLEAN NOT NULL DEFAULT FALSE,
 FOREIGN KEY(plan_id) REFERENCES strategy_plans(id), UNIQUE(plan_id,kind,year,period)
);
CREATE TABLE strategy_entries (
 id CHAR(36) PRIMARY KEY, plan_id CHAR(36) NOT NULL, kind ENUM('objective','target','kpi','kpi-value','project','action') NOT NULL,
 parent_id CHAR(36) NULL, payload JSON NOT NULL, revision INT NOT NULL DEFAULT 1,
 FOREIGN KEY(plan_id) REFERENCES strategy_plans(id), FOREIGN KEY(parent_id) REFERENCES strategy_entries(id), INDEX(plan_id,kind)
);
CREATE TABLE strategy_documents (
 plan_id CHAR(36) NOT NULL, cycle_id CHAR(36) NOT NULL,
 kind ENUM('porter','stakeholders','vrio','bsc','okr','swot','pestel') NOT NULL,
 payload JSON NOT NULL, revision INT NOT NULL DEFAULT 1,
 PRIMARY KEY(plan_id,cycle_id,kind), FOREIGN KEY(plan_id) REFERENCES strategy_plans(id), FOREIGN KEY(cycle_id) REFERENCES strategy_cycles(id)
);
CREATE TABLE strategy_history (
 id CHAR(36) PRIMARY KEY, plan_id CHAR(36) NOT NULL, plan_version INT NOT NULL,
 actor_id CHAR(36) NOT NULL, action VARCHAR(50) NOT NULL, entity_id VARCHAR(90) NOT NULL,
 before_data JSON NULL, after_data JSON NULL, created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 FOREIGN KEY(plan_id) REFERENCES strategy_plans(id), FOREIGN KEY(actor_id) REFERENCES users(id), INDEX(plan_id,created_at)
);
CREATE TABLE strategy_approved_versions (
 plan_id CHAR(36) NOT NULL, version INT NOT NULL, snapshot JSON NOT NULL,
 approved_by CHAR(36) NOT NULL, approved_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 PRIMARY KEY(plan_id,version), FOREIGN KEY(plan_id) REFERENCES strategy_plans(id), FOREIGN KEY(approved_by) REFERENCES users(id)
);
