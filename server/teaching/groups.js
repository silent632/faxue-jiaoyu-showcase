import { body, fail, json, onlyFields, pagination, textField } from '../http.js';
import { requireRole } from '../auth/session.js';
import { groupAccess, isAdmin } from '../permissions/teaching.js';
import { audit } from '../admin/routes.js';
export async function groupsRoute({request,db,session,path}) {
 const user=session.user;const method=request.method;const url=new URL(request.url);
 if(path==='/groups'&&method==='GET') {
  const {page,limit,offset}=pagination(url);
  const where=isAdmin(user)?'1=1':'EXISTS(SELECT 1 FROM group_members m WHERE m.group_id=g.id AND m.user_id=?)';const args=isAdmin(user)?[]:[user.id];
  const items=await db.prepare(`SELECT g.* FROM groups g WHERE ${where} ORDER BY g.created_at DESC,g.id LIMIT ? OFFSET ?`).bind(...args,limit,offset).all();
  const total=await db.prepare(`SELECT count(*) AS n FROM groups g WHERE ${where}`).bind(...args).first();
  return json({items:items.results,page,limit,total:total.n});
 }
 if(path==='/groups'&&method==='POST') {
  requireRole(session,'teacher','admin');const input=await body(request);onlyFields(input,['name','courseSlug']);
  const name=textField(input.name,'小组名称',1,100);const course=input.courseSlug?textField(input.courseSlug,'课程标识',1,100):null;
  const id=crypto.randomUUID();await db.batch([db.prepare('INSERT INTO groups(id,name,course_slug,created_by,created_at) VALUES(?,?,?,?,?)').bind(id,name,course,user.id,Date.now()),db.prepare("INSERT INTO group_members(group_id,user_id,kind) VALUES(?,?,'teacher')").bind(id,user.id),audit(db,user.id,'group_created',id)]);
  return json({id,name,course_slug:course},201);
 }
 const match=path.match(/^\/groups\/([^/]+)(?:\/(members|candidates))?$/);if(!match)return null;
 const [,id,operation]=match;const group=await groupAccess(db,user,id,{manage:method!=='GET'||operation==='candidates'});
 if(!operation&&method==='GET')return json(group);
 if(operation==='candidates'&&method==='GET') {
  const q=textField(url.searchParams.get('q'),'账号或姓名',1,80);
  const rows=await db.prepare(`SELECT u.id,u.login_id,u.display_name FROM users u WHERE u.status='active' AND (u.login_id=? OR u.display_name=?) AND EXISTS(SELECT 1 FROM user_roles r WHERE r.user_id=u.id AND r.role='student') ORDER BY u.id LIMIT 20`).bind(q,q).all();
  return json({items:rows.results});
 }
 if(operation==='members'&&method==='GET') {
  const {page,limit,offset}=pagination(url);const own=group.manages?'':' AND u.id=?';const args=group.manages?[id]:[id,user.id];
  const rows=await db.prepare(`SELECT u.id,u.login_id,u.display_name,u.status,m.kind FROM group_members m JOIN users u ON m.user_id=u.id WHERE m.group_id=?${own} ORDER BY m.kind,u.id LIMIT ? OFFSET ?`).bind(...args,limit,offset).all();
  return json({items:rows.results,page,limit});
 }
 if(operation==='members'&&['POST','DELETE'].includes(method)) {
  const input=await body(request);onlyFields(input,method==='POST'?['userId','kind']:['userId']);const target=textField(input.userId,'用户ID',1,80);
  const existing=await db.prepare('SELECT id FROM users WHERE id=? AND status=\'active\'').bind(target).first();
  if(!existing&&method==='POST')fail(404,'not_found','未找到有效账号。');
  const membership=await db.prepare('SELECT kind FROM group_members WHERE group_id=? AND user_id=?').bind(id,target).first();
  if(!isAdmin(user)&&(input.kind==='teacher'||membership?.kind==='teacher'))fail(403,'forbidden','教师关系由管理员维护。');
  let statement;
  if(method==='POST'){
   if(!['teacher','student'].includes(input.kind))fail(400,'invalid_kind','请选择学生或教师身份。');
   if(!await db.prepare('SELECT 1 FROM user_roles WHERE user_id=? AND role=?').bind(target,input.kind).first())fail(400,'role_mismatch','账号角色与小组身份不符。');
   statement=db.prepare('INSERT INTO group_members(group_id,user_id,kind) VALUES(?,?,?) ON CONFLICT(group_id,user_id) DO UPDATE SET kind=excluded.kind').bind(id,target,input.kind);
  }else statement=db.prepare('DELETE FROM group_members WHERE group_id=? AND user_id=?').bind(id,target);
  await db.batch([statement,audit(db,user.id,method==='POST'?'member_added':'member_removed',id,{userId:target})]);
  return json({saved:true});
 }
 return null;
}
