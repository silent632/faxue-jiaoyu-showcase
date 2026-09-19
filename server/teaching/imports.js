import { body,fail,json,onlyFields } from '../http.js';
import { digest } from '../auth/password.js';
import cases from '../../data/generated/cases-extracted.json';
import experiments from '../../content/experiments.json';
const caseIds=new Set(cases.map(row=>row.case_id));const modules=new Set(experiments.modules.map(row=>row.id));
function stable(value){if(Array.isArray(value))return value.map(stable);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])]));return value;}
async function normalize(item){
 if(!item||!caseIds.has(item.caseId)||!['study','experiment'].includes(item.kind)||!item.record||typeof item.record!=='object'||Array.isArray(item.record))fail(400,'import_record','导入记录格式或案例ID无效。');
 if(item.kind==='experiment'&&!modules.has(item.moduleId))fail(400,'import_module','实验模块不存在。');
 const normalized={kind:item.kind,caseId:item.caseId,moduleId:item.kind==='experiment'?item.moduleId:null,record:item.record};
 return {...normalized,fingerprint:await digest(JSON.stringify(stable(normalized)))};
}
export async function importsRoute({request,db,session,path}){
 if(!path.startsWith('/learning/import/')||request.method!=='POST')return null;
 const input=await body(request);const user=session.user;
 if(path==='/learning/import/preview'){
  onlyFields(input,['records']);if(!Array.isArray(input.records)||input.records.length<1||input.records.length>20)fail(400,'import_limit','每次请选择1至20份记录。');
  const records=[];const seen=new Set();for(const item of input.records){const value=await normalize(item);if(!seen.has(value.fingerprint)){seen.add(value.fingerprint);records.push(value);}}
  const id=crypto.randomUUID();await db.batch([db.prepare('DELETE FROM import_previews WHERE expires_at<?').bind(Date.now()),db.prepare('INSERT INTO import_previews(id,user_id,payload,expires_at) VALUES(?,?,?,?)').bind(id,user.id,JSON.stringify(records),Date.now()+15*60*1000)]);
  const items=[];for(const row of records){const prior=await db.prepare('SELECT attempt_id FROM import_receipts WHERE user_id=? AND fingerprint=?').bind(user.id,row.fingerprint).first();items.push({...row,alreadyImported:Boolean(prior)});}
  return json({previewId:id,items,notice:'仅归入当前账号的历史自主学习记录，不转换为课程提交；浏览器原记录保持不变。'});
 }
 if(path==='/learning/import/commit'){
  onlyFields(input,['previewId','fingerprints','confirmed']);if(input.confirmed!==true||!Array.isArray(input.fingerprints)||!input.fingerprints.length||input.fingerprints.length>20)fail(400,'import_confirmation','请选择并确认属于本人的记录。');
  const preview=await db.prepare('SELECT payload FROM import_previews WHERE id=? AND user_id=? AND expires_at>?').bind(input.previewId,user.id,Date.now()).first();if(!preview)fail(409,'preview_expired','预览已失效，请重新选择记录。');
  const source=JSON.parse(preview.payload);const items=[];for(const fingerprint of new Set(input.fingerprints)){
   const row=source.find(item=>item.fingerprint===fingerprint);if(!row)fail(400,'selection','选择内容不在预览范围内。');
   const rechecked=await normalize(row);if(rechecked.fingerprint!==fingerprint)fail(409,'import_changed','内容发生变化，请重新预览。');
   const hash=await digest(user.id+':'+fingerprint);const id=`${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
   items.push({id,row});
  }
  const now=Date.now();await db.batch(items.flatMap(({id,row})=>[
   db.prepare("INSERT OR IGNORE INTO learning_attempts(id,user_id,case_id,module_id,provenance,created_at) VALUES(?,?,?,?,'imported',?)").bind(id,user.id,row.caseId,row.moduleId,now),
   db.prepare('INSERT OR IGNORE INTO drafts(attempt_id,content,updated_at) VALUES(?,?,?)').bind(id,JSON.stringify({...row.record,importKind:row.kind}),now),
   db.prepare('INSERT OR IGNORE INTO import_receipts(user_id,fingerprint,attempt_id,created_at) VALUES(?,?,?,?)').bind(user.id,row.fingerprint,id,now),
  ]));return json({items:items.map(({id})=>({id})),importedAs:'historical-learning'});
 }
 return null;
}
