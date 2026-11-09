DELETE FROM module_event_outbox WHERE id IN (SELECT id FROM supplier_operation_history);
DROP TABLE supplier_operation_requests;
DROP TABLE supplier_daily_approvals;
DROP TABLE supplier_operational_periods;
DROP TABLE supplier_operation_history;
DROP TABLE supplier_service_orders;
DROP TABLE supplier_contracts;
