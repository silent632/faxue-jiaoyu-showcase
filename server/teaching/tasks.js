import { getScene } from '../scenes/registry.js';
import { body, fail, json, onlyFields, pagination, textField } from '../http.js';
import { groupAccess, isAdmin, taskAccess } from '../permissions/teaching.js';
import { audit } from '../admin/routes.js';
import { annotationTasks } from '../../lib/annotation.js';
import { normTasks } from '../../lib/norm-comparison.js';
import cases from '../../data/generated/cases-extracted.json';
import experiments from '../../content/experiments.json';
import { getPublicJurisprudenceLearning } from '../../lib/content/jurisprudence-learning.js';
import { resolveTaskLearningTopic } from '../../lib/task-learning-topic.js';
const caseIds=new Set(cases.map(item=>item.case_id));const moduleIds=new Set(experiments.modules.map(item=>item.id));
export function validateTask(input) {
 const value={title:textField(input.title,'任务标题',1,100),objective:textField(input.objective,'学习目标',1,3000),requirements:textField(input.requirements,'产出要求',1,5000)};
 if(!Array.isArray(input.checkpoints)||!input.checkpoints.length||input.checkpoints.length>12)fail(400,'checkpoints','请填写1至12项评价检查点。');
 value.checkpoints=input.checkpoints.map(v=>textField(v,'检查点',1,300));
 value.courseSlug=input.courseSlug?textField(input.courseSlug,'课程标识',1,100):null;
 value.deadline=input.deadline===null||input.deadline===undefined?null:Number(input.deadline);
 if(value.deadline!==null&&(!Number.isSafeInteger(value.deadline)||value.deadline<=0))fail(400,'deadline','截止时间无效。');
 if(input.sceneId){value.sceneId=textField(input.sceneId,'场景ID',1,100);value.sceneVersion=textField(input.sceneVersion,'场景版本',1,100);value.caseId=null;value.moduleId=null;}
 else {if(!caseIds.has(input.caseId)||!moduleIds.has(input.moduleId))fail(400,'target','请选择现有案例及实验模块。');if(input.moduleId==='exp-annotation'&&!annotationTasks[input.caseId])fail(400,'evidence_unavailable','此案例尚无已核对标注，请选择其他案例或模块。');if(input.moduleId==='exp-norm-retrieval'&&!normTasks[input.caseId])fail(400,'evidence_unavailable','此案例尚无规范对照，请选择其他案例或模块。');value.caseId=input.caseId;value.moduleId=input.moduleId;value.sceneId=null;value.sceneVersion=null;}
 value.learningTopic=null;
 if(input.learningTopicId){value.learningTopic=resolveTaskLearningTopic(input.learningTopicId,value.caseId,getPublicJurisprudenceLearning());if(!value.learningTopic)fail(400,'learning_topic','请选择该案例关联的法理知识点。');}
 return value;
}
export function versionInsert(db,taskId,versionId,number,value) {
 return db.prepare('INSERT INTO task_versions(id,task_id,version,title,objective,requirements,checkpoints,course_slug,case_id,module_id,scene_id,scene_version,deadline,created_at,learning_topic) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(versionId,taskId,number,value.title,value.objective,value.requirements,JSON.stringify(value.checkpoints),value.courseSlug,value.caseId,value.moduleId,value.sceneId,value.sceneVersion,value.deadline,Date.now(),value.learningTopic?JSON.stringify(value.learningTopic):null);
}
function auditChangedTask(db,userId,action,id){
 return db.prepare('INSERT INTO audit_events(id,actor_id,action,target_id,detail,created_at) SELECT ?,?,?,?,?,? WHERE changes()>0').bind(crypto.randomUUID(),userId,action,id,'{}',Date.now());
}
export async function tasksRoute({request,db,session,path}) {
 const user=session.user;const url=new URL(request.url);const method=request.method;
 if(path==='/teaching/catalogue'&&method==='GET'){const learning=getPublicJurisprudenceLearning();return json({cases:cases.map(row=>({id:row.case_id,title:row.title})),modules:experiments.modules.map(row=>({id:row.id,name:row.name})),learningTopics:learning.topics,learningCaseLinks:learning.caseLinks.map(link=>({caseId:link.caseId,topicId:link.topicId}))});}
 if(path==='/tasks'&&method==='GET') {
  const {page,limit,offset}=pagination(url);const args=[];
  let where='1=1';
  if(!isAdmin(user)) {where=`(EXISTS(SELECT 1 FROM group_members m WHERE m.group_id=t.group_id AND m.user_id=? AND (t.status!='draft' OR (m.kind='teacher' AND ?=1))) OR (t.status!='draft' AND ?=1 AND EXISTS(SELECT 1 FROM mentor_assignments ma WHERE ma.task_id=t.id AND ma.mentor_id=? AND ma.revoked_at IS NULL AND (ma.expires_at IS NULL OR ma.expires_at>?))))`;args.push(user.id,Number(user.roles.includes('teacher')),Number(user.roles.includes('mentor')),user.id,Date.now());}
  if(url.searchParams.get('groupId')){where+=' AND t.group_id=?';args.push(url.searchParams.get('groupId'));}
  const items=await db.prepare(`SELECT t.*,v.title,v.objective,v.deadline,g.name AS group_name FROM tasks t JOIN task_versions v ON v.id=t.current_version_id JOIN groups g ON g.id=t.group_id WHERE ${where} ORDER BY t.created_at DESC,t.id LIMIT ? OFFSET ?`).bind(...args,limit,offset).all();
  const total=await db.prepare(`SELECT count(*) AS n FROM tasks t WHERE ${where}`).bind(...args).first();return json({items:items.results,page,limit,total:total.n});
 }
 if(path==='/tasks'&&method==='POST') {
  const input=await body(request);onlyFields(input,['groupId','title','objective','requirements','checkpoints','courseSlug','deadline','caseId','moduleId','sceneId','sceneVersion','learningTopicId']);await groupAccess(db,user,input.groupId,{manage:true});const value=validateTask(input);
  if(value.sceneId)await getScene(db,value.sceneId,value.sceneVersion,{published:true});
  const id=crypto.randomUUID();const versionId=crypto.randomUUID();await db.batch([db.prepare('INSERT INTO tasks(id,group_id,created_by,current_version_id,created_at) VALUES(?,?,?,?,?)').bind(id,input.groupId,user.id,versionId,Date.now()),versionInsert(db,id,versionId,1,value),audit(db,user.id,'task_created',id)]);return json({id,current_version_id:versionId,status:'draft'},201);
 }
 const match=path.match(/^\/tasks\/([^/]+)(?:\/(publish|mentors))?$/);if(!match)return null;
 const [,id,operation]=match;const task=await taskAccess(db,user,id,{manage:method!=='GET'||operation==='mentors'});
 if(!operation&&method==='GET'){const version=await db.prepare('SELECT * FROM task_versions WHERE id=?').bind(task.current_version_id).first();return json({...task,version:{...version,checkpoints:JSON.parse(version.checkpoints)}});}
 if(!operation&&method==='PATCH') {
  const input=await body(request);onlyFields(input,['expectedVersionId','status','title','objective','requirements','checkpoints','courseSlug','deadline','caseId','moduleId','sceneId','sceneVersion','learningTopicId']);
  if(task.current_version_id!==input.expectedVersionId)fail(409,'version_conflict','任务已更新，请重新读取。');
  if(input.status==='archived'){const results=await db.batch([db.prepare("UPDATE tasks SET status='archived' WHERE id=? AND current_version_id=?").bind(id,input.expectedVersionId),auditChangedTask(db,user.id,'task_archived',id)]);if(!results[0].meta.changes)fail(409,'version_conflict','任务已更新，请重新读取。');return json({id,status:'archived'});}
  if(task.status==='archived')fail(409,'archived','归档任务不能修改。');
  const value=validateTask(input);if(value.sceneId)await getScene(db,value.sceneId,value.sceneVersion,{published:true});
  const current=await db.prepare('SELECT version FROM task_versions WHERE id=?').bind(task.current_version_id).first();const next=crypto.randomUUID();
  try {await db.batch([versionInsert(db,id,next,current.version+1,value),db.prepare('UPDATE tasks SET current_version_id=? WHERE id=? AND current_version_id=?').bind(next,id,task.current_version_id),audit(db,user.id,'task_version_created',id,{version:current.version+1})]);}catch(e){if(String(e.message).includes('task_archived'))fail(409,'archived','任务已归档，不能创建新版本。');if(String(e.message).includes('UNIQUE'))fail(409,'version_conflict','任务已更新，请重新读取。');throw e;}
  return json({id,current_version_id:next});
 }
 if(operation==='publish'&&method==='POST') {
  if(task.status==='archived')fail(409,'archived','归档任务不能重新发布。');const results=await db.batch([db.prepare("UPDATE tasks SET status='published' WHERE id=? AND current_version_id=? AND status!='archived'").bind(id,task.current_version_id),auditChangedTask(db,user.id,'task_published',id)]);if(!results[0].meta.changes)fail(409,'version_conflict','任务已更新或归档，请重新读取。');return json({id,status:'published'});
 }
 if(operation==='mentors'&&method==='GET'){const rows=await db.prepare('SELECT m.*,u.display_name FROM mentor_assignments m JOIN users u ON u.id=m.mentor_id WHERE m.task_id=?').bind(id).all();return json({items:rows.results});}
 if(operation==='mentors'&&['POST','DELETE'].includes(method)) {
  const input=await body(request);onlyFields(input,['mentorId','expiresAt']);const mentor=textField(input.mentorId,'导师ID',1,80);
  if(!await db.prepare("SELECT 1 FROM users u JOIN user_roles r ON u.id=r.user_id WHERE u.id=? AND u.status='active' AND r.role='mentor'").bind(mentor).first())fail(404,'not_found','导师账号不可用。');
  const expiry=input.expiresAt??null;if(expiry!==null&&(!Number.isSafeInteger(expiry)||expiry<=Date.now()))fail(400,'expiry','授权到期时间须晚于当前时间。');
  await db.batch([db.prepare('INSERT INTO mentor_assignments(task_id,mentor_id,expires_at,revoked_at) VALUES(?,?,?,?) ON CONFLICT(task_id,mentor_id) DO UPDATE SET expires_at=excluded.expires_at,revoked_at=excluded.revoked_at').bind(id,mentor,expiry,method==='DELETE'?Date.now():null),audit(db,user.id,method==='DELETE'?'mentor_revoked':'mentor_assigned',id,{mentorId:mentor})]);return json({saved:true});
 }
 return null;
}
