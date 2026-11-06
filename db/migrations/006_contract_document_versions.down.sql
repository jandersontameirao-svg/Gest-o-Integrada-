-- Older versions and bytes remain intact; only version metadata is removed.
ALTER TABLE client_contract_documents
 DROP FOREIGN KEY document_record_owner,
 DROP INDEX document_series_version,
 DROP COLUMN record_id,
 DROP COLUMN version,
 DROP COLUMN series_id;
