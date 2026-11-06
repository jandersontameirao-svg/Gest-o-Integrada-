-- Private storage remains in MySQL. No external bucket or remote URL.
ALTER TABLE client_contract_documents
 ADD COLUMN series_id CHAR(36) NULL,
 ADD COLUMN version INT NOT NULL DEFAULT 1,
 ADD COLUMN record_id CHAR(36) NULL,
 ADD UNIQUE KEY document_series_version (contract_id,series_id,version),
 ADD CONSTRAINT document_record_owner FOREIGN KEY (record_id,contract_id) REFERENCES client_contract_records(id,contract_id);
UPDATE client_contract_documents SET series_id=id;
ALTER TABLE client_contract_documents MODIFY series_id CHAR(36) NOT NULL;
