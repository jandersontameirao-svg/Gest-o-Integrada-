CREATE TABLE strategy_objective_links (
 child_id CHAR(36) NOT NULL, parent_id CHAR(36) NOT NULL,
 valid_from DATE NOT NULL, valid_to DATE NOT NULL, revision INT NOT NULL DEFAULT 1, created_by CHAR(36) NOT NULL,
 PRIMARY KEY(child_id,valid_from), FOREIGN KEY(child_id) REFERENCES strategy_entries(id),
 FOREIGN KEY(parent_id) REFERENCES strategy_entries(id), FOREIGN KEY(created_by) REFERENCES users(id),
 CHECK(valid_to>=valid_from), INDEX(parent_id)
);
CREATE TABLE strategy_metrics (
 id CHAR(36) PRIMARY KEY, name VARCHAR(160) NOT NULL,
 unit VARCHAR(50) NOT NULL, additive BOOLEAN NOT NULL, created_by CHAR(36) NOT NULL,
 FOREIGN KEY(created_by) REFERENCES users(id)
);
CREATE TABLE strategy_facts (
 source_id CHAR(36) PRIMARY KEY, plan_id CHAR(36) NOT NULL, scope_id VARCHAR(90) NOT NULL,
 metric_id CHAR(36) NOT NULL, measure ENUM('target','kpi-value') NOT NULL,
 period_start DATE NOT NULL, period_end DATE NOT NULL, currency CHAR(3) NOT NULL,
 origin_unit_id VARCHAR(40) NULL, source_revision INT NOT NULL, plan_version INT NOT NULL,
 target_value DECIMAL(28,6) NULL, actual_value DECIMAL(28,6) NULL,
 published_by CHAR(36) NOT NULL, published_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 FOREIGN KEY(source_id) REFERENCES strategy_entries(id), FOREIGN KEY(plan_id) REFERENCES strategy_plans(id),
 FOREIGN KEY(scope_id) REFERENCES organization_scopes(id), FOREIGN KEY(metric_id) REFERENCES strategy_metrics(id),
 FOREIGN KEY(origin_unit_id) REFERENCES business_units(id), FOREIGN KEY(published_by) REFERENCES users(id),
 UNIQUE(scope_id,metric_id,measure,period_start,period_end,currency)
);
ALTER TABLE strategy_documents MODIFY kind ENUM('porter','stakeholders','vrio','bsc','okr','swot','pestel','tows') NOT NULL;
