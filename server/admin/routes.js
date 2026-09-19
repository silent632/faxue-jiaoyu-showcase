import { body, fail, json, onlyFields, pagination, textField } from '../http.js';
import { requireRole } from '../auth/session.js';
import { hashPassword } from '../auth/password.js';
export function audit(db, actor, action, target, detail = {}) {
  return db.prepare('INSERT INTO audit_events(id,actor_id,action,target_id,detail,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(), actor, action, target, JSON.stringify(detail), Date.now());
}
function rolesField(roles) {
  if (!Array.isArray(roles) || !roles.length || roles.length > 4 || new Set(roles).size !== roles.length || roles.some(role => !['student','teacher','mentor','admin'].includes(role))) fail(400, 'invalid_roles', '请选择有效的账号角色。');
  return roles;
}
export async function adminRoute({ request, db, session, path }) {
  if (!path.startsWith('/admin/')) return null;
  const user = requireRole(session, 'admin'); const url = new URL(request.url);
  if (path === '/admin/users' && request.method === 'GET') {
    const { page, limit, offset } = pagination(url); const search = (url.searchParams.get('q') || '').slice(0,100);
    const filter = `%${search.replaceAll('\\','\\\\').replaceAll('%','\\%').replaceAll('_','\\_')}%`;
    const rows = await db.prepare(`SELECT id,login_id,display_name,status,created_at,
      (SELECT json_group_array(role) FROM user_roles WHERE user_id=users.id) AS roles
      FROM users WHERE login_id LIKE ? ESCAPE '\\' OR display_name LIKE ? ESCAPE '\\' ORDER BY created_at DESC,id LIMIT ? OFFSET ?`).bind(filter,filter,limit,offset).all();
    const total = await db.prepare("SELECT count(*) AS total FROM users WHERE login_id LIKE ? ESCAPE '\\' OR display_name LIKE ? ESCAPE '\\'").bind(filter,filter).first();
    return json({ items: rows.results.map(row => ({ ...row, roles: JSON.parse(row.roles) })), page, limit, total: total.total });
  }
  if (path === '/admin/users' && request.method === 'POST') {
    const input = await body(request); onlyFields(input, ['loginId','displayName','password','roles']);
    const loginId = textField(input.loginId,'账号',1,80);
    if (!/^[A-Za-z0-9_-]+$/.test(loginId)) fail(400, 'invalid_login', '账号仅支持字母、数字、下划线及短横线。');
    const displayName = textField(input.displayName,'显示名'); const roles = rolesField(input.roles); const hash = await hashPassword(input.password); const id = crypto.randomUUID();
    if (await db.prepare('SELECT id FROM users WHERE login_id=?').bind(loginId).first()) fail(409,'duplicate_login','该账号已存在。');
    try {
      await db.batch([
        db.prepare('INSERT INTO users(id,login_id,display_name,password_hash,created_at) VALUES(?,?,?,?,?)').bind(id,loginId,displayName,hash,Date.now()),
        ...roles.map(role => db.prepare('INSERT INTO user_roles(user_id,role) VALUES(?,?)').bind(id,role)),
        audit(db,user.id,'user_created',id,{ roles }),
      ]);
    } catch (error) { if (String(error.message).includes('UNIQUE')) fail(409,'duplicate_login','该账号已存在。'); throw error; }
    return json({ id, loginId, displayName, roles, status: 'active' },201);
  }
  const match = path.match(/^\/admin\/users\/([^/]+)$/);
  if (match && request.method === 'PATCH') {
    const id = match[1]; const input = await body(request); onlyFields(input,['displayName','status','roles','password']);
    if (!Object.keys(input).length) fail(400,'empty_change','请选择需要修改的内容。');
    const existing = await db.prepare('SELECT id FROM users WHERE id=?').bind(id).first();
    if (!existing) fail(404,'not_found','账号不存在。');
    const statements = [];
    if (input.displayName !== undefined) statements.push(db.prepare('UPDATE users SET display_name=? WHERE id=?').bind(textField(input.displayName,'显示名'),id));
    if (input.status !== undefined) {
      if (!['active','disabled'].includes(input.status)) fail(400,'invalid_status','账号状态无效。');
      statements.push(db.prepare('UPDATE users SET status=? WHERE id=?').bind(input.status,id));
    }
    if (input.roles !== undefined) {
      const roles = rolesField(input.roles);
      statements.push(...roles.map(role => db.prepare('INSERT OR IGNORE INTO user_roles(user_id,role) VALUES(?,?)').bind(id,role)));
      statements.push(db.prepare(`DELETE FROM user_roles WHERE user_id=? AND role NOT IN (${roles.map(() => '?').join(',')})`).bind(id,...roles));
    }
    if (input.password !== undefined) statements.push(db.prepare('UPDATE users SET password_hash=? WHERE id=?').bind(await hashPassword(input.password),id));
    if (input.password !== undefined || input.status === 'disabled') statements.push(db.prepare('UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL').bind(Date.now(),id));
    statements.push(audit(db,user.id,'user_updated',id,{ fields: Object.keys(input) }));
    try { await db.batch(statements); } catch (error) { if (String(error.message).includes('last_admin')) fail(409,'last_admin','必须保留至少一位有效管理员。'); throw error; }
    const updated = await db.prepare('SELECT id,login_id,display_name,status FROM users WHERE id=?').bind(id).first();
    const updatedRoles = await db.prepare('SELECT role FROM user_roles WHERE user_id=?').bind(id).all();
    return json({ ...updated, roles: updatedRoles.results.map(row => row.role) });
  }
  if (path === '/admin/audit' && request.method === 'GET') {
    const { page,limit,offset } = pagination(url);
    const rows = await db.prepare('SELECT a.*,u.display_name AS actor_name FROM audit_events a LEFT JOIN users u ON a.actor_id=u.id ORDER BY a.created_at DESC,a.id LIMIT ? OFFSET ?').bind(limit,offset).all();
    const total = await db.prepare('SELECT count(*) AS total FROM audit_events').first();
    return json({ items: rows.results, page, limit, total: total.total });
  }
  return null;
}
