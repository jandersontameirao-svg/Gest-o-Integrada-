DELETE FROM module_event_outbox WHERE source_module='finance' AND event_type LIKE 'finance.budget.%';
DELETE FROM module_event_outbox WHERE source_module='finance' AND event_type LIKE 'finance.file.%';
DELETE FROM finance_history WHERE entity_type IN ('budget','file');
DELETE FROM finance_requests;
DROP TABLE finance_private_files;
DROP TABLE finance_budgets;
