import { digest, randomToken } from './password.js';
import { fail, sameOrigin } from '../http.js';
export const COOKIE = 'faxue_session';
export const IDLE = 2 * 60 * 60 * 1000;
export const LIFETIME = 24 * 60 * 60 * 1000;
export function sessionCookie(request, token, maxAge = LIFETIME / 1000) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
export async function getSession(request, db) {
  const token = request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const tokenHash = await digest(token); const now = Date.now();
  const row = await db.prepare(`SELECT s.*,u.login_id,u.display_name,u.must_change_password FROM sessions s JOIN users u ON s.user_id=u.id
    WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>? AND s.active_at>? AND u.status='active'`).bind(tokenHash, now, now - IDLE).first();
  if (!row) return null;
  const roles = await db.prepare('SELECT role FROM user_roles WHERE user_id=?').bind(row.user_id).all();
  await db.prepare('UPDATE sessions SET active_at=? WHERE token_hash=? AND revoked_at IS NULL').bind(now, tokenHash).run();
  return { tokenHash, csrfToken: row.csrf_token, user: { id: row.user_id, loginId: row.login_id, displayName: row.display_name, mustChangePassword: Boolean(row.must_change_password), roles: roles.results.map(v => v.role) } };
}
export async function createSession(db, userId) {
  const token = randomToken(); const csrfToken = randomToken(); const now = Date.now();
  await db.prepare('INSERT INTO sessions(token_hash,user_id,csrf_token,created_at,active_at,expires_at) VALUES(?,?,?,?,?,?)').bind(await digest(token), userId, csrfToken, now, now, now + LIFETIME).run();
  return { token, csrfToken };
}
export function requireSession(session) { if (!session) fail(401, 'login_required', '请先登录。'); return session.user; }
export function requireRole(session, ...roles) { const user = requireSession(session); if (!roles.some(role => user.roles.includes(role))) fail(403, 'forbidden', '当前账号没有此操作权限。'); return user; }
export function verifyWrite(request, session) {
  sameOrigin(request); requireSession(session);
  if (request.headers.get('x-csrf-token') !== session.csrfToken) fail(403, 'csrf', '会话校验失败，请刷新页面重试。');
}
export async function rateLimit(db, key, maximum, windowMs) {
  const now = Date.now(); const start = Math.floor(now / windowMs) * windowMs;
  const row = await db.prepare(`INSERT INTO rate_limits(key,window_start,count) VALUES(?,?,1)
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window_start=excluded.window_start THEN count+1 ELSE 1 END,window_start=excluded.window_start RETURNING count`).bind(key, start).first();
  if (row.count > maximum) fail(429, 'rate_limited', '操作频繁，请稍后重试。');
}
