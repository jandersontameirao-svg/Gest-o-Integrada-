DELETE FROM strategy_documents WHERE kind IN ('tows','porter-full','vrio-full','stakeholders-full');
ALTER TABLE strategy_documents MODIFY kind ENUM('porter','stakeholders','vrio','bsc','okr','swot','pestel') NOT NULL;
DROP TABLE strategy_facts;
DROP TABLE strategy_metrics;
DROP TABLE strategy_objective_links;
