CREATE INDEX sessions_expiry_cleanup ON sessions(expires_at);
CREATE INDEX sessions_revoked_cleanup ON sessions(revoked_at);
CREATE INDEX rate_limits_window_cleanup ON rate_limits(window_start);
