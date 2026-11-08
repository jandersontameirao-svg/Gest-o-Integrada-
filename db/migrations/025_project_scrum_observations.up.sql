CREATE TABLE project_sprint_observations (
 id CHAR(36) PRIMARY KEY,
 project_id CHAR(36) NOT NULL, sprint_id CHAR(36) NOT NULL,
 project_revision INT NOT NULL, actor_id CHAR(36) NOT NULL,
 recorded_at DATETIME(6) NOT NULL, reason VARCHAR(80) NOT NULL,
 total_points INT NOT NULL, remaining_points INT NOT NULL,
 task_count INT NOT NULL, done_count INT NOT NULL,
 UNIQUE(project_id,sprint_id,project_revision),
 INDEX(sprint_id,recorded_at),
 FOREIGN KEY(project_id) REFERENCES operational_projects(id),
 FOREIGN KEY(sprint_id,project_id) REFERENCES operational_project_records(id,project_id),
 FOREIGN KEY(actor_id) REFERENCES users(id),
 CHECK(total_points>=0 AND remaining_points>=0 AND remaining_points<=total_points),
 CHECK(task_count>=0 AND done_count>=0 AND done_count<=task_count)
);
