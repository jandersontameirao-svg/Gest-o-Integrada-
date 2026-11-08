DELETE FROM module_event_outbox WHERE source_module='finance' AND (event_type LIKE 'finance.scenario.%' OR event_type LIKE 'finance.preference.%');
DELETE FROM finance_history WHERE entity_type IN ('scenario','preference');
DELETE FROM finance_requests;
DROP TABLE finance_preferences;
DROP TABLE finance_scenarios;
