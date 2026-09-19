CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  course_slug TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  archived_at INTEGER
);
CREATE TABLE group_members (
  group_id TEXT NOT NULL REFERENCES groups(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL CHECK(kind IN ('student','teacher')),
  PRIMARY KEY(group_id,user_id)
);
CREATE INDEX group_members_user ON group_members(user_id,group_id);
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id),
  created_by TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  current_version_id TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX tasks_group ON tasks(group_id,created_at DESC,id);
CREATE TABLE task_versions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  requirements TEXT NOT NULL,
  checkpoints TEXT NOT NULL,
  course_slug TEXT,
  case_id TEXT,
  module_id TEXT,
  scene_id TEXT,
  scene_version TEXT,
  deadline INTEGER,
  created_at INTEGER NOT NULL,
  UNIQUE(task_id,version),
  CHECK((case_id IS NOT NULL AND module_id IS NOT NULL AND scene_id IS NULL) OR (case_id IS NULL AND module_id IS NULL AND scene_id IS NOT NULL AND scene_version IS NOT NULL))
);
CREATE TRIGGER immutable_task_versions BEFORE UPDATE ON task_versions BEGIN SELECT RAISE(ABORT,'immutable_task_version'); END;
CREATE TABLE mentor_assignments (
  task_id TEXT NOT NULL REFERENCES tasks(id),
  mentor_id TEXT NOT NULL REFERENCES users(id),
  expires_at INTEGER,
  revoked_at INTEGER,
  PRIMARY KEY(task_id,mentor_id)
);
CREATE TABLE learning_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  task_version_id TEXT REFERENCES task_versions(id),
  case_id TEXT,
  module_id TEXT,
  scene_id TEXT,
  scene_version TEXT,
  role TEXT,
  provenance TEXT NOT NULL DEFAULT 'current' CHECK(provenance IN ('current','imported')),
  created_at INTEGER NOT NULL
);
CREATE INDEX attempts_user ON learning_attempts(user_id,created_at DESC,id);
CREATE TABLE drafts (
  attempt_id TEXT PRIMARY KEY REFERENCES learning_attempts(id),
  revision INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL
);
CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES learning_attempts(id),
  sequence INTEGER NOT NULL,
  draft_revision INTEGER NOT NULL,
  snapshot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','changes_requested','reviewed')),
  late INTEGER NOT NULL CHECK(late IN (0,1)),
  idempotency_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(attempt_id,sequence),
  UNIQUE(attempt_id,idempotency_key),
  UNIQUE(attempt_id,draft_revision)
);
CREATE INDEX submissions_attempt ON submissions(attempt_id,created_at DESC,id);
CREATE TRIGGER immutable_submission_snapshot BEFORE UPDATE OF snapshot,attempt_id,sequence,draft_revision,created_at,idempotency_key ON submissions BEGIN SELECT RAISE(ABORT,'immutable_submission'); END;
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id),
  reviewer_id TEXT NOT NULL REFERENCES users(id),
  reviewer_role TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('changes_requested','reviewed')),
  checkpoints TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  event_key TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  read_at INTEGER,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id,event_key)
);
CREATE INDEX notifications_user ON notifications(user_id,created_at DESC,id);
CREATE TABLE import_receipts (
  user_id TEXT NOT NULL REFERENCES users(id),
  fingerprint TEXT NOT NULL,
  attempt_id TEXT NOT NULL REFERENCES learning_attempts(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(user_id,fingerprint)
);
