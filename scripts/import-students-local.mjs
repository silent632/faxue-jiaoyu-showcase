import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateRoster,studentStatements } from '../lib/student-provisioning.js';
const [file,adminLogin]=process.argv.slice(2);
if(!file||!adminLogin)throw new Error('用法：node scripts/import-students-local.mjs 仓库外的students.json 本地管理员账号');
const full=path.resolve(file);if(full.startsWith(process.cwd()+path.sep))throw new Error('不得从代码仓库导入个人名单。');
const config=JSON.parse(fs.readFileSync('wrangler.jsonc','utf8'));if(config.name!=='faxue-local-only')throw new Error('此脚本仅导入本地专用数据库。');
const students=validateRoster(JSON.parse(fs.readFileSync(full,'utf8')).students);
const execute=args=>{const result=spawnSync('npx',['wrangler','d1','execute','DB','--local','--config','wrangler.jsonc',...args],{encoding:'utf8',maxBuffer:20*1024*1024,env:{...process.env,WRANGLER_SEND_METRICS:'false'}});if(result.status)throw new Error('本地数据库操作失败，请检查迁移和配置。');return result.stdout;};
const users=JSON.parse(execute(['--command','SELECT u.id,u.login_id,u.status,r.role FROM users u LEFT JOIN user_roles r ON u.id=r.user_id','--json']))[0].results;
const admin=users.find(user=>user.login_id===adminLogin&&user.role==='admin'&&user.status==='active');if(!admin)throw new Error('未找到有效的本地管理员。');
const existing=new Set(users.map(user=>user.login_id));const pending=students.filter(row=>!existing.has(row.loginId));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'faxue-students-'));
try{
 let processed=0;
 for(let i=0;i<pending.length;i+=25){
  const statements=[];for(const row of pending.slice(i,i+25))statements.push(...await studentStatements(row,admin.id));
  const sql=path.join(temp,'batch.sql');fs.writeFileSync(sql,statements.join(';\n')+';\n',{mode:0o600});execute(['--file',sql]);processed+=Math.min(25,pending.length-i);console.log(`本地预设进度：${processed}/${pending.length}`);
 }
 const total=JSON.parse(execute(['--command',"SELECT count(*) AS n FROM users WHERE must_change_password=1",'--json']))[0].results[0].n;
 const actual=JSON.parse(execute(['--command',`SELECT u.login_id,u.display_name,u.must_change_password,(SELECT json_group_array(role) FROM user_roles WHERE user_id=u.id) AS roles,(SELECT json_group_array(g.name) FROM group_members m JOIN groups g ON g.id=m.group_id WHERE m.user_id=u.id AND m.kind='student') AS groups FROM users u`,'--json']))[0].results;
 const matches=row=>actual.some(user=>user.login_id===row.loginId&&user.display_name===row.displayName&&JSON.parse(user.roles).includes('student')&&JSON.parse(user.groups).includes(row.groupName));
 if(pending.some(row=>!matches(row)))throw new Error('部分新账号的身份或班级关系未通过回读核对，请检查后再交付。');
 console.log(JSON.stringify({created:pending.length,skippedExisting:students.length-pending.length,matchedRosterProfiles:students.filter(matches).length,mustChangePasswordAccounts:total}));
}finally{fs.rmSync(temp,{recursive:true,force:true});}
