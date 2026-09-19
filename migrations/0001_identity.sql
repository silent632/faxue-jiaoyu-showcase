PRAGMA foreign_keys = ON;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  login_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','disabled')),
  created_at INTEGER NOT NULL
);
CREATE TABLE user_roles (
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL CHECK(role IN ('student','teacher','mentor','admin')),
  PRIMARY KEY(user_id,role)
);
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  csrf_token TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  active_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER
);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);
CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  target_id TEXT,
  detail TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE INDEX audit_time ON audit_events(created_at DESC,id);
-- 在数据库层防止并发操作移除最后一位有效管理员。
CREATE TRIGGER protect_last_admin_disable BEFORE UPDATE OF status ON users
WHEN OLD.status='active' AND NEW.status='disabled'
 AND EXISTS(SELECT 1 FROM user_roles WHERE user_id=OLD.id AND role='admin')
 AND (SELECT count(*) FROM users JOIN user_roles ON users.id=user_roles.user_id WHERE users.status='active' AND role='admin') <= 1
BEGIN SELECT RAISE(ABORT,'last_admin'); END;
CREATE TRIGGER protect_last_admin_role BEFORE DELETE ON user_roles
WHEN OLD.role='admin' AND EXISTS(SELECT 1 FROM users WHERE id=OLD.user_id AND status='active')
 AND (SELECT count(*) FROM users JOIN user_roles ON users.id=user_roles.user_id WHERE users.status='active' AND role='admin') <= 1
BEGIN SELECT RAISE(ABORT,'last_admin'); END;
