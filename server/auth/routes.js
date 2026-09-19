import { body, fail, json, onlyFields, sameOrigin, textField } from '../http.js';
import { createSession, rateLimit, requireSession, sessionCookie } from './session.js';
import { digest, hashPassword, verifyPassword } from './password.js';
// 固定成本的无效用户比较，避免直接从是否执行密码校验判断账号是否存在。
const DUMMY_HASH = '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
export async function authRoute({ request, db, session, path }) {
  if (path === '/auth/me' && request.method === 'GET') { requireSession(session); return json({ user: session.user, csrfToken: session.csrfToken }); }
  if (path === '/auth/login' && request.method === 'POST') {
    sameOrigin(request);
    const input = await body(request); onlyFields(input, ['loginId', 'password']);
    const loginId = textField(input.loginId, '账号', 1, 80);
    const address = request.headers.get('cf-connecting-ip') || 'local';
    await rateLimit(db, `login-ip:${await digest(address)}`, 30, 60_000);
    await rateLimit(db, `login-account:${await digest(loginId)}`, 8, 300_000);
    const user = await db.prepare('SELECT * FROM users WHERE login_id=?').bind(loginId).first();
    const valid = await verifyPassword(input.password, user?.password_hash || DUMMY_HASH);
    if (!valid || user?.status !== 'active') fail(401, 'invalid_credentials', '账号或密码不正确。');
    const created = await createSession(db, user.id);
    return json({ csrfToken: created.csrfToken }, 200, { 'Set-Cookie': sessionCookie(request, created.token) });
  }
  if(path==='/auth/password'&&request.method==='POST'){
    requireSession(session);const input=await body(request);onlyFields(input,['currentPassword','newPassword']);await rateLimit(db,'change-password:'+session.user.id,5,300000);
    const user=await db.prepare('SELECT password_hash,login_id FROM users WHERE id=?').bind(session.user.id).first();
    if(!await verifyPassword(input.currentPassword,user.password_hash))fail(400,'invalid_password','当前密码不正确。');
    if(input.newPassword===input.currentPassword||input.newPassword===user.login_id||input.newPassword===user.login_id.slice(-6))fail(400,'password_reused','请设置不同于学号和初始密码的新密码。');
    const hash=await hashPassword(input.newPassword);const now=Date.now();
    const results=await db.batch([db.prepare('UPDATE users SET password_hash=?,must_change_password=0 WHERE id=? AND password_hash=?').bind(hash,session.user.id,user.password_hash),db.prepare('UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL').bind(now,session.user.id),db.prepare("INSERT INTO audit_events(id,actor_id,action,target_id,created_at) VALUES(?,?,'password_changed',?,?)").bind(crypto.randomUUID(),session.user.id,session.user.id,now)]);
    if(!results[0].meta.changes)fail(409,'password_conflict','密码已发生变化，请重新登录。');
    return json({changed:true},200,{'Set-Cookie':sessionCookie(request,'',0)});
  }
  if (path === '/auth/logout' && request.method === 'POST') {
    requireSession(session);
    await db.prepare('UPDATE sessions SET revoked_at=? WHERE token_hash=?').bind(Date.now(), session.tokenHash).run();
    return json({ loggedOut: true }, 200, { 'Set-Cookie': sessionCookie(request, '', 0) });
  }
  return null;
}
