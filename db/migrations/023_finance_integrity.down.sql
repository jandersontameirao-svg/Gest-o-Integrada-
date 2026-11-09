DELETE FROM module_event_outbox WHERE source_module='finance' AND (event_type LIKE 'finance.bank_group.%' OR event_type LIKE 'finance.allocation.%' OR event_type LIKE 'finance.fx_quote.%' OR event_type LIKE 'finance.intercompany.%');
DELETE FROM finance_history WHERE entity_type IN ('bank_group','allocation','fx_quote','intercompany');
DELETE FROM finance_requests;
DROP TABLE finance_recovery_snapshots;
DROP TABLE finance_history_origins;
DROP TABLE finance_history_loads;
DROP TABLE finance_intercompany;
DROP TABLE finance_fx_quotes;
DROP TABLE finance_allocations;
DROP TABLE finance_bank_group_movements;
DELETE FROM finance_cash_movements WHERE source_type IN ('intercompany_transfer','intercompany_reverse');
DROP TABLE finance_bank_group_entries;
DROP TABLE finance_bank_groups;

ALTER TABLE finance_settlements DROP COLUMN reversed_on;
ALTER TABLE companies DROP COLUMN legal_name,DROP COLUMN legal_tax_id,DROP COLUMN legal_city,DROP COLUMN legal_state,DROP COLUMN legal_country,DROP COLUMN legal_revision;
