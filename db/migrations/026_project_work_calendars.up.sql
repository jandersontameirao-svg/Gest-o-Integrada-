CREATE TABLE project_work_calendars (
 project_id CHAR(36) PRIMARY KEY, revision INT NOT NULL,
 payload JSON NOT NULL, actor_id CHAR(36) NOT NULL,
 updated_at DATETIME(6) NOT NULL,
 FOREIGN KEY(project_id) REFERENCES operational_projects(id),
 FOREIGN KEY(actor_id) REFERENCES users(id)
);
