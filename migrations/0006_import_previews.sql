CREATE TABLE import_previews(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),payload TEXT NOT NULL,expires_at INTEGER NOT NULL);
CREATE INDEX import_previews_expiry ON import_previews(expires_at);
