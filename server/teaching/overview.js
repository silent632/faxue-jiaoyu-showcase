import { json } from '../http.js';
import { requireRole } from '../auth/session.js';
import { isAdmin } from '../permissions/teaching.js';
export async function overviewRoute({request,db,session,path}){
 if(path!=='/teaching/overview'||request.method!=='GET')return null;const user=requireRole(session,'teacher','admin');const scope=isAdmin(user)?'1=1':"EXISTS(SELECT 1 FROM group_members gm WHERE gm.group_id=g.id AND gm.user_id=? AND gm.kind='teacher')";const args=isAdmin(user)?[]:[user.id];
 const groups=await db.prepare(`SELECT count(*) AS n FROM groups g WHERE ${scope}`).bind(...args).first();
 const students=await db.prepare(`SELECT count(DISTINCT m.user_id) AS n FROM group_members m JOIN groups g ON g.id=m.group_id WHERE m.kind='student' AND ${scope}`).bind(...args).first();
 const tasks=await db.prepare(`SELECT count(*) AS n FROM tasks t JOIN groups g ON g.id=t.group_id WHERE ${scope}`).bind(...args).first();
 const submissions=await db.prepare(`SELECT s.status,count(*) AS n FROM submissions s JOIN learning_attempts a ON a.id=s.attempt_id JOIN task_versions v ON v.id=a.task_version_id JOIN tasks t ON t.id=v.task_id JOIN groups g ON g.id=t.group_id WHERE ${scope} AND s.sequence=(SELECT max(s2.sequence) FROM submissions s2 WHERE s2.attempt_id=s.attempt_id) GROUP BY s.status`).bind(...args).all();
 const unanswered=await db.prepare(`SELECT count(*) AS n FROM topics t JOIN boards b ON b.id=t.board_id JOIN groups g ON g.id=b.group_id WHERE ${scope} AND t.status='visible' AND NOT EXISTS(SELECT 1 FROM replies r WHERE r.topic_id=t.id AND r.status='visible')`).bind(...args).first();
 return json({groups:groups.n,students:students.n,tasks:tasks.n,latestSubmissions:Object.fromEntries(submissions.results.map(row=>[row.status,row.n])),unanswered:unanswered.n,asOf:Date.now()});
}
