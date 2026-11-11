import script from '../../content/scenes/versions/campus-hearing-v1.json';
import scriptV2 from '../../content/scenes/versions/campus-hearing-v2.json';
import scriptV3 from '../../content/scenes/versions/campus-hearing-v3.json';
import { digest } from '../auth/password.js';
import { fail,json,body,onlyFields } from '../http.js';
import { requireRole } from '../auth/session.js';
import { audit } from '../admin/routes.js';
export const sceneScripts=[script,scriptV2,scriptV3];
export async function getScene(db,id,version,{published=false}={}){
 const row=await db.prepare('SELECT * FROM scene_versions WHERE scene_id=? AND version=?').bind(id,version).first();if(!row||(published&&!row.published))fail(404,'scene_unavailable','场景版本当前不可用。');return {...row,content:JSON.parse(row.script)};
}
export async function scenesRoute({request,db,session,path}){
 const publicScene=path.match(/^\/public\/scenes\/([^/]+)$/);
 if(publicScene&&request.method==='GET'){
  const version=new URL(request.url).searchParams.get('version');
  const row=await db.prepare('SELECT script FROM scene_versions WHERE scene_id=? AND published=1'+(version?' AND version=?':'')+' ORDER BY created_at DESC,version DESC LIMIT 1').bind(publicScene[1],...(version?[version]:[])).first();
  if(!row)fail(404,'scene_unavailable','此听证场景当前未开放。已保存的课程记录仍可从我的任务查看。');return json(JSON.parse(row.script));
 }

 if(path==='/scenes'&&request.method==='GET'){const rows=await db.prepare('SELECT scene_id,version,fingerprint,script FROM scene_versions WHERE published=1 ORDER BY scene_id,created_at DESC').all();return json({items:rows.results.map(row=>({id:row.scene_id,version:row.version,title:JSON.parse(row.script).title}))});}
 if(path==='/admin/scenes'&&request.method==='GET'){requireRole(session,'admin');const items=[];for(const item of sceneScripts){const row=await db.prepare('SELECT published FROM scene_versions WHERE scene_id=? AND version=?').bind(item.id,item.version).first();items.push({id:item.id,version:item.version,title:item.title,reviewStatus:item.reviewStatus,published:Boolean(row?.published)});}return json({items});}
 const version=path.match(/^\/scenes\/([^/]+)\/versions\/([^/]+)$/);if(version&&request.method==='GET'){const row=await getScene(db,version[1],version[2]);if(!row.published&&!session.user.roles.includes('admin')){const prior=await db.prepare('SELECT 1 FROM learning_attempts WHERE scene_id=? AND scene_version=? AND user_id=?').bind(version[1],version[2],session.user.id).first();if(!prior)fail(404,'not_found','场景不可访问。');}return json(row.content);}
 const publication=path.match(/^\/admin\/scenes\/([^/]+)\/publication$/);if(publication&&request.method==='POST'){requireRole(session,'admin');const input=await body(request);onlyFields(input,['version','published']);if(typeof input.published!=='boolean')fail(400,'publication','发布状态无效。');const script=sceneScripts.find(item=>item.id===publication[1]&&item.version===input.version);if(!script)fail(400,'script','此脚本尚未纳入版本库。');const serialized=JSON.stringify(script);const fingerprint=await digest(serialized);const old=await db.prepare('SELECT fingerprint FROM scene_versions WHERE scene_id=? AND version=?').bind(script.id,script.version).first();if(old&&old.fingerprint!==fingerprint)fail(409,'script_changed','已发布版本不能覆盖，请创建新版本。');await db.batch([db.prepare('INSERT INTO scene_versions(scene_id,version,script,fingerprint,published,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(scene_id,version) DO UPDATE SET published=excluded.published').bind(script.id,script.version,serialized,fingerprint,Number(input.published),Date.now()),audit(db,session.user.id,input.published?'scene_published':'scene_withdrawn',script.id,{version:script.version})]);return json({published:input.published});}return null;
}
