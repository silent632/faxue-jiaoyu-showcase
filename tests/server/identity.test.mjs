import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Miniflare,convertV4MiniflareOptions } from 'miniflare';
import { build } from 'esbuild';
import { createStaticServer } from '../../scripts/serve-static.mjs';
import { chromium } from 'playwright';
import { createSession } from '../../server/auth/session.js';
import { hashPassword } from '../../server/auth/password.js';
process.env.WRANGLER_SEND_METRICS='false';
const root = process.cwd();
fs.mkdirSync('output',{recursive:true});
const temp = fs.mkdtempSync(path.join(root, 'output', 'identity-test-'));
const state = path.join(temp,'state');
let origin;let service;let staticServer;let database;
const adminId = crypto.randomUUID(); const studentId = crypto.randomUUID();
const password = 'Test-only!Identity-2026';
const teacherId=crypto.randomUUID();const otherTeacherId=crypto.randomUUID();const otherStudentId=crypto.randomUUID();const mentorId=crypto.randomUUID();
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
async function call(route, { method='GET', data, auth, originHeader=origin, csrf=true, headers:extraHeaders={} } = {}) {
  const headers = { Origin:originHeader,...extraHeaders };
  if (data !== undefined) headers['Content-Type']='application/json';
  if (auth) { headers.Cookie=auth.cookie; if (csrf) headers['X-CSRF-Token']=auth.csrfToken; }
  const response = await fetch(origin+'/api'+route,{method,headers,body:data===undefined?undefined:JSON.stringify(data)});
  return { response, status:response.status, payload:await response.json() };
}
async function login(loginId='test-admin') {
  const result=await call('/auth/login',{method:'POST',data:{loginId,password}});
  assert.equal(result.status,200,JSON.stringify(result.payload));
  return { cookie:result.response.headers.get('set-cookie').split(';')[0],csrfToken:result.payload.data.csrfToken };
}
async function applyMigrations(database,{triggers=true}={}){
  for(const file of fs.readdirSync('migrations').filter(name=>name.endsWith('.sql')).sort()){
   let sql='';for(const line of fs.readFileSync(path.join('migrations',file),'utf8').split('\n')){if(line.trim().startsWith('--'))continue;sql+=line+'\n';if(line.trim().endsWith(';')&&(!/CREATE\s+TRIGGER/i.test(sql)||/END;\s*$/.test(sql))){if(triggers||!/CREATE\s+TRIGGER/i.test(sql))await database.prepare(sql).run();sql='';}}
   assert.equal(sql.trim(),'','迁移语句未完整执行：'+file);
  }
}
before(async () => {
  fs.mkdirSync('output',{recursive:true});
  const bundled=await build({stdin:{contents:`import { onRequest } from './functions/api/[[path]].js';export default {fetch(request,env){return new URL(request.url).pathname.startsWith('/api/')?onRequest({request,env}):env.ASSETS.fetch(request);}}`,resolveDir:root,sourcefile:'test-worker.js'},bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'});
  staticServer=createStaticServer();await new Promise(resolve=>staticServer.listen(0,'127.0.0.1',resolve));const staticOrigin='http://127.0.0.1:'+staticServer.address().port;
  service=new Miniflare(convertV4MiniflareOptions({modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-09-14',port:0,d1Databases:{DB:'test-db'},d1Persist:state,serviceBindings:{ASSETS:request=>fetch(staticOrigin+new URL(request.url).pathname+new URL(request.url).search)}}));
  origin=(await service.ready).origin;database=await service.getD1Database('DB');
  await applyMigrations(database);
  const hash = await hashPassword(password); const now=Date.now();
  const sql = [
    `INSERT INTO users(id,login_id,display_name,password_hash,created_at) VALUES(${[adminId,'test-admin','隔离管理员',hash,now].map(quote).join(',')});`,
    `INSERT INTO users(id,login_id,display_name,password_hash,created_at) VALUES(${[studentId,'test-student','隔离学生',hash,now].map(quote).join(',')});`,
    `INSERT INTO user_roles(user_id,role) VALUES(${quote(adminId)},'admin'),(${quote(studentId)},'student');`,
    ...[[teacherId,'test-teacher','teacher'],[otherTeacherId,'other-teacher','teacher'],[otherStudentId,'other-student','student'],[mentorId,'test-mentor','mentor']].flatMap(([id,loginId,role])=>[
      `INSERT INTO users(id,login_id,display_name,password_hash,created_at) VALUES(${[id,loginId,loginId,hash,now].map(quote).join(',')});`,
      `INSERT INTO user_roles(user_id,role) VALUES(${quote(id)},${quote(role)});`,
    ]),
  ].join('\n');
  for(const statement of sql.split('\n').filter(Boolean))await database.prepare(statement).run();
  assert.equal((await call('/health')).status,200);
});
after(async()=>{
  await service?.dispose();
  if(staticServer)await new Promise(resolve=>staticServer.close(resolve));
  fs.rmSync(temp,{recursive:true,force:true});
});
test('匿名请求被拒绝且私有响应不可缓存',async()=>{
  const result=await call('/admin/users');assert.equal(result.status,401);assert.equal(result.response.headers.get('cache-control'),'no-store');
});
test('登录不接受伪造身份；错误凭据统一；跨站请求被拒绝',async()=>{
  const input={loginId:'test-student',password};
  assert.equal((await call('/auth/login',{method:'POST',data:{...input,role:'admin'}})).status,400);
  assert.equal((await call('/auth/login',{method:'POST',data:input,originHeader:'https://elsewhere.invalid'})).status,403);
  const wrong=await call('/auth/login',{method:'POST',data:{...input,password:'wrong'}});
  const absent=await call('/auth/login',{method:'POST',data:{loginId:'absent',password:'wrong'}});
  assert.equal(wrong.status,401);assert.equal(absent.payload.error.message,wrong.payload.error.message);
});
test('真实会话角色、CSRF和退出撤销',async()=>{
  const auth=await login('test-student');
  const me=await call('/auth/me',{auth});assert.deepEqual(me.payload.data.user.roles,['student']);
  assert.equal((await call('/admin/users',{auth})).status,403);
  assert.equal((await call('/auth/logout',{method:'POST',auth,csrf:false})).status,403);
  assert.equal((await call('/auth/logout',{method:'POST',auth})).status,200);
  assert.equal((await call('/auth/me',{auth})).status,401);
});
test('账号创建、密码重置和停用均真实持久化，并撤销旧会话',async()=>{
  const auth=await login();
  const created=await call('/admin/users',{method:'POST',auth,data:{loginId:'created-user',displayName:'新建测试用户',password,roles:['teacher']}});
  assert.equal(created.status,201,JSON.stringify(created.payload));const id=created.payload.data.id;
  const old=await login('created-user');
  const reset=await call('/admin/users/'+id,{method:'PATCH',auth,data:{password:'Different-test-password!'}});assert.equal(reset.status,200);
  assert.equal((await call('/auth/me',{auth:old})).status,401);
  const disabled=await call('/admin/users/'+id,{method:'PATCH',auth,data:{status:'disabled'}});assert.equal(disabled.status,200);assert.equal(disabled.payload.data.status,'disabled');
  const list=await call('/admin/users?q=created-user',{auth});assert.equal(list.payload.data.items.length,1);assert.ok(!JSON.stringify(list.payload).includes('password'));
});
test('最后一位管理员的停用和降权被数据库原子拒绝',async()=>{
  const auth=await login();
  for(const data of [{status:'disabled'},{roles:['student']},{displayName:'不应部分保存',roles:['teacher']}]) {
    const result=await call('/admin/users/'+adminId,{method:'PATCH',auth,data});assert.equal(result.status,409,JSON.stringify(result.payload));
  }
  const me=await call('/auth/me',{auth});assert.equal(me.payload.data.user.displayName,'隔离管理员');assert.deepEqual(me.payload.data.user.roles,['admin']);
});
test('敏感变更留下审计，日志不含密码',async()=>{
  const auth=await login();const result=await call('/admin/audit',{auth});assert.equal(result.status,200);assert.ok(result.payload.data.items.some(row=>row.action==='user_created'));assert.ok(!JSON.stringify(result.payload).includes(password));
});
test('教学闭环、跨组隔离、云草稿冲突、幂等提交、点评与修订',async()=>{
  const teacher=await login('test-teacher');const other=await login('other-teacher');const student=await login('test-student');const outsider=await login('other-student');const mentor=await login('test-mentor');
  const created=await call('/groups',{method:'POST',auth:teacher,data:{name:'法理学讨论一组'}});assert.equal(created.status,201,JSON.stringify(created.payload));const groupId=created.payload.data.id;
  assert.equal((await call('/groups/'+groupId+'/members',{method:'POST',auth:teacher,data:{userId:studentId,kind:'student'}})).status,200);
  assert.equal((await call('/groups/'+groupId+'/members',{auth:other})).status,404);
  const privateBoard=await call('/boards',{method:'POST',auth:teacher,data:{name:'小组内部讨论',groupId}});assert.equal(privateBoard.status,201);const boardId=privateBoard.payload.data.id;
  const privateTopic=await call('/topics',{method:'POST',auth:student,data:{boardId,title:'只能组内查看的问题',body:'这个问题的标题与正文都不能被其他小组搜索到。'}});assert.equal(privateTopic.status,201);assert.equal((await call('/topics/'+privateTopic.payload.data.id,{auth:outsider})).status,404);assert.equal((await call('/topics?q='+encodeURIComponent('只能组内查看'),{auth:outsider})).payload.data.total,0);
  assert.equal((await call('/boards/'+boardId+'/guests',{method:'POST',auth:teacher,data:{mentorId}})).status,200);assert.equal((await call('/topics/'+privateTopic.payload.data.id,{auth:mentor})).status,200);assert.equal((await call('/boards/'+boardId+'/guests',{method:'DELETE',auth:teacher,data:{mentorId}})).status,200);assert.equal((await call('/topics/'+privateTopic.payload.data.id,{auth:mentor})).status,404);
  const taskData={groupId,title:'规范与事实的对应',objective:'练习解释理由',requirements:'完成规范前提、事实对应、结论和反思',checkpoints:['规范与事实的对应是否清楚'],caseId:'case-0001',moduleId:'exp-reasoning',deadline:Date.now()-10000};
  const task=await call('/tasks',{method:'POST',auth:teacher,data:taskData});assert.equal(task.status,201,JSON.stringify(task.payload));const taskId=task.payload.data.id;
  assert.equal((await call('/tasks/'+taskId,{auth:student})).status,404);
  assert.equal((await call('/tasks/'+taskId+'/publish',{method:'POST',auth:teacher})).status,200);
  const started=await call('/attempts',{method:'POST',auth:student,data:{taskId}});assert.equal(started.status,201,JSON.stringify(started.payload));const attemptId=started.payload.data.id;
  assert.equal((await call('/attempts/'+attemptId+'/draft',{auth:outsider})).status,404);
  assert.equal((await call('/attempts/'+attemptId+'/draft',{auth:teacher})).status,404);
  const initial=await call('/attempts/'+attemptId,{auth:student});assert.equal(initial.payload.data.draft.revision,0);
  const record={interactionData:{majorPremise:'规范前提',minorPremise:'事实对应',conclusion:'形成判断',subsumption:'解释对应过程'}};
  const saved=await call('/attempts/'+attemptId+'/draft',{method:'PUT',auth:student,data:{revision:0,content:record}});assert.equal(saved.status,200);assert.equal(saved.payload.data.revision,1);
  assert.equal((await call('/attempts/'+attemptId+'/draft',{method:'PUT',auth:student,data:{revision:0,content:{}}})).status,409);
  const submitted=await call('/attempts/'+attemptId+'/submissions',{method:'POST',auth:student,headers:{'Idempotency-Key':'submit-once-1234'},data:{revision:1}});assert.equal(submitted.status,201,JSON.stringify(submitted.payload));const submissionId=submitted.payload.data.id;
  const retry=await call('/attempts/'+attemptId+'/submissions',{method:'POST',auth:student,headers:{'Idempotency-Key':'submit-once-1234'},data:{revision:1}});assert.equal(retry.payload.data.id,submissionId);
  assert.equal((await call('/submissions/'+submissionId,{auth:other})).status,404);
  assert.equal((await call('/submissions?taskId='+taskId,{auth:outsider})).status,404);
  assert.equal((await call('/exports/submissions?taskId='+taskId,{auth:other})).status,404);
  const view=await call('/submissions/'+submissionId,{auth:teacher});assert.equal(view.status,200);assert.equal(view.payload.data.late,1);
  await database.prepare('UPDATE users SET display_name=? WHERE id=?').bind('=公式型显示名',studentId).run();const exported=await fetch(origin+'/api/exports/submissions?taskId='+taskId,{headers:{Cookie:teacher.cookie}});assert.equal(exported.status,200);const csv=await exported.text();assert.ok(csv.includes("'=公式型显示名"));assert.ok(!csv.includes('涵摄反思'));await database.prepare('UPDATE users SET display_name=? WHERE id=?').bind('隔离学生',studentId).run();
  const teacherOverview=await call('/teaching/overview',{auth:teacher});assert.equal(teacherOverview.payload.data.latestSubmissions.submitted,1);const otherOverview=await call('/teaching/overview',{auth:other});assert.equal(otherOverview.payload.data.groups,0);assert.deepEqual(otherOverview.payload.data.latestSubmissions,{});

  const reviewed=await call('/submissions/'+submissionId+'/reviews',{method:'POST',auth:teacher,data:{action:'changes_requested',summary:'请补充规范适用与事实对应的具体解释。',checkpoints:['需要说明涵摄过程']}});assert.equal(reviewed.status,201,JSON.stringify(reviewed.payload));
  const feedback=await call('/submissions/'+submissionId,{auth:student});assert.equal(feedback.payload.data.reviews.length,1);
  const revised={...record,interactionData:{...record.interactionData,subsumption:'逐项说明规范条件与事实的对应。'},feedbackReference:reviewed.payload.data.id,revisionNote:'根据反馈补充涵摄说明',revisionNoteConfirmed:true};
  assert.equal((await call('/attempts/'+attemptId+'/draft',{method:'PUT',auth:student,data:{revision:1,content:revised}})).status,200);
  const resub=await call('/attempts/'+attemptId+'/submissions',{method:'POST',auth:student,headers:{'Idempotency-Key':'resubmit-once-1234'},data:{revision:2}});assert.equal(resub.status,201);assert.equal(resub.payload.data.sequence,2);
  assert.equal((await call('/tasks/'+taskId+'/mentors',{method:'POST',auth:teacher,data:{mentorId}})).status,200);
  assert.equal((await call('/submissions/'+submissionId,{auth:mentor})).status,200);
  assert.equal((await call('/exports/submissions?taskId='+taskId,{auth:mentor})).status,403);
  assert.equal((await call('/tasks/'+taskId+'/mentors',{method:'DELETE',auth:teacher,data:{mentorId}})).status,200);
  assert.equal((await call('/submissions/'+submissionId,{auth:mentor})).status,404);
  const versioned=await call('/tasks/'+taskId,{method:'PATCH',auth:teacher,data:{...taskData,groupId:undefined,expectedVersionId:task.payload.data.current_version_id,title:'更新后的任务要求'}});assert.equal(versioned.status,200,JSON.stringify(versioned.payload));
  const old=await call('/attempts/'+attemptId,{auth:student});assert.equal(old.payload.data.version.title,taskData.title);
  assert.equal((await call('/tasks/'+taskId,{method:'PATCH',auth:teacher,data:{status:'archived',expectedVersionId:versioned.payload.data.current_version_id}})).status,200);
  assert.equal((await call('/attempts/'+attemptId+'/submissions',{method:'POST',auth:student,headers:{'Idempotency-Key':'archived-submit-1234'},data:{revision:2}})).status,409);
});
test('交流区回答追问、通知、投票与管理状态同步',async()=>{
 const author=await login('test-student');const responder=await login('other-student');const admin=await login();
 const boards=await call('/boards',{auth:author});assert.ok(boards.payload.data.items.length>=3);
 const created=await call('/topics',{method:'POST',auth:author,data:{boardId:boards.payload.data.items[0].id,title:'法律理由应当如何展开',body:'<script>alert(1)</script>这是一条用于验证纯文本展示的学习问题。'}});assert.equal(created.status,201,JSON.stringify(created.payload));const topicId=created.payload.data.id;
 const reply=await call('/topics/'+topicId+'/replies',{method:'POST',auth:responder,data:{body:'先区分事实判断与价值判断，再检验理由。'}});assert.equal(reply.status,201);const replyId=reply.payload.data.id;
 assert.equal((await call('/replies/'+replyId+'/helpful',{method:'POST',auth:responder})).status,400);
 for(let i=0;i<2;i++)assert.equal((await call('/replies/'+replyId+'/helpful',{method:'POST',auth:author})).status,200);
 const list=await call('/topics/'+topicId+'/replies',{auth:author});assert.equal(list.payload.data.items[0].helpful,1);
 const follow=await call('/topics/'+topicId+'/replies',{method:'POST',auth:author,data:{parentId:replyId,body:'能否再举一个例子说明？'}});assert.equal(follow.status,201);
 assert.equal((await call('/topics/'+topicId+'/replies',{method:'POST',auth:responder,data:{parentId:follow.payload.data.id,body:'不能再嵌套一层'}})).status,400);
 const notifications=await call('/notifications',{auth:author});assert.ok(notifications.payload.data.items.some(row=>row.target_id===topicId));
 assert.equal((await call('/reports',{method:'POST',auth:author,data:{targetType:'reply',targetId:replyId,reason:'请管理员核对测试回答'}})).status,201);
 assert.equal((await call('/admin/moderation',{method:'POST',auth:admin,data:{targetType:'reply',targetId:replyId,action:'hide',reason:'隔离环境验证隐藏'}})).status,200);
 assert.equal((await call('/replies/'+replyId,{method:'PATCH',auth:responder,data:{body:'试图绕过隐藏'}})).status,404);
 const hidden=await call('/topics/'+topicId+'/replies',{auth:author});assert.equal(hidden.payload.data.items[0].body,'这条回答已不可见。');
 assert.equal((await call('/admin/moderation',{method:'POST',auth:admin,data:{targetType:'topic',targetId:topicId,action:'hide',reason:'隔离环境验证可见性'}})).status,200);
 assert.equal((await call('/topics/'+topicId,{auth:author})).status,404);
 assert.ok(!(await call('/notifications',{auth:author})).payload.data.items.some(row=>row.target_id===topicId));
 assert.equal((await call('/admin/moderation',{method:'POST',auth:admin,data:{targetType:'topic',targetId:topicId,action:'restore',reason:'恢复讨论用于锁定验证'}})).status,200);
 assert.equal((await call('/admin/moderation',{method:'POST',auth:admin,data:{targetType:'topic',targetId:topicId,action:'lock',reason:'锁定讨论用于验证'}})).status,200);
 assert.equal((await call('/topics/'+topicId+'/replies',{method:'POST',auth:author,data:{body:'锁定后不能回复'}})).status,409);
});
test('删除问题只移除正文，保留回答且继续执行分区权限',async()=>{
 const author=await login('other-student');const responder=await login('test-student');const admin=await login();
 const boards=(await call('/boards',{auth:author})).payload.data.items;
 const topic=await call('/topics',{method:'POST',auth:author,data:{boardId:boards[0].id,title:'删除后保留讨论上下文',body:'本问题用于核验删除正文后回答仍可访问。',resourceType:'case',resourceId:'case-0001'}});assert.equal(topic.status,201);const id=topic.payload.data.id;
 const answer=await call('/topics/'+id+'/replies',{method:'POST',auth:responder,data:{body:'已经发表的回答需要继续保留。'}});assert.equal(answer.status,201);
 assert.equal((await call('/topics/'+id,{method:'DELETE',auth:author})).status,200);
 const tombstone=await call('/topics/'+id,{auth:responder});assert.equal(tombstone.status,200);assert.equal(tombstone.payload.data.body,'');assert.equal(tombstone.payload.data.resource_id,null);assert.equal(tombstone.payload.data.locked,1);
 assert.equal((await call('/topics/'+id+'/replies',{auth:responder})).payload.data.items[0].body,'已经发表的回答需要继续保留。');
 assert.equal((await call('/topics/'+id+'/replies',{method:'POST',auth:responder,data:{body:'不应再新增回答'}})).status,409);
 assert.equal((await call('/admin/moderation',{method:'POST',auth:admin,data:{targetType:'topic',targetId:id,action:'restore',reason:'尝试恢复已删除问题'}})).status,409);
 assert.equal((await call('/topics/'+id)).status,401);
});
test('场景发布、两种角色产出、任务提交与旧版本恢复',async()=>{
 const admin=await login();const student=await login('test-student');
 const published=await call('/admin/scenes/campus-hearing/publication',{method:'POST',auth:admin,data:{version:'v1',published:true}});assert.equal(published.status,200,JSON.stringify(published.payload));
 const script=await call('/scenes/campus-hearing/versions/v1',{auth:student});assert.equal(script.status,200);assert.equal(script.payload.data.roles.length,2);
 const group=await call('/groups',{method:'POST',auth:admin,data:{name:'场景验证小组'}});const groupId=group.payload.data.id;
 assert.equal((await call('/groups/'+groupId+'/members',{method:'POST',auth:admin,data:{userId:studentId,kind:'student'}})).status,200);
 for(const role of ['student','management']){
  const task=await call('/tasks',{method:'POST',auth:admin,data:{groupId,title:'听证角色 '+role,objective:'回应异议',requirements:'完成听证流程',checkpoints:['理由是否充分'],sceneId:'campus-hearing',sceneVersion:'v1'}});assert.equal(task.status,201,JSON.stringify(task.payload));const taskId=task.payload.data.id;
  assert.equal((await call('/tasks/'+taskId+'/publish',{method:'POST',auth:admin})).status,200);
  const started=await call('/attempts',{method:'POST',auth:student,data:{taskId}});const id=started.payload.data.id;
  assert.equal((await call('/attempts/'+id+'/draft',{method:'PUT',auth:student,data:{revision:0,content:{scene:{role,node:7}}}})).status,200);
  assert.equal((await call('/attempts/'+id+'/submissions',{method:'POST',auth:student,headers:{'Idempotency-Key':'incomplete-scene-'+role},data:{revision:1}})).status,400);
  const scene={role,node:7,materialIds:['draft'],informationGap:'需要补充实测数据',issue:'是否应保留替代通行方式',considerationA:'通行效率',considerationB:'选择权及平等进入',initialProposal:'双轨试行',initialReason:'先比较实际效果',materialCitation:'draft',response:'通过小范围测试比较成本',alternative:'保留门禁卡',finalProposal:'试行并提供卡片通道',revisionReason:'回应成本问题并补充评估',reflection:'管理目标不能代替必要性的说明'};
  assert.equal((await call('/attempts/'+id+'/draft',{method:'PUT',auth:student,data:{revision:1,content:{scene}}})).status,200);
  assert.equal((await call('/attempts/'+id+'/draft',{method:'PUT',auth:student,data:{revision:2,content:{scene:{...scene,role:role==='student'?'management':'student'}}}})).status,409);
  const restart=await call('/attempts/'+id+'/restart',{method:'POST',auth:student,headers:{'Idempotency-Key':'role-restart-'+role},data:{role:role==='student'?'management':'student'}});assert.equal(restart.status,201,JSON.stringify(restart.payload));const newDraft=await call('/attempts/'+restart.payload.data.id,{auth:student});assert.equal(newDraft.payload.data.draft.content.scene.node,1);assert.equal(newDraft.payload.data.draft.content.scene.finalProposal,undefined);

  const submit=await call('/attempts/'+id+'/submissions',{method:'POST',auth:student,headers:{'Idempotency-Key':'complete-scene-'+role},data:{revision:2}});assert.equal(submit.status,201,JSON.stringify(submit.payload));
  const view=await call('/submissions/'+submit.payload.data.id,{auth:admin});assert.equal(view.payload.data.snapshot.record.scene.role,role);
 }
 assert.equal((await call('/admin/scenes/campus-hearing/publication',{method:'POST',auth:admin,data:{version:'v1',published:false}})).status,200);
 assert.equal((await call('/scenes/campus-hearing/versions/v1',{auth:student})).status,200);
 assert.equal((await call('/public/scenes/campus-hearing?version=v1')).status,404);
 assert.equal((await call('/admin/scenes/campus-hearing/publication',{method:'POST',auth:admin,data:{version:'v2',published:true}})).status,200);
 const publicVersion=await call('/public/scenes/campus-hearing');assert.equal(publicVersion.status,200);assert.equal(publicVersion.payload.data.version,'v2');
});
test('并发编辑与归档不能产生归档后版本或复活任务',async()=>{
 const session=await createSession(database,teacherId);const auth={cookie:'faxue_session='+session.token,csrfToken:session.csrfToken};
 const group=(await call('/groups',{method:'POST',auth,data:{name:'并发任务核验组'}})).payload.data.id;
 const data={groupId:group,title:'并发编辑保护',objective:'核验更新顺序',requirements:'保留版本',checkpoints:['说明理由'],caseId:'case-0001',moduleId:'exp-reasoning'};
 const task=(await call('/tasks',{method:'POST',auth,data})).payload.data;
 const [edit,archive]=await Promise.all([call('/tasks/'+task.id,{method:'PATCH',auth,data:{...data,groupId:undefined,expectedVersionId:task.current_version_id,title:'新版本要求'}}),call('/tasks/'+task.id,{method:'PATCH',auth,data:{expectedVersionId:task.current_version_id,status:'archived'}})]);
 assert.ok([200,409].includes(edit.status),JSON.stringify(edit));assert.ok([200,409].includes(archive.status),JSON.stringify(archive));assert.ok(edit.status===200||archive.status===200);
 const row=(await call('/tasks/'+task.id,{auth})).payload.data;
 if(archive.status===200){assert.equal(edit.status,409);assert.equal(row.version.version,1);assert.equal(row.status,'archived');assert.equal((await call('/tasks/'+task.id+'/publish',{method:'POST',auth})).status,409);}
 else {assert.equal(edit.status,200);assert.equal(row.version.version,2);assert.equal((await call('/tasks/'+task.id,{method:'PATCH',auth,data:{expectedVersionId:row.current_version_id,status:'archived'}})).status,200);}
 await assert.rejects(()=>database.prepare("UPDATE tasks SET status='published' WHERE id=?").bind(task.id).run(),/task_archived/);
});
test('历史记录需确认归属，幂等导入且不能冒充课程提交',async()=>{
 const student=await login('test-student');const other=await login('other-student');
 const record={kind:'experiment',caseId:'case-0001',moduleId:'exp-reasoning',record:{interactionData:{majorPremise:'历史规范',minorPremise:'历史事实',conclusion:'历史结论',subsumption:'历史说明'}}};
 const preview=await call('/learning/import/preview',{method:'POST',auth:student,data:{records:[record]}});assert.equal(preview.status,200,JSON.stringify(preview.payload));const data={previewId:preview.payload.data.previewId,fingerprints:preview.payload.data.items.map(row=>row.fingerprint),confirmed:true};
 assert.equal((await call('/learning/import/commit',{method:'POST',auth:student,data:{...data,confirmed:false}})).status,400);
 assert.equal((await call('/learning/import/commit',{method:'POST',auth:other,data})).status,409);
 const committed=await call('/learning/import/commit',{method:'POST',auth:student,data});assert.equal(committed.status,200);const id=committed.payload.data.items[0].id;
 const again=await call('/learning/import/commit',{method:'POST',auth:student,data});assert.equal(again.payload.data.items[0].id,id);
 const content=await call('/attempts/'+id,{auth:student});assert.equal(content.payload.data.attempt.provenance,'imported');assert.equal(content.payload.data.attempt.task_version_id,null);
 assert.equal((await call('/attempts/'+id+'/submissions',{method:'POST',auth:student,headers:{'Idempotency-Key':'forged-history-12345'},data:{revision:0}})).status,400);
 const changed={...record,record:{...record.record,revisionNote:'另一个版本'}};const next=await call('/learning/import/preview',{method:'POST',auth:student,data:{records:[changed]}});assert.notEqual(next.payload.data.items[0].fingerprint,data.fingerprints[0]);
});
test('真实浏览器：登录后台、论坛纯文本与听证双模式完整体验',{skip:process.env.FAXUE_BROWSER_TESTS!=='1'},async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});const context=await browser.newContext({viewport:{width:1280,height:1000}});await context.addInitScript(()=>localStorage.setItem('faxue-welcome-dismissed','2026-welcome-1'));const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(origin+'/login/');await page.getByRole('textbox',{name:'账号',exact:true}).fill('test-admin');await page.getByRole('textbox',{name:'密码',exact:true}).fill(password);await page.getByRole('button',{name:'登录',exact:true}).click();await page.getByRole('link',{name:'进入工作台',exact:true}).click();await page.getByRole('link',{name:'管理账号',exact:true}).click();await page.getByRole('heading',{name:'账号列表',exact:true}).waitFor();assert.ok(await page.getByText('隔离管理员',{exact:true}).count()>0);
  await page.goto(origin+'/community/');await page.getByRole('link',{name:'法律理由应当如何展开',exact:true}).click();await page.getByText('<script>alert(1)</script>这是一条用于验证纯文本展示的学习问题。',{exact:true}).waitFor();
  await page.goto(origin+'/experiments/scenes/campus-hearing/');await page.getByRole('radio').last().focus();await page.keyboard.press('Space');await page.getByRole('button',{name:'继续听证',exact:true}).press('Enter');await page.getByRole('heading',{name:'管理方案代表的工作备忘 · 你的角色材料',exact:true}).waitFor();assert.equal(await page.getByText('学生代表的访谈备忘',{exact:false}).count(),0);await page.getByRole('checkbox',{name:'将此材料纳入考虑'}).first().check();await page.getByRole('textbox',{name:'至少一处仍需确认的信息'}).fill('需要补充通行效率实测与退出程序。');await page.getByRole('button',{name:'继续听证',exact:true}).press('Enter');await page.getByRole('textbox',{name:'一个可以讨论的争点'}).fill('是否需要保留门禁卡');await page.getByRole('textbox',{name:'考虑一及其理由'}).fill('效率改善');await page.getByRole('textbox',{name:'与之冲突的考虑及其理由'}).fill('不同学生的平等通行');await page.getByRole('button',{name:'标准模式',exact:true}).press('Enter');assert.equal(await page.getByRole('textbox',{name:'一个可以讨论的争点'}).inputValue(),'是否需要保留门禁卡');await page.reload();assert.equal(await page.getByRole('textbox',{name:'一个可以讨论的争点'}).inputValue(),'是否需要保留门禁卡');await page.getByRole('button',{name:'继续听证',exact:true}).press('Enter');await page.getByRole('textbox',{name:'初步方案',exact:true}).fill('双轨试行');await page.getByRole('textbox',{name:'方案的理由',exact:true}).fill('先核对实际效果');await page.getByRole('combobox',{name:'关联材料',exact:true}).selectOption('draft');await page.getByRole('button',{name:'继续听证',exact:true}).press('Enter');await page.getByRole('textbox',{name:'回应这项异议',exact:true}).fill('通过小范围试验核对维护成本');await page.getByRole('textbox',{name:'一个替代方案及考虑',exact:true}).fill('保留门禁卡通道');await page.getByRole('button',{name:'继续听证',exact:true}).press('Enter');await page.getByRole('textbox',{name:'最终方案',exact:true}).fill('双轨试行并设公开评估');await page.getByRole('textbox',{name:'修改或保留观点的理由',exact:true}).fill('回应成本疑虑并保留选择');await page.getByRole('textbox',{name:'这次讨论改变或加深了什么理解？',exact:true}).fill('管理目标仍需要可检验的理由');await page.getByRole('button',{name:'继续听证',exact:true}).press('Enter');await page.getByRole('heading',{name:'归档与提交',exact:true}).waitFor();
  for(const width of [375,390,768,1280])for(const colorScheme of ['light','dark']){await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme});await page.evaluate(()=>Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{}))));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),`${width}/${colorScheme}场景越界`);}
  await page.setViewportSize({width:1280,height:1000});await page.evaluate(async()=>{scrollTo(0,0);await Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{})));});await page.screenshot({path:'output/verification/scene-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:1000});await page.waitForFunction(()=>document.querySelector('.sidenav').getBoundingClientRect().right<=1);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'output/verification/scene-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
 }finally{await context.close();await browser.close();}
});
test('浏览器教学闭环：跨设备保存冲突、反馈修订与未同步稿退出保护',{skip:process.env.FAXUE_BROWSER_TESTS!=='1'},async()=>{
 const makeAuth=async id=>{const session=await createSession(database,id);return {cookie:'faxue_session='+session.token,csrfToken:session.csrfToken};};
 const teacher=await makeAuth(teacherId);const student=await makeAuth(studentId);
 const group=(await call('/groups',{method:'POST',auth:teacher,data:{name:'浏览器闭环核验组'}})).payload.data.id;
 assert.equal((await call('/groups/'+group+'/members',{method:'POST',auth:teacher,data:{userId:studentId,kind:'student'}})).status,200);
 const task=(await call('/tasks',{method:'POST',auth:teacher,data:{groupId:group,title:'浏览器中的完整研习',objective:'验证真实保存与反馈',requirements:'完成规范与事实对应',checkpoints:['理由是否清楚'],caseId:'case-0001',moduleId:'exp-reasoning'}})).payload.data.id;
 assert.equal((await call('/tasks/'+task+'/publish',{method:'POST',auth:teacher})).status,200);
 const starts=await Promise.all(Array.from({length:4},()=>call('/attempts',{method:'POST',auth:student,data:{taskId:task}})));assert.ok(starts.every(row=>[200,201].includes(row.status)));assert.equal(new Set(starts.map(row=>row.payload.data.id)).size,1);const attempt=starts[0].payload.data.id;
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});const contexts=[];const errors=[];
 const pageFor=async auth=>{const context=await browser.newContext({viewport:{width:1280,height:1000},acceptDownloads:true});contexts.push(context);await context.addInitScript(()=>localStorage.setItem('faxue-welcome-dismissed','2026-welcome-1'));await context.addCookies([{name:'faxue_session',value:auth.cookie.split('=')[1],url:origin}]);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>dialog.type()==='beforeunload'?dialog.accept():dialog.dismiss());return page;};
 try{
  const a=await pageFor(student);const b=await pageFor(student);const t=await pageFor(teacher);
  await a.goto(origin+'/workspace/?id='+attempt);await b.goto(origin+'/workspace/?id='+attempt);
  await a.getByRole('textbox',{name:'规范前提',exact:true}).fill('规范要求应当具备可说明的依据');await a.getByRole('textbox',{name:'事实对应',exact:true}).fill('逐项核对案件事实');await a.getByRole('textbox',{name:'判断结论',exact:true}).fill('暂时支持该项判断');await a.getByRole('textbox',{name:'涵摄反思',exact:true}).fill('仍需解释规则适用条件');await a.getByRole('button',{name:'保存到云端',exact:true}).click();await a.getByText('已保存到云端。',{exact:true}).waitFor();
  await b.getByRole('textbox',{name:'规范前提',exact:true}).fill('另一设备保留的不同观点');await b.getByRole('button',{name:'保存到云端',exact:true}).click();await b.getByRole('button',{name:'查看最新云端稿',exact:true}).waitFor();assert.equal(await b.getByRole('textbox',{name:'规范前提',exact:true}).inputValue(),'另一设备保留的不同观点');
  await b.reload();await b.getByRole('button',{name:'恢复本地稿到编辑区',exact:true}).click();await b.getByRole('button',{name:'保存到云端',exact:true}).click();await b.getByRole('button',{name:'查看最新云端稿',exact:true}).click();await b.getByRole('heading',{name:'云端稿 · 版本 1',exact:true}).waitFor();
  const download=b.waitForEvent('download');await b.getByRole('button',{name:'导出当前稿并采用云端稿',exact:true}).click();assert.equal((await download).suggestedFilename(),'我的学习稿.json');assert.equal(await b.getByRole('textbox',{name:'规范前提',exact:true}).inputValue(),'规范要求应当具备可说明的依据');
  await a.getByRole('button',{name:'提交给教师',exact:true}).click();await a.getByText('已提交，教师可以查看这份稿件。',{exact:true}).waitFor();
  await t.goto(origin+'/teacher/submissions/?id='+task);await t.getByRole('button',{name:'隔离学生 · 第1次提交',exact:true}).click();await t.getByRole('textbox',{name:'理由是否清楚',exact:true}).fill('请补充对应关系');await t.getByRole('textbox',{name:'具体意见',exact:true}).fill('请说明每一个规范条件对应的事实。');await t.getByRole('button',{name:'保存反馈',exact:true}).click();await t.getByText('反馈已保存，学生可以查看并继续修订。',{exact:true}).waitFor();
  await a.getByRole('button',{name:'第1次提交 · 查看反馈',exact:true}).click();await a.getByRole('button',{name:'依据这条反馈修订',exact:true}).click();await a.getByRole('textbox',{name:'涵摄反思',exact:true}).fill('已经逐项补充规范条件与事实之间的对应。');await a.getByRole('textbox',{name:'修改或保留理由',exact:true}).fill('依据教师意见补充了对应过程');await a.getByRole('button',{name:'保存到云端',exact:true}).click();await a.getByText('已保存到云端。',{exact:true}).waitFor();await a.getByRole('button',{name:'提交给教师',exact:true}).click();await a.getByRole('button',{name:'第2次提交 · 查看反馈',exact:true}).waitFor();
  await t.reload();await t.getByRole('button',{name:'隔离学生 · 第2次提交',exact:true}).click();await t.getByRole('textbox',{name:'理由是否清楚',exact:true}).fill('对应关系已补全');await t.getByRole('textbox',{name:'具体意见',exact:true}).fill('修改理由明确，已完成本次复核。');await t.getByRole('combobox',{name:'处理结果',exact:true}).selectOption('reviewed');await t.getByRole('button',{name:'保存反馈',exact:true}).click();await t.getByText('反馈已保存，学生可以查看并继续修订。',{exact:true}).waitFor();
  const submissions=(await call('/attempts/'+attempt,{auth:student})).payload.data.submissions;assert.equal(submissions.length,2);assert.equal(submissions[0].status,'reviewed');assert.equal(submissions[1].status,'changes_requested');
  await b.getByRole('textbox',{name:'涵摄反思',exact:true}).fill('保留到退出前的未同步稿');await b.goto(origin+'/login/');await b.getByRole('button',{name:'退出登录',exact:true}).click();await b.getByRole('button',{name:'导出本机未同步稿并退出',exact:true}).waitFor();assert.equal((await call('/auth/me',{auth:student})).status,200);const backup=b.waitForEvent('download');await b.getByRole('button',{name:'导出本机未同步稿并退出',exact:true}).click();assert.equal((await backup).suggestedFilename(),'待同步学习稿.json');await b.getByRole('button',{name:'登录',exact:true}).waitFor();assert.equal((await call('/auth/me',{auth:student})).status,401);assert.deepEqual(errors,[]);
 }finally{for(const context of contexts)await context.close();await browser.close();}
});
test('场景教学浏览器闭环：角色材料、提交、反馈修订与关联讨论',{skip:process.env.FAXUE_BROWSER_TESTS!=='1'},async()=>{
 const authFor=async id=>{const session=await createSession(database,id);return {cookie:'faxue_session='+session.token,csrfToken:session.csrfToken};};const teacher=await authFor(teacherId);const student=await authFor(studentId);
 const group=(await call('/groups',{method:'POST',auth:teacher,data:{name:'场景浏览器闭环组'}})).payload.data.id;
 await call('/groups/'+group+'/members',{method:'POST',auth:teacher,data:{userId:studentId,kind:'student'}});
 const task=(await call('/tasks',{method:'POST',auth:teacher,data:{groupId:group,title:'听证中的理由与回应',objective:'解释方案',requirements:'完成听证再讨论',checkpoints:['是否回应异议'],sceneId:'campus-hearing',sceneVersion:'v2'}})).payload.data.id;
 await call('/tasks/'+task+'/publish',{method:'POST',auth:teacher});const attempt=(await call('/attempts',{method:'POST',auth:student,data:{taskId:task}})).payload.data.id;
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});const contexts=[];const errors=[];
 const open=async auth=>{const context=await browser.newContext({viewport:{width:1280,height:1000}});contexts.push(context);await context.addInitScript(()=>localStorage.setItem('faxue-welcome-dismissed','2026-welcome-1'));await context.addCookies([{name:'faxue_session',value:auth.cookie.split('=')[1],url:origin}]);const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));return page;};
 try{
  const page=await open(student);const reviewer=await open(teacher);const otherDevice=await open(student);
  await page.goto(origin+'/workspace/?id='+attempt);await page.getByRole('radio').first().check();await page.getByRole('button',{name:'继续听证',exact:true}).click();await page.getByRole('heading',{name:'学生代表的访谈备忘 · 你的角色材料',exact:true}).waitFor();assert.equal(await page.getByText('管理方案代表的工作备忘',{exact:false}).count(),0);
  await page.getByRole('checkbox',{name:'将此材料纳入考虑'}).last().check();await page.getByRole('textbox',{name:'至少一处仍需确认的信息'}).fill('访谈意见的代表性尚需核对');await page.getByRole('button',{name:'继续听证',exact:true}).click();await page.getByRole('textbox',{name:'一个可以讨论的争点'}).fill('是否保留替代通行方式');await page.getByRole('textbox',{name:'考虑一及其理由'}).fill('管理效率');await page.getByRole('textbox',{name:'与之冲突的考虑及其理由'}).fill('不同学生平等通行');await page.getByRole('button',{name:'继续听证',exact:true}).click();await page.getByRole('textbox',{name:'初步方案',exact:true}).fill('保留门禁卡并小范围试行');await page.getByRole('textbox',{name:'方案的理由',exact:true}).fill('回应不同使用处境');await page.getByRole('combobox',{name:'关联材料',exact:true}).selectOption('student-brief');await page.getByRole('button',{name:'继续听证',exact:true}).click();await page.getByRole('textbox',{name:'回应这项异议',exact:true}).fill('将双轨维护成本纳入试行评估');await page.getByRole('textbox',{name:'一个替代方案及考虑',exact:true}).fill('保留人工通道');await page.getByRole('button',{name:'继续听证',exact:true}).click();await page.getByRole('textbox',{name:'最终方案',exact:true}).fill('保留替代方式并公开评估');await page.getByRole('textbox',{name:'修改或保留观点的理由',exact:true}).fill('依据访谈意见保留选择');await page.getByRole('textbox',{name:'这次讨论改变或加深了什么理解？',exact:true}).fill('代表不同意见需要说明证据范围');await page.getByRole('button',{name:'继续听证',exact:true}).click();await page.getByRole('button',{name:'保存到云端',exact:true}).click();await page.getByText('已保存到云端。',{exact:true}).waitFor();
  await otherDevice.goto(origin+'/workspace/?id='+attempt);await otherDevice.getByRole('heading',{name:'归档与提交',exact:true}).waitFor();await otherDevice.getByText('保留替代方式并公开评估',{exact:true}).waitFor();
  const saved=(await call('/attempts/'+attempt,{auth:student})).payload.data.draft;const forged={...saved.content,scene:{...saved.content.scene,materialIds:['management-brief'],materialCitation:'management-brief'}};await call('/attempts/'+attempt+'/draft',{method:'PUT',auth:student,data:{revision:saved.revision,content:forged}});assert.equal((await call('/attempts/'+attempt+'/submissions',{method:'POST',auth:student,headers:{'Idempotency-Key':'forged-other-role-material'},data:{revision:saved.revision+1}})).status,400);
  await call('/attempts/'+attempt+'/draft',{method:'PUT',auth:student,data:{revision:saved.revision+1,content:saved.content}});await page.reload();await page.getByRole('button',{name:'提交给教师',exact:true}).click();await page.getByRole('button',{name:'第1次提交 · 查看反馈',exact:true}).waitFor();
  await reviewer.goto(origin+'/teacher/submissions/?id='+task);await reviewer.getByRole('button',{name:'隔离学生 · 第1次提交',exact:true}).click();await reviewer.getByRole('textbox',{name:'是否回应异议',exact:true}).fill('需要说明成本评估方式');await reviewer.getByRole('textbox',{name:'具体意见',exact:true}).fill('请补充试行的评估指标与退出条件');await reviewer.getByRole('button',{name:'保存反馈',exact:true}).click();await reviewer.getByText('反馈已保存，学生可以查看并继续修订。',{exact:true}).waitFor();
  await page.getByRole('button',{name:'第1次提交 · 查看反馈',exact:true}).click();await page.getByRole('button',{name:'依据这条反馈修订',exact:true}).click();await page.getByRole('button',{name:'上一步',exact:true}).click();await page.getByRole('textbox',{name:'最终方案',exact:true}).fill('双轨试行，公开通行时间与维护成本，未达目标即退出');await page.getByRole('textbox',{name:'修改或保留观点的理由',exact:true}).fill('根据反馈明确评估与退出');await page.getByRole('textbox',{name:'修改或保留理由',exact:true}).fill('依据教师意见补充评估指标');await page.getByRole('button',{name:'继续听证',exact:true}).click();await page.getByRole('button',{name:'保存到云端',exact:true}).click();await page.getByText('已保存到云端。',{exact:true}).waitFor();await page.getByRole('button',{name:'提交给教师',exact:true}).click();await page.getByRole('button',{name:'第2次提交 · 查看反馈',exact:true}).waitFor();
  await page.getByRole('link',{name:'围绕这个场景提出问题',exact:true}).click();await page.getByRole('heading',{name:'提出你的问题',exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('select[name=association]')?.disabled===false);assert.equal(await page.getByRole('combobox',{name:'关联学习材料（可选）',exact:true}).inputValue(),'scene:campus-hearing@v2');await page.getByRole('textbox',{name:'问题标题',exact:true}).fill('如何评价试行方案中的退出条件');await page.getByRole('textbox',{name:'问题与已有思考',exact:true}).fill('完成听证修订后，我认为退出条件还需要更明确的衡量标准，大家如何理解？');await page.getByRole('button',{name:'发布问题',exact:true}).click();await page.getByRole('heading',{name:'如何评价试行方案中的退出条件',exact:true}).waitFor();assert.ok((await page.getByRole('link',{name:'查看关联学习材料',exact:true}).getAttribute('href')).includes('version=v2'));
  const topicUrl=page.url();const topicId=new URL(topicUrl).searchParams.get('id');const peerAuth=await authFor(otherStudentId);const mentorAuth=await authFor(mentorId);const peer=await open(peerAuth);const mentorPage=await open(mentorAuth);
  await peer.goto(topicUrl);await peer.getByRole('textbox',{name:'内容',exact:true}).fill('可以先讨论评估指标，再约定未达到指标时的退出方式。');await peer.getByRole('button',{name:'发表回答',exact:true}).click();await peer.getByText('可以先讨论评估指标，再约定未达到指标时的退出方式。',{exact:true}).waitFor();
  await mentorPage.goto(topicUrl);await mentorPage.getByRole('button',{name:'追问这条回答',exact:true}).click();await mentorPage.getByRole('textbox',{name:'内容',exact:true}).fill('还可以追问：谁负责评估，参与者如何提出异议？');await mentorPage.getByRole('button',{name:'发表追问',exact:true}).click();await mentorPage.getByText('还可以追问：谁负责评估，参与者如何提出异议？',{exact:true}).waitFor();
  assert.ok((await call('/notifications',{auth:student})).payload.data.items.some(row=>row.target_id===topicId));assert.ok((await call('/notifications',{auth:peerAuth})).payload.data.items.some(row=>row.target_id===topicId));assert.deepEqual(errors,[]);
 }finally{for(const context of contexts)await context.close();await browser.close();}
});
test('本机存储不可读时仍能明确确认退出并撤销真实会话',{skip:process.env.FAXUE_BROWSER_TESTS!=='1'},async()=>{
 const session=await createSession(database,studentId);const auth={cookie:'faxue_session='+session.token,csrfToken:session.csrfToken};const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});const context=await browser.newContext();
 try{await context.addInitScript(()=>{localStorage.setItem('faxue-welcome-dismissed','2026-welcome-1');});await context.addCookies([{name:'faxue_session',value:session.token,url:origin}]);const page=await context.newPage();await page.goto(origin+'/login/');await page.getByRole('button',{name:'退出登录',exact:true}).waitFor();await page.evaluate(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}});});await page.getByRole('button',{name:'退出登录',exact:true}).click();await page.getByText('浏览器禁止读取本机暂存，无法确认是否还有未同步稿。请先导出编辑区的内容，再决定是否退出。',{exact:true}).waitFor();assert.equal((await call('/auth/me',{auth})).status,200);await page.getByRole('button',{name:'已保留当前稿，确认退出',exact:true}).click();await page.getByRole('button',{name:'登录',exact:true}).waitFor();assert.equal((await call('/auth/me',{auth})).status,401);
 }finally{await context.close();await browser.close();}
});
test('30位隔离学生并发保存和提交，记录环境与请求延迟',async()=>{
 const adminSession=await createSession(database,adminId);const admin={cookie:'faxue_session='+adminSession.token,csrfToken:adminSession.csrfToken};
 const group=await call('/groups',{method:'POST',auth:admin,data:{name:'并发验证组'}});const groupId=group.payload.data.id;
 const task=await call('/tasks',{method:'POST',auth:admin,data:{groupId,title:'并发保存与提交',objective:'验证记录隔离',requirements:'完整推理产出',checkpoints:['理由完整'],caseId:'case-0001',moduleId:'exp-reasoning'}});const taskId=task.payload.data.id;await call('/tasks/'+taskId+'/publish',{method:'POST',auth:admin});
 const hash=await hashPassword(password);const students=[];
 for(let index=0;index<30;index++){const id=crypto.randomUUID();await database.batch([database.prepare('INSERT INTO users(id,login_id,display_name,password_hash,created_at) VALUES(?,?,?,?,?)').bind(id,'load-'+index,'隔离负载学生'+index,hash,Date.now()),database.prepare("INSERT INTO user_roles(user_id,role) VALUES(?,'student')").bind(id),database.prepare("INSERT INTO group_members(group_id,user_id,kind) VALUES(?,?,'student')").bind(groupId,id)]);const session=await createSession(database,id);students.push({cookie:'faxue_session='+session.token,csrfToken:session.csrfToken});}
 const measurements=[];const timed=async(route,options)=>{const start=performance.now();const result=await call(route,options);measurements.push({route,status:result.status,ms:performance.now()-start});assert.ok(result.status<300,JSON.stringify(result.payload));return result;};
 await Promise.all(students.map(async(auth,index)=>{const attempt=await timed('/attempts',{method:'POST',auth,data:{taskId}});const id=attempt.payload.data.id;await timed('/attempts/'+id+'/draft',{method:'PUT',auth,data:{revision:0,content:{interactionData:{majorPremise:'规范'+index,minorPremise:'事实'+index,conclusion:'结论'+index,subsumption:'说明'+index}}}});await timed('/attempts/'+id+'/submissions',{method:'POST',auth,headers:{'Idempotency-Key':'load-submit-'+index},data:{revision:1}});await timed('/attempts/'+id,{auth});}));
 const count=await database.prepare('SELECT count(*) AS n FROM submissions s JOIN learning_attempts a ON a.id=s.attempt_id JOIN task_versions v ON v.id=a.task_version_id WHERE v.task_id=?').bind(taskId).first();assert.equal(count.n,30);
 const sorted=measurements.map(row=>row.ms).sort((a,b)=>a-b);fs.writeFileSync('output/verification/load-test.json',JSON.stringify({environment:'本地 workerd + D1 隔离库；预建有效会话，不包含密码运算或公网延迟',node:process.version,platform:process.platform,concurrentUsers:30,requests:measurements.length,errors:measurements.filter(row=>row.status>=400).length,p50ms:sorted[Math.floor(sorted.length*.5)],p95ms:sorted[Math.floor(sorted.length*.95)],maxMs:sorted.at(-1)},null,2));
});
test('隔离数据库导出后在全新库恢复，逐表比对并验证外键',async()=>{
 const tableNames=[];for(const file of fs.readdirSync('migrations').filter(name=>name.endsWith('.sql')).sort()){for(const match of fs.readFileSync(path.join('migrations',file),'utf8').matchAll(/CREATE TABLE ([a-z_]+)/g))tableNames.push(match[1]);}
 const tables={};for(const table of tableNames)tables[table]=(await database.prepare('SELECT * FROM '+table).all()).results;
 const backup=path.join(temp,'test-backup.json');fs.writeFileSync(backup,JSON.stringify(tables),{mode:0o600});const restored=JSON.parse(fs.readFileSync(backup,'utf8'));
 const restoreService=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("restore test");}}',compatibilityDate:'2026-09-14',port:0,d1Databases:{DB:'restore-db'},d1Persist:path.join(temp,'restore-state')}));
 try{const target=await restoreService.getD1Database('DB');await applyMigrations(target,{triggers:false});for(const table of tableNames){for(const row of restored[table]){const keys=Object.keys(row);await target.prepare('INSERT OR REPLACE INTO '+table+' ('+keys.join(',')+') VALUES ('+keys.map(()=>'?').join(',')+')').bind(...keys.map(key=>row[key])).run();}const actual=(await target.prepare('SELECT * FROM '+table).all()).results;const normalize=rows=>rows.map(row=>JSON.stringify(row)).sort();assert.deepEqual(normalize(actual),normalize(tables[table]),table);}
 const triggers=(await database.prepare("SELECT name,sql FROM sqlite_schema WHERE type='trigger' ORDER BY name").all()).results;for(const trigger of triggers)await target.prepare(trigger.sql).run();assert.deepEqual((await target.prepare("SELECT name,sql FROM sqlite_schema WHERE type='trigger' ORDER BY name").all()).results,triggers);
 assert.deepEqual((await target.prepare('PRAGMA foreign_key_check').all()).results,[]);fs.writeFileSync('output/verification/restore-test.json',JSON.stringify({tables:Object.fromEntries(tableNames.map(table=>[table,tables[table].length])),foreignKeyErrors:0,scope:'隔离测试库导出与独立空库恢复；不操作生产库'},null,2));
 }finally{await restoreService.dispose();}
});
test('同一账号登录频率限制可复现',async()=>{
  let last;
  for(let i=0;i<9;i++) last=await call('/auth/login',{method:'POST',data:{loginId:'limit-target',password:'wrong'}});
  assert.equal(last.status,429);
});
