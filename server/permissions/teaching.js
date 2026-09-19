import { fail } from '../http.js';
export const isAdmin = user => user.roles.includes('admin');
export async function groupAccess(db,user,groupId,{manage=false}={}) {
  const group=await db.prepare('SELECT * FROM groups WHERE id=?').bind(groupId).first();
  if(!group)fail(404,'not_found','未找到可访问的小组。');
  if(isAdmin(user))return {...group,manages:true};
  const member=await db.prepare('SELECT kind FROM group_members WHERE group_id=? AND user_id=?').bind(groupId,user.id).first();
  if(!member)fail(404,'not_found','未找到可访问的小组。');
  const manages=member.kind==='teacher'&&user.roles.includes('teacher');
  if(manage&&!manages)fail(403,'forbidden','只有负责此小组的教师可以操作。');
  return {...group,manages};
}
export async function taskAccess(db,user,taskId,{manage=false}={}) {
  const task=await db.prepare('SELECT * FROM tasks WHERE id=?').bind(taskId).first();
  if(!task)fail(404,'not_found','未找到可访问的任务。');
  if(isAdmin(user))return {...task,manages:true};
  const member=await db.prepare('SELECT kind FROM group_members WHERE group_id=? AND user_id=?').bind(task.group_id,user.id).first();
  const manages=member?.kind==='teacher'&&user.roles.includes('teacher');
  const mentor=user.roles.includes('mentor')&&Boolean(await db.prepare('SELECT 1 FROM mentor_assignments WHERE task_id=? AND mentor_id=? AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>?)').bind(taskId,user.id,Date.now()).first());
  if((!member&&!mentor)||(task.status==='draft'&&!manages))fail(404,'not_found','未找到可访问的任务。');
  if(manage&&!manages)fail(403,'forbidden','只有负责此任务的教师可以操作。');
  return {...task,manages,mentor};
}
export async function ownAttempt(db,user,id) {
 const attempt=await db.prepare('SELECT * FROM learning_attempts WHERE id=? AND user_id=?').bind(id,user.id).first();
 if(!attempt)fail(404,'not_found','未找到本人的学习记录。');
 return attempt;
}
