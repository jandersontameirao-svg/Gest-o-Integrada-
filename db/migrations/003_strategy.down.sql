DROP TABLE strategy_approved_versions;
DROP TABLE strategy_history;
DROP TABLE strategy_documents;
DELETE FROM strategy_entries WHERE kind='kpi-value' OR kind='target';
DROP TABLE strategy_entries;
DROP TABLE strategy_cycles;
DROP TABLE strategy_plans;
