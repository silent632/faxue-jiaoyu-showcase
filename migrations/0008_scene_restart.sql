ALTER TABLE learning_attempts ADD COLUMN parent_attempt_id TEXT REFERENCES learning_attempts(id);
ALTER TABLE learning_attempts ADD COLUMN restart_key TEXT;
DROP INDEX attempts_user_task_version;
CREATE UNIQUE INDEX attempts_original_task ON learning_attempts(user_id,task_version_id) WHERE task_version_id IS NOT NULL AND parent_attempt_id IS NULL;
CREATE UNIQUE INDEX attempts_restart ON learning_attempts(parent_attempt_id,restart_key) WHERE parent_attempt_id IS NOT NULL;
