CREATE TABLE student_activations (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  issued_at INTEGER NOT NULL,
  issued_by TEXT NOT NULL REFERENCES users(id),
  consumed_at INTEGER
);
