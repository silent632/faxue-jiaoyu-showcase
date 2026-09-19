CREATE UNIQUE INDEX attempts_user_task_version ON learning_attempts(user_id,task_version_id) WHERE task_version_id IS NOT NULL;
