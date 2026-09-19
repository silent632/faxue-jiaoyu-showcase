import { fail } from '../http.js';
import { isAdmin } from '../permissions/teaching.js';
export function boardScope(user,alias='b'){
 return isAdmin(user)?{where:'1=1',args:[]}:{where:`(${alias}.group_id IS NULL OR EXISTS(SELECT 1 FROM group_members m WHERE m.group_id=${alias}.group_id AND m.user_id=?) OR (?=1 AND EXISTS(SELECT 1 FROM board_guests bg WHERE bg.board_id=${alias}.id AND bg.user_id=?)))`,args:[user.id,Number(user.roles.includes('mentor')),user.id]};
}
export async function boardAccess(db,user,id){const scope=boardScope(user);const board=await db.prepare(`SELECT b.* FROM boards b WHERE b.id=? AND ${scope.where}`).bind(id,...scope.args).first();if(!board)fail(404,'not_found','未找到可访问的讨论分区。');return board;}
export async function topicAccess(db,user,id){const topic=await db.prepare('SELECT * FROM topics WHERE id=?').bind(id).first();if(!topic)fail(404,'not_found','未找到可访问的讨论。');await boardAccess(db,user,topic.board_id);if(topic.status==='hidden'&&!isAdmin(user))fail(404,'not_found','未找到可访问的讨论。');return topic;}
export async function replyAccess(db,user,id){const reply=await db.prepare('SELECT * FROM replies WHERE id=?').bind(id).first();if(!reply)fail(404,'not_found','回答不存在。');await topicAccess(db,user,reply.topic_id);if(reply.status!=='visible'&&!isAdmin(user))fail(404,'not_found','回答不存在。');return reply;}
