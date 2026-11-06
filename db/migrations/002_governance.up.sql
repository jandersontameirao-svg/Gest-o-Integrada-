CREATE TABLE business_units (id VARCHAR(40) PRIMARY KEY, name VARCHAR(160) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE);
INSERT INTO business_units(id,name) VALUES ('arqueo','Arqueo'),('africa','África'),('vinho','Vinho 24 Horas');
CREATE TABLE organization_scopes (
 id VARCHAR(90) PRIMARY KEY, kind ENUM('holding','unit','company') NOT NULL,
 company_id VARCHAR(40) NULL UNIQUE, unit_id VARCHAR(40) NULL UNIQUE,
 FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(unit_id) REFERENCES business_units(id),
 CHECK ((kind='holding' AND company_id IS NULL AND unit_id IS NULL) OR (kind='unit' AND unit_id IS NOT NULL AND company_id IS NULL) OR (kind='company' AND company_id IS NOT NULL AND unit_id IS NULL))
);
INSERT INTO organization_scopes(id,kind) VALUES ('scope-holding','holding');
CREATE TABLE scope_provenance (
 source_system VARCHAR(50) NOT NULL, source_scope VARCHAR(80) NOT NULL,
 scope_id VARCHAR(90) NOT NULL, PRIMARY KEY(source_system,source_scope),
 FOREIGN KEY(scope_id) REFERENCES organization_scopes(id)
);
INSERT INTO scope_provenance VALUES ('SGE','grupo:0','scope-holding'),('SGE','participacoes:-1','scope-holding');
INSERT INTO organization_scopes(id,kind,unit_id) SELECT CONCAT('scope-unit:',id),'unit',id FROM business_units;
CREATE TABLE company_unit_history (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, unit_id VARCHAR(40) NOT NULL,
 valid_from DATE NOT NULL, valid_to DATE NULL,
 active_company_id VARCHAR(40) GENERATED ALWAYS AS (IF(valid_to IS NULL, company_id, NULL)) STORED UNIQUE,
 FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(unit_id) REFERENCES business_units(id),
 UNIQUE(company_id,valid_from), CHECK(valid_to IS NULL OR valid_to>valid_from),
 INDEX(company_id,valid_from,valid_to), INDEX(unit_id,valid_from)
);
CREATE TABLE company_module_entitlements (
 company_id VARCHAR(40) NOT NULL, module_id ENUM('projects','contracts','suppliers','finance','strategy') NOT NULL,
 enabled BOOLEAN NOT NULL, PRIMARY KEY(company_id,module_id), FOREIGN KEY(company_id) REFERENCES companies(id)
);
CREATE TABLE user_profiles (
 user_id CHAR(36) PRIMARY KEY, profile ENUM('DIRETORES','GERENTES','OPERADORES') NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE scope_grants (
 user_id CHAR(36) NOT NULL, scope_id VARCHAR(90) NOT NULL,
 module_id ENUM('projects','contracts','suppliers','finance','strategy') NOT NULL,
 action VARCHAR(40) NOT NULL, effect ENUM('allow','deny') NOT NULL,
 PRIMARY KEY(user_id,scope_id,module_id,action), FOREIGN KEY(user_id) REFERENCES users(id),
 FOREIGN KEY(scope_id) REFERENCES organization_scopes(id)
);
CREATE TABLE governance_events (
 id CHAR(36) PRIMARY KEY, actor_id CHAR(36) NOT NULL, action VARCHAR(50) NOT NULL,
 scope_id VARCHAR(90) NOT NULL, before_data JSON NULL, after_data JSON NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 FOREIGN KEY(actor_id) REFERENCES users(id), FOREIGN KEY(scope_id) REFERENCES organization_scopes(id)
);
INSERT INTO organization_scopes(id,kind,company_id) SELECT CONCAT('scope-company:',id),'company',id FROM companies;
INSERT INTO company_unit_history(id,company_id,unit_id,valid_from) SELECT UUID(),id,'arqueo',UTC_DATE() FROM companies;
INSERT INTO company_module_entitlements SELECT id,'strategy',TRUE FROM companies;
INSERT INTO company_module_entitlements SELECT id,'projects',id IN ('holding','arqueoproject','arqueogis-arqueologia','arqueogis-geo','arqueocean') FROM companies;
INSERT INTO company_module_entitlements SELECT id,'contracts',id IN ('holding','arqueoproject','arqueogis-arqueologia','arqueogis-geo','arqueocean') FROM companies;
INSERT INTO company_module_entitlements SELECT id,'suppliers',id IN ('holding','arqueoproject','arqueogis-arqueologia','arqueogis-geo','arqueocean') FROM companies;
INSERT INTO company_module_entitlements SELECT id,'finance',id IN ('holding','arqueoproject','arqueogis-arqueologia','arqueogis-geo','arqueocean') FROM companies;
INSERT INTO user_profiles SELECT id,'OPERADORES' FROM users;

