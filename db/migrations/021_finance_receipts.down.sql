DELETE FROM module_event_outbox WHERE source_module='finance' AND (event_type LIKE 'finance.receipt.%' OR event_type LIKE 'finance.receipt_template.%');
DELETE FROM finance_history WHERE entity_type IN ('receipt','receipt_template');
DELETE FROM finance_requests;
DROP TABLE finance_receipt_coverage;
DROP TABLE finance_receipts;
DROP TABLE finance_receipt_templates;
ALTER TABLE finance_private_files DROP COLUMN status,DROP COLUMN revision;
