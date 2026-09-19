import bcrypt from 'bcryptjs';
// 名单预设与管理员创建分开，只有这里允许生成学号后六位的首次登录凭据。
export function validateRoster(students){
 if(!Array.isArray(students)||!students.length||students.length>5000)throw new Error('名单须包含1至5000条记录。');
 const seen=new Set();return students.map(row=>{
  if(!/^\d{6,20}$/.test(row.loginId)||typeof row.displayName!=='string'||!row.displayName.trim()||row.displayName.length>100||typeof row.groupName!=='string'||!row.groupName.trim()||row.groupName.length>100)throw new Error('名单字段无效。');
  if(seen.has(row.loginId))throw new Error('名单包含重复学号，请先处理冲突。');seen.add(row.loginId);return {loginId:row.loginId,displayName:row.displayName.trim(),groupName:row.groupName.trim()};
 });
}
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
export async function studentStatements(row,adminId){
 const id=crypto.randomUUID();const group=crypto.randomUUID();const now=Date.now();const hash=await bcrypt.hash(row.loginId.slice(-6),12);
 return [
 `INSERT INTO users(id,login_id,display_name,password_hash,must_change_password,created_at) SELECT ${[id,row.loginId,row.displayName,hash,1,now].map(quote).join(',')} WHERE NOT EXISTS(SELECT 1 FROM users WHERE login_id=${quote(row.loginId)})`,
 `INSERT INTO user_roles(user_id,role) SELECT ${quote(id)},'student' WHERE EXISTS(SELECT 1 FROM users WHERE id=${quote(id)})`,
 `INSERT INTO groups(id,name,created_by,created_at) SELECT ${[group,row.groupName,adminId,now].map(quote).join(',')} WHERE NOT EXISTS(SELECT 1 FROM groups WHERE name=${quote(row.groupName)})`,
 `INSERT INTO group_members(group_id,user_id,kind) SELECT (SELECT id FROM groups WHERE name=${quote(row.groupName)} ORDER BY created_at,id LIMIT 1),${quote(id)},'student' WHERE EXISTS(SELECT 1 FROM users WHERE id=${quote(id)})`,
 `INSERT INTO audit_events(id,actor_id,action,target_id,created_at) SELECT ${[crypto.randomUUID(),adminId,'student_provisioned',id,now].map(quote).join(',')} WHERE EXISTS(SELECT 1 FROM users WHERE id=${quote(id)})`,
 ];
}
