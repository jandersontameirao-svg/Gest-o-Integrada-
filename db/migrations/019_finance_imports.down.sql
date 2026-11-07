DELETE FROM module_event_outbox WHERE source_module='finance' AND (event_type LIKE 'finance.import.%' OR event_type LIKE 'finance.bank_entry.%');
DELETE FROM finance_history WHERE entity_type IN ('import','bank_entry');
DELETE FROM finance_requests;
DROP TABLE finance_bank_entries;
DROP TABLE finance_import_batches;
