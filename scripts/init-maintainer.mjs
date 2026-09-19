import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { hashPassword } from '../server/auth/password.js';
const loginId = process.env.FAXUE_INIT_LOGIN;
const name = process.env.FAXUE_INIT_NAME;
const password = process.env.FAXUE_INIT_PASSWORD;
if (!loginId || !name || !password) throw new Error('须通过 FAXUE_INIT_LOGIN、FAXUE_INIT_NAME、FAXUE_INIT_PASSWORD 提供维护者信息；不接受命令行明文密码。');
if (!/^[A-Za-z0-9_-]{1,80}$/.test(loginId) || name.length > 100) throw new Error('账号或显示名格式无效。');
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
const id = crypto.randomUUID(); const now = Date.now(); const hash = await hashPassword(password);
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'faxue-init-'));
try {
  const file = path.join(temp, 'init.sql');
  fs.writeFileSync(file, `INSERT INTO users(id,login_id,display_name,password_hash,created_at) VALUES(${[id,loginId,name,hash,now].map(quote).join(',')});\nINSERT INTO user_roles(user_id,role) VALUES(${quote(id)},'admin');\nINSERT INTO audit_events(id,actor_id,action,target_id,created_at) VALUES(${quote(crypto.randomUUID())},${quote(id)},'maintainer_initialized',${quote(id)},${now});\n`, { mode: 0o600 });
  const result = spawnSync('npx', ['wrangler','d1','execute','DB','--local','--config','wrangler.jsonc','--file',file], { encoding: 'utf8', env: { ...process.env, FAXUE_INIT_PASSWORD: '' } });
  if (result.status) throw new Error('初始化失败；请确认本地迁移已执行且账号未存在。');
  console.log('本地维护者已建立。正式环境初始化须使用经核对的独立配置，不可直接复用本地测试库。');
} finally { fs.rmSync(temp, { recursive: true, force: true }); }
