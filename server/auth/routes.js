import { body, fail, json, onlyFields, sameOrigin, textField } from '../http.js';
import { cleanupAuthRecords, createSession, rateLimit, requireSession, sessionCookie } from './session.js';
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
    const accountHash = await digest(loginId);
    const addressHash = await digest(address);
    await rateLimit(db, `login-account-ip:${accountHash}:${addressHash}`, 8, 300_000);
    await rateLimit(db, `login-account-total:${accountHash}`, 50, 900_000);
    const user = await db.prepare('SELECT * FROM users WHERE login_id=?').bind(loginId).first();
    const valid = await verifyPassword(input.password, user?.password_hash || DUMMY_HASH);
    const pending = user && await db.prepare('SELECT 1 FROM student_activations WHERE user_id=? AND consumed_at IS NULL').bind(user.id).first();
    if (!valid || user?.status !== 'active' || pending) fail(401, 'invalid_credentials', '账号或密码不正确。');
    // 低频、有界清理，不让维护故障阻止有效用户登录。
    if (crypto.getRandomValues(new Uint32Array(1))[0] % 100 === 0) {
      try { await cleanupAuthRecords(db); } catch { console.error(JSON.stringify({ event: 'auth_cleanup_failed' })); }
    }
    const created = await createSession(db, user.id, user.password_hash);
    if (!created) fail(401, 'invalid_credentials', '账号或密码不正确。');
    return json({ csrfToken: created.csrfToken }, 200, { 'Set-Cookie': sessionCookie(request, created.token) });
  }
  if(path==='/auth/activate'&&request.method==='POST'){
    sameOrigin(request);const input=await body(request);onlyFields(input,['loginId','activationCode','newPassword']);
    const loginId=textField(input.loginId,'账号',1,80);const code=textField(input.activationCode,'激活凭据',1,128);
    if(input.newPassword===loginId||input.newPassword===loginId.slice(-6)||input.newPassword===code)fail(400,'password_reused','请设置不同于账号和激活凭据的新密码。');
    const address=request.headers.get('cf-connecting-ip')||'local';
    await rateLimit(db,'activate-ip:'+await digest(address),30,60000);
    await rateLimit(db,'activate-account-ip:'+await digest(loginId)+':'+await digest(address),8,300000);
    await rateLimit(db,'activate-account-total:'+await digest(loginId),50,900000);
    const hash=await hashPassword(input.newPassword);const tokenHash=await digest(code);const now=Date.now();
    const results=await db.batch([
      db.prepare("UPDATE users SET password_hash=?,must_change_password=0 WHERE login_id=? AND status='active' AND must_change_password=1 AND EXISTS(SELECT 1 FROM student_activations a WHERE a.user_id=users.id AND a.token_hash=? AND a.consumed_at IS NULL AND a.expires_at>?) RETURNING id").bind(hash,loginId,tokenHash,now),
      db.prepare('UPDATE student_activations SET consumed_at=? WHERE token_hash=? AND consumed_at IS NULL AND user_id=(SELECT id FROM users WHERE login_id=? AND password_hash=?)').bind(now,tokenHash,loginId,hash),
      db.prepare('UPDATE sessions SET revoked_at=? WHERE revoked_at IS NULL AND user_id=(SELECT id FROM users WHERE login_id=? AND password_hash=?)').bind(now,loginId,hash),
      db.prepare("INSERT INTO audit_events(id,actor_id,action,target_id,created_at) SELECT ?,id,'student_activated',id,? FROM users WHERE login_id=? AND password_hash=?").bind(crypto.randomUUID(),now,loginId,hash),
    ]);
    if(!results[0].results?.length)fail(400,'activation_invalid','账号或激活凭据无效或已过期。');
    return json({activated:true});
  }
  if(path==='/auth/password'&&request.method==='POST'){
    requireSession(session);const input=await body(request);onlyFields(input,['currentPassword','newPassword']);await rateLimit(db,'change-password:'+session.user.id,5,300000);
    const user=await db.prepare('SELECT password_hash,login_id FROM users WHERE id=?').bind(session.user.id).first();
    if(!await verifyPassword(input.currentPassword,user.password_hash))fail(400,'invalid_password','当前密码不正确。');
    if(input.newPassword===input.currentPassword||input.newPassword===user.login_id||input.newPassword===user.login_id.slice(-6))fail(400,'password_reused','请设置不同于学号和初始密码的新密码。');
    const hash=await hashPassword(input.newPassword);const now=Date.now();
    // 签发激活凭据可能与当前请求并发，必须在写入时重新核对激活状态。
    const results=await db.batch([
      db.prepare('UPDATE users SET password_hash=?,must_change_password=0 WHERE id=? AND password_hash=? AND NOT EXISTS(SELECT 1 FROM student_activations WHERE user_id=users.id AND consumed_at IS NULL)').bind(hash,session.user.id,user.password_hash),
      db.prepare('UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL AND EXISTS(SELECT 1 FROM users WHERE id=? AND password_hash=?)').bind(now,session.user.id,session.user.id,hash),
      db.prepare("INSERT INTO audit_events(id,actor_id,action,target_id,created_at) SELECT ?,?,'password_changed',?,? WHERE EXISTS(SELECT 1 FROM users WHERE id=? AND password_hash=?)").bind(crypto.randomUUID(),session.user.id,session.user.id,now,session.user.id,hash),
    ]);
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
