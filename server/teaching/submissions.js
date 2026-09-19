import { body, fail, json, onlyFields, pagination, textField } from '../http.js';
import { isAdmin,taskAccess } from '../permissions/teaching.js';
import { audit } from '../admin/routes.js';
async function readable(db,user,id){
 const row=await db.prepare('SELECT s.*,a.user_id,v.task_id FROM submissions s JOIN learning_attempts a ON a.id=s.attempt_id JOIN task_versions v ON v.id=a.task_version_id WHERE s.id=?').bind(id).first();
 if(!row)fail(404,'not_found','未找到可访问的提交。');
 if(row.user_id===user.id)return {...row,canReview:false};
 const task=await taskAccess(db,user,row.task_id);
 if(!task.manages&&!task.mentor)fail(404,'not_found','未找到可访问的提交。');return {...row,canReview:true};
}
export async function submissionsRoute({request,db,session,path}){
 const user=session.user;const method=request.method;const url=new URL(request.url);
 if((path==='/submissions'||path==='/exports/submissions')&&method==='GET'){
  const taskId=textField(url.searchParams.get('taskId'),'任务ID',1,80);const task=await taskAccess(db,user,taskId);
  if(!task.manages&&!task.mentor)fail(403,'forbidden','无权查看此任务的提交列表。');
  const exporting=path.startsWith('/exports/');if(exporting&&!task.manages)fail(403,'forbidden','导师不提供批量导出权限。');
  const {page,limit,offset}=pagination(url);const args=[taskId];let filter='v.task_id=?';
  const status=url.searchParams.get('status');if(status){if(!['submitted','changes_requested','reviewed'].includes(status))fail(400,'status','提交状态无效。');filter+=' AND s.status=?';args.push(status);}
  const q=url.searchParams.get('q');if(q){filter+=' AND (instr(u.display_name,?)>0 OR instr(u.login_id,?)>0)';args.push(q.slice(0,100),q.slice(0,100));}
  const base=`FROM submissions s JOIN learning_attempts a ON a.id=s.attempt_id JOIN task_versions v ON v.id=a.task_version_id JOIN users u ON u.id=a.user_id WHERE ${filter}`;
  const count=await db.prepare(`SELECT count(*) AS n ${base}`).bind(...args).first();
  if(exporting&&count.n>5000)fail(400,'export_too_large','结果超过5000条，请缩小筛选范围后导出。');
  const rows=await db.prepare(`SELECT s.id,s.sequence,s.status,s.created_at,s.late,v.title,v.version,u.display_name,u.login_id ${base} ORDER BY s.created_at DESC,s.id LIMIT ? OFFSET ?`).bind(...args,exporting?5000:limit,exporting?0:offset).all();
  if(exporting){await taskAccess(db,user,taskId,{manage:true});await audit(db,user.id,'submissions_exported',taskId,{rows:rows.results.length,status:status||null}).run();
   const cell=value=>'"'+String(value??'').replace(/^[=+\-@\t\r]/,"'$&").replaceAll('"','""')+'"';
   const lines=[['账号','姓名','任务','任务版本','提交状态','提交时间','修订次数'],...rows.results.map(row=>[row.login_id,row.display_name,row.title,row.version,row.status,new Date(row.created_at).toISOString(),row.sequence-1])];
   return new Response('\uFEFF'+lines.map(row=>row.map(cell).join(',')).join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="submissions.csv"','Cache-Control':'no-store'}});
  }return json({items:rows.results,total:count.n,page,limit});
 }
 const match=path.match(/^\/submissions\/([^/]+)(?:\/(reviews))?$/);if(!match)return null;
 const [,id,operation]=match;const submission=await readable(db,user,id);
 if(!operation&&method==='GET'){
  if(isAdmin(user)&&submission.user_id!==user.id)await audit(db,user.id,'submission_viewed',id).run();
  const reviews=await db.prepare('SELECT r.*,u.display_name FROM reviews r JOIN users u ON u.id=r.reviewer_id WHERE r.submission_id=? ORDER BY r.created_at,r.id').bind(id).all();return json({...submission,snapshot:JSON.parse(submission.snapshot),reviews:reviews.results.map(row=>({...row,checkpoints:JSON.parse(row.checkpoints)}))});
 }
 if(operation==='reviews'&&method==='POST'){
  if(!submission.canReview)fail(403,'forbidden','不能点评自己的提交。');
  if(!user.roles.some(role=>['teacher','mentor'].includes(role)))fail(403,'teaching_role','请由具有教师或导师身份的账号填写教学反馈。');
  const input=await body(request);onlyFields(input,['action','summary','checkpoints']);if(!['reviewed','changes_requested'].includes(input.action))fail(400,'review_action','请选择反馈状态。');
  const summary=textField(input.summary,'具体反馈',1,5000);const version=JSON.parse(submission.snapshot).taskVersion;const expected=JSON.parse(version.checkpoints);
  if(!Array.isArray(input.checkpoints)||input.checkpoints.length!==expected.length)fail(400,'checkpoints','请逐项填写检查点反馈。');
  const checkpoints=input.checkpoints.map((value,index)=>({label:expected[index],feedback:textField(value,'检查点反馈',1,1000)}));const reviewId=crypto.randomUUID();const now=Date.now();
  await db.batch([db.prepare('INSERT INTO reviews(id,submission_id,reviewer_id,reviewer_role,action,checkpoints,summary,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(reviewId,id,user.id,user.roles.includes('teacher')?'teacher':'mentor',input.action,JSON.stringify(checkpoints),summary,now),db.prepare('UPDATE submissions SET status=? WHERE id=?').bind(input.action,id),db.prepare("INSERT INTO notifications(id,user_id,event_key,target_type,target_id,created_at) VALUES(?,?,?,'submission',?,?)").bind(crypto.randomUUID(),submission.user_id,'review:'+reviewId,id,now)]);return json({id:reviewId,status:input.action},201);
 }
 return null;
}
