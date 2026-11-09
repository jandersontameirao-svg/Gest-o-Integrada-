DELETE FROM module_event_outbox WHERE id IN (SELECT id FROM supplier_review_history);
DROP TABLE supplier_review_requests;
DROP TABLE supplier_review_history;
DROP TABLE supplier_evaluations;
DROP TABLE supplier_measurements;
