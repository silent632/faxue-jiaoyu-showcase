import { fail,json,pagination } from '../http.js';
import { topicAccess } from './access.js';
import { taskAccess } from '../permissions/teaching.js';
async function visible(db,user,row){
 try{if(row.target_type==='topic'){const topic=await topicAccess(db,user,row.target_id);return {title:topic.title,href:'/community/topic/?id='+topic.id};}
 if(row.target_type==='submission'){const submission=await db.prepare('SELECT a.id AS attempt_id,a.user_id,v.task_id,v.title FROM submissions s JOIN learning_attempts a ON a.id=s.attempt_id JOIN task_versions v ON v.id=a.task_version_id WHERE s.id=?').bind(row.target_id).first();if(!submission)return null;if(submission.user_id!==user.id){const task=await taskAccess(db,user,submission.task_id);if(!task.manages&&!task.mentor)return null;}return {title:submission.title+'收到反馈',href:'/workspace/?id='+submission.attempt_id};}return null;}catch(error){if(error.status===403||error.status===404)return null;throw error;}
}
export async function notificationsRoute({request,db,session,path}){
 const user=session.user;
 if(path==='/notifications'&&request.method==='GET'){const {page,limit,offset}=pagination(new URL(request.url));const rows=await db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC,id LIMIT ? OFFSET ?').bind(user.id,limit,offset).all();const items=[];for(const row of rows.results){const target=await visible(db,user,row);if(target)items.push({...row,...target});}return json({items,page,limit});}
 const match=path.match(/^\/notifications\/([^/]+)\/read$/);if(match&&request.method==='POST'){const row=await db.prepare('SELECT * FROM notifications WHERE id=? AND user_id=?').bind(match[1],user.id).first();if(!row||!await visible(db,user,row))fail(404,'not_found','通知已不可见。');await db.prepare('UPDATE notifications SET read_at=? WHERE id=? AND user_id=?').bind(Date.now(),row.id,user.id).run();return json({read:true});}return null;
}
