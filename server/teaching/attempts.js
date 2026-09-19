import { getScene } from '../scenes/registry.js';
import { sceneMissing } from '../../lib/scenes/completion.js';
import { body, fail, json, onlyFields, pagination, textField } from '../http.js';
import { ownAttempt, taskAccess } from '../permissions/teaching.js';
import { checkExperimentCompletion } from '../../lib/experiment-completion.js';
import { checkRevisionCompletion } from '../../lib/experiment-revision.js';
export async function attemptsRoute({request,db,session,path}){
 const user=session.user;const method=request.method;const url=new URL(request.url);
 if(path==='/attempts'&&method==='GET'){
  const {page,limit,offset}=pagination(url);const rows=await db.prepare('SELECT a.*,v.title AS task_title FROM learning_attempts a LEFT JOIN task_versions v ON v.id=a.task_version_id WHERE a.user_id=? ORDER BY a.created_at DESC,a.id LIMIT ? OFFSET ?').bind(user.id,limit,offset).all();
  const total=await db.prepare('SELECT count(*) AS n FROM learning_attempts WHERE user_id=?').bind(user.id).first();return json({items:rows.results,page,limit,total:total.n});
 }
 if(path==='/attempts'&&method==='POST'){
  const input=await body(request);onlyFields(input,['taskId']);const task=await taskAccess(db,user,input.taskId);
  if(task.status!=='published')fail(409,'not_published','此任务当前不能开始。');
  const member=await db.prepare("SELECT 1 FROM group_members WHERE group_id=? AND user_id=? AND kind='student'").bind(task.group_id,user.id).first();
  if(!member||!user.roles.includes('student'))fail(403,'student_required','请使用此小组的学生账号开始任务。');
  const version=await db.prepare('SELECT * FROM task_versions WHERE id=?').bind(task.current_version_id).first();
  const existing=await db.prepare('SELECT id FROM learning_attempts WHERE user_id=? AND task_version_id=? AND parent_attempt_id IS NULL').bind(user.id,version.id).first();if(existing)return json(existing);
  const id=crypto.randomUUID();const now=Date.now();try{await db.batch([
   db.prepare('INSERT INTO learning_attempts(id,user_id,task_version_id,case_id,module_id,scene_id,scene_version,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(id,user.id,version.id,version.case_id,version.module_id,version.scene_id,version.scene_version,now),
   db.prepare('INSERT INTO drafts(attempt_id,updated_at) VALUES(?,?)').bind(id,now),
  ]);}catch(error){if(String(error.message).includes('UNIQUE')){const concurrent=await db.prepare('SELECT id FROM learning_attempts WHERE user_id=? AND task_version_id=? AND parent_attempt_id IS NULL').bind(user.id,version.id).first();if(concurrent)return json(concurrent);}throw error;}return json({id},201);
 }
 const match=path.match(/^\/attempts\/([^/]+)(?:\/(draft|submissions|restart))?$/);if(!match)return null;
 const [,id,operation]=match;const attempt=await ownAttempt(db,user,id);
 const version=attempt.task_version_id?await db.prepare('SELECT * FROM task_versions WHERE id=?').bind(attempt.task_version_id).first():null;
 if(operation==='restart'&&method==='POST'){
  if(!attempt.scene_id||!version)fail(400,'scene_required','只有场景任务可以重启角色。');const task=await taskAccess(db,user,version.task_id);if(task.status!=='published')fail(409,'archived','任务已归档，不能新开角色。');
  const input=await body(request);onlyFields(input,['role']);const scene=await getScene(db,attempt.scene_id,attempt.scene_version);if(!scene.content.roles.some(role=>role.id===input.role))fail(400,'role','请选择有效的场景角色。');
  const key=textField(request.headers.get('idempotency-key'),'重启标识',8,100);const prior=await db.prepare('SELECT id FROM learning_attempts WHERE parent_attempt_id=? AND restart_key=?').bind(id,key).first();if(prior)return json(prior);
  const next=crypto.randomUUID();const now=Date.now();try{await db.batch([db.prepare('INSERT INTO learning_attempts(id,user_id,task_version_id,scene_id,scene_version,role,parent_attempt_id,restart_key,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(next,user.id,version.id,attempt.scene_id,attempt.scene_version,input.role,id,key,now),db.prepare('INSERT INTO drafts(attempt_id,content,updated_at) VALUES(?,?,?)').bind(next,JSON.stringify({scene:{role:input.role,node:1}}),now)]);}catch(error){if(String(error.message).includes('UNIQUE')){const concurrent=await db.prepare('SELECT id FROM learning_attempts WHERE parent_attempt_id=? AND restart_key=?').bind(id,key).first();if(concurrent)return json(concurrent);}throw error;}return json({id:next},201);
 }
 if((!operation||operation==='draft')&&method==='GET'){
  const draft=await db.prepare('SELECT * FROM drafts WHERE attempt_id=?').bind(id).first();
  const submissions=await db.prepare('SELECT id,sequence,status,created_at,late FROM submissions WHERE attempt_id=? ORDER BY sequence DESC').bind(id).all();
  return json({attempt,version:version?{...version,checkpoints:JSON.parse(version.checkpoints)}:null,draft:{...draft,content:JSON.parse(draft.content)},submissions:submissions.results});
 }
 if(operation==='draft'&&method==='PUT'){
  const input=await body(request);onlyFields(input,['revision','content']);
  if(!Number.isSafeInteger(input.revision)||input.revision<0||!input.content||typeof input.content!=='object'||Array.isArray(input.content))fail(400,'invalid_draft','草稿格式无效。');
  let sceneRole=null;
  if(attempt.scene_id){const script=(await getScene(db,attempt.scene_id,attempt.scene_version)).content;const scene=input.content.scene;if(!scene||!script.roles.some(role=>role.id===scene.role)||!Number.isInteger(scene.node)||scene.node<1||scene.node>7)fail(400,'scene_state','场景角色或步骤无效。');sceneRole=scene.role;const previous=await db.prepare('SELECT content FROM drafts WHERE attempt_id=?').bind(id).first();const previousRole=JSON.parse(previous.content).scene?.role;if(previousRole&&previousRole!==sceneRole)fail(409,'scene_role_changed','切换角色须重新开始，原角色记录会保留。');}
  const updated=await db.prepare(`UPDATE drafts SET content=?,revision=revision+1,updated_at=? WHERE attempt_id=? AND revision=? AND (? IS NULL OR json_extract(content,'$.scene.role') IS NULL OR json_extract(content,'$.scene.role')=?) RETURNING revision,updated_at`).bind(JSON.stringify(input.content),Date.now(),id,input.revision,sceneRole,sceneRole).first();
  if(!updated)fail(409,'draft_conflict','其他设备已保存更新，请保留当前稿并读取服务器版本。');return json(updated);
 }
 if(operation==='submissions'&&method==='POST'){
  const key=textField(request.headers.get('idempotency-key'),'提交标识',8,100);
  const prior=await db.prepare('SELECT id,sequence,status FROM submissions WHERE attempt_id=? AND idempotency_key=?').bind(id,key).first();if(prior)return json(prior);
  if(!version||attempt.provenance!=='current')fail(400,'not_task_attempt','历史自主学习记录不能转为课程提交。');
  const task=await taskAccess(db,user,version.task_id);
  if(task.status!=='published')fail(409,'archived','当前任务不接受提交。');
  if(!user.roles.includes('student')||!await db.prepare("SELECT 1 FROM group_members WHERE group_id=? AND user_id=? AND kind='student'").bind(task.group_id,user.id).first())fail(403,'not_member','当前账号不再属于此任务小组。');
  const input=await body(request);onlyFields(input,['revision']);
  const draft=await db.prepare('SELECT * FROM drafts WHERE attempt_id=?').bind(id).first();
  if(draft.revision!==input.revision)fail(409,'draft_conflict','请先保存当前稿并确认版本后提交。');
  const record=JSON.parse(draft.content);const interaction={...record.interactionData,caseId:attempt.case_id};
  let completion;if(attempt.scene_id){const scene=await getScene(db,attempt.scene_id,attempt.scene_version);const missing=sceneMissing(scene.content,record.scene);if(record.scene?.node!==7)missing.push('完成听证归档步骤');completion={complete:missing.length===0,missing};}else completion=checkExperimentCompletion(attempt.module_id,interaction);const revision=checkRevisionCompletion(record);
  if(!completion.complete||!revision.complete)fail(400,'incomplete','尚缺少：'+[...completion.missing,...revision.missing].join('、'));
  const idNew=crypto.randomUUID();const now=Date.now();const snapshot=JSON.stringify({record:{...record,interactionData:interaction},taskVersion:version});
  try {
   await db.prepare(`INSERT INTO submissions(id,attempt_id,sequence,draft_revision,snapshot,late,idempotency_key,created_at)
    SELECT ?,?,COALESCE((SELECT MAX(sequence) FROM submissions WHERE attempt_id=?),0)+1,?,?,?, ?,?
    WHERE EXISTS(SELECT 1 FROM drafts d WHERE d.attempt_id=? AND d.revision=?) AND EXISTS(SELECT 1 FROM tasks WHERE id=? AND status='published')`).bind(idNew,id,id,draft.revision,snapshot,Number(version.deadline!==null&&now>version.deadline),key,now,id,draft.revision,task.id).run();
  }catch(error){if(String(error.message).includes('UNIQUE')){const duplicate=await db.prepare('SELECT id,sequence,status FROM submissions WHERE attempt_id=? AND (idempotency_key=? OR draft_revision=?)').bind(id,key,draft.revision).first();if(duplicate)return json(duplicate);}throw error;}
  const created=await db.prepare('SELECT id,sequence,status FROM submissions WHERE id=?').bind(idNew).first();if(!created)fail(409,'submission_conflict','任务或草稿已发生变化，请重新读取后提交。');return json(created,201);
 }
 return null;
}
