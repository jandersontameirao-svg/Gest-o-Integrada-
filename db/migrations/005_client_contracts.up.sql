CREATE TABLE business_parties (
 id CHAR(36) PRIMARY KEY, tax_id VARCHAR(14) NOT NULL UNIQUE, name VARCHAR(255) NOT NULL,
 kind ENUM('organization','individual') NOT NULL, created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);
CREATE TABLE customer_parties (
 company_id VARCHAR(40) NOT NULL, party_id CHAR(36) NOT NULL, contact JSON NOT NULL,
 PRIMARY KEY(company_id,party_id), FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(party_id) REFERENCES business_parties(id)
);
CREATE TABLE client_contracts (
 id CHAR(36) PRIMARY KEY, company_id VARCHAR(40) NOT NULL, party_id CHAR(36) NOT NULL,
 reference VARCHAR(80) NOT NULL, payload JSON NOT NULL, revision INT NOT NULL DEFAULT 1,
 signed_date DATE NULL, prospective_project_id CHAR(36) NULL UNIQUE,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 UNIQUE(company_id,reference), FOREIGN KEY(company_id,party_id) REFERENCES customer_parties(company_id,party_id), INDEX(company_id,updated_at)
);
CREATE TABLE client_contract_records (
 id CHAR(36) PRIMARY KEY, contract_id CHAR(36) NOT NULL,
 kind ENUM('amendment','milestone','obligation','measurement') NOT NULL, seq INT NOT NULL,
 payload JSON NOT NULL, revision INT NOT NULL DEFAULT 1,
 UNIQUE(contract_id,kind,seq), UNIQUE(id,contract_id), FOREIGN KEY(contract_id) REFERENCES client_contracts(id)
);
CREATE TABLE client_contract_documents (
 id CHAR(36) PRIMARY KEY, contract_id CHAR(36) NOT NULL, file_name VARCHAR(160) NOT NULL,
 content LONGBLOB NOT NULL, sha256 CHAR(64) NOT NULL, created_by CHAR(36) NOT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), FOREIGN KEY(contract_id) REFERENCES client_contracts(id), FOREIGN KEY(created_by) REFERENCES users(id)
);
CREATE TABLE client_contract_history (
 id CHAR(36) PRIMARY KEY, contract_id CHAR(36) NOT NULL, contract_revision INT NOT NULL,
 entity_id CHAR(36) NOT NULL, actor_id CHAR(36) NOT NULL, action VARCHAR(60) NOT NULL,
 before_data JSON NULL, after_data JSON NOT NULL, created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 FOREIGN KEY(contract_id) REFERENCES client_contracts(id), FOREIGN KEY(actor_id) REFERENCES users(id), INDEX(contract_id,created_at)
);
CREATE TABLE contract_preproject_authorizations (
 contract_id CHAR(36) PRIMARY KEY, project_ref CHAR(36) NOT NULL UNIQUE,
 status ENUM('authorized','revoked') NOT NULL, revision INT NOT NULL DEFAULT 1,
 decision JSON NOT NULL, authorized_by CHAR(36) NOT NULL, FOREIGN KEY(contract_id) REFERENCES client_contracts(id), FOREIGN KEY(authorized_by) REFERENCES users(id)
);
CREATE TABLE module_event_outbox (
 id CHAR(36) PRIMARY KEY, schema_version INT NOT NULL, source_module VARCHAR(40) NOT NULL,
 company_id VARCHAR(40) NOT NULL, unit_id VARCHAR(40) NOT NULL, event_type VARCHAR(80) NOT NULL,
 entity_id CHAR(36) NOT NULL, entity_revision INT NOT NULL, effective_at DATE NOT NULL,
 recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), actor_id CHAR(36) NOT NULL,
 correlation_id CHAR(36) NOT NULL, payload JSON NOT NULL,
 FOREIGN KEY(company_id) REFERENCES companies(id), FOREIGN KEY(unit_id) REFERENCES business_units(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE contract_requests (
 actor_id CHAR(36) NOT NULL, request_id CHAR(36) NOT NULL, request_hash CHAR(64) NOT NULL,
 company_id VARCHAR(40) NOT NULL, response JSON NOT NULL, PRIMARY KEY(actor_id,request_id),
 FOREIGN KEY(actor_id) REFERENCES users(id), FOREIGN KEY(company_id) REFERENCES companies(id)
);
