import { HttpError, fail, json } from './http.js';
import { getSession, requireSession, verifyWrite } from './auth/session.js';
import { authRoute } from './auth/routes.js';
import { overviewRoute } from './teaching/overview.js';
import { importsRoute } from './teaching/imports.js';
import { scenesRoute } from './scenes/registry.js';
import { notificationsRoute } from './community/notifications.js';
import { communityRoute } from './community/routes.js';
import { attemptsRoute } from './teaching/attempts.js';
import { submissionsRoute } from './teaching/submissions.js';
import { groupsRoute } from './teaching/groups.js';
import { tasksRoute } from './teaching/tasks.js';
import { adminRoute } from './admin/routes.js';
export async function handleRequest(request, env) {
  const requestId = crypto.randomUUID();
  try {
    if (!env.DB) fail(503, 'database_unavailable', '学习服务暂不可用，请稍后重试。');
    const path = new URL(request.url).pathname.replace(/^\/api/, '').replace(/\/$/, '') || '/';
    if (path === '/health' && request.method === 'GET') { await env.DB.prepare(`SELECT u.id,s.token_hash,r.role,g.id,gm.kind,t.current_version_id,v.version,a.restart_key,d.revision,sub.snapshot,rev.summary,n.event_key,i.fingerprint,ip.user_id,b.id,bg.user_id,tp.status,rp.featured,hv.user_id,rep.reason,ma.action,sv.fingerprint,ae.action,rl.key FROM users u,sessions s,user_roles r,groups g,group_members gm,tasks t,task_versions v,learning_attempts a,drafts d,submissions sub,reviews rev,notifications n,import_receipts i,import_previews ip,boards b,board_guests bg,topics tp,replies rp,helpful_votes hv,reports rep,moderation_actions ma,scene_versions sv,audit_events ae,rate_limits rl WHERE 0`).first(); return json({ ready: true }); }
    if(request.method==='GET'&&/^\/public\/scenes\/[^/]+$/.test(path))return await scenesRoute({request,db:env.DB,path});
    const session = await getSession(request, env.DB);
    if (path !== '/auth/login') {
      requireSession(session);
      if (!['GET', 'HEAD'].includes(request.method)) verifyWrite(request, session);
    }
    const context = { request, db: env.DB, session, path };
    const response = await authRoute(context) || await adminRoute(context) || await groupsRoute(context) || await tasksRoute(context) || await attemptsRoute(context) || await submissionsRoute(context) || await communityRoute(context) || await notificationsRoute(context) || await scenesRoute(context) || await importsRoute(context) || await overviewRoute(context);
    if (response) return response;
    fail(404, 'not_found', '未找到可访问的内容。');
  } catch (error) {
    const known = error instanceof HttpError;
    // 只记录请求标识和错误类别，不输出输入、数据库语句或凭据。
    if (!known) console.error(JSON.stringify({ requestId, event: 'api_error', type: error.name }));
    return new Response(JSON.stringify({ error: { code: known ? error.code : 'service_unavailable', message: known ? error.message : '服务暂不可用，请稍后重试。', requestId, ...(error.fields ? { fields: error.fields } : {}) } }), { status: known ? error.status : 503, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
}
