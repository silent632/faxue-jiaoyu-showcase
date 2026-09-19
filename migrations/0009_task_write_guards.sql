-- 防止请求在校验后遭遇并发归档，仍写入新版本或重新发布。
CREATE TRIGGER no_new_version_for_archived_task BEFORE INSERT ON task_versions
WHEN EXISTS(SELECT 1 FROM tasks WHERE id=NEW.task_id AND status='archived')
BEGIN SELECT RAISE(ABORT,'task_archived'); END;
CREATE TRIGGER no_reopen_archived_task BEFORE UPDATE OF status,current_version_id ON tasks
WHEN OLD.status='archived' AND (NEW.status!='archived' OR NEW.current_version_id IS NOT OLD.current_version_id)
BEGIN SELECT RAISE(ABORT,'task_archived'); END;
