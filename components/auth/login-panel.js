'use client';
import { exportPendingDrafts } from '@/lib/api/private-cache';
import { useState } from 'react';
import Link from 'next/link';
import { useSession } from './session-provider';
export default function LoginPanel({navigation}) {
 const session=useSession(); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');const [pending,setPending]=useState(false);const [unreadable,setUnreadable]=useState(false);
 async function submit(event) { event.preventDefault();const form=event.currentTarget;const data=new FormData(form);setBusy(true);setMessage('');try { const result=await session.login(data.get('loginId'),data.get('password'));if(result)form.reset(); }catch(error){setMessage(error.message);}finally{setBusy(false);} }
 async function logout(exportFirst=false,ignoreUnreadableCache=false){setBusy(true);setMessage('');try{if(exportFirst)exportPendingDrafts(session.user.id);await session.logout({clearPending:exportFirst,ignoreUnreadableCache});setPending(false);setUnreadable(false);}catch(error){setMessage(error.message);if(error.code==='unsynced_drafts')setPending(true);if(error.code==='draft_storage_unavailable')setUnreadable(true);}finally{setBusy(false);}}
 return <main className="showcase-page">{navigation}<div className="console-page"><header><p className="section-eyebrow">继续你的法理学探索</p><h1>账号登录</h1><p>使用平台提供的账号，查看学习任务、参与讨论和交流。</p></header><section className="console-card login-card">
 {!session.ready?<p role="status">正在确认账号…</p>:session.user?<><h2>{session.user.displayName}，欢迎回来</h2><p>账号：{session.user.loginId}</p><div className="console-actions"><Link className="btn btn-accent" href={session.user.roles.includes('admin')?'/admin/':session.user.roles.includes('teacher')?'/teacher/':'/workspace/'}>进入工作台</Link><button className="btn btn-outline" disabled={busy} onClick={()=>logout()}>退出登录</button></div></>:<form onSubmit={submit}><label>账号<input name="loginId" autoComplete="username" required maxLength={80} disabled={busy}/></label><label>密码<input name="password" type="password" autoComplete="current-password" required disabled={busy}/></label><button className="btn btn-accent" disabled={busy}>{busy?'正在登录…':'登录'}</button><p className="console-muted">账号由平台维护者提供。如尚未取得账号，可以先阅读公开课程与案例。</p><Link href="/courses/">浏览公开课程</Link></form>}
 {pending&&<button className="btn btn-outline" disabled={busy} onClick={()=>logout(true)}>导出本机未同步稿并退出</button>}{unreadable&&session.user&&<button className="btn btn-outline" disabled={busy} onClick={()=>logout(false,true)}>已保留当前稿，确认退出</button>}{(message||session.error)&&<p role="alert">{message||session.error}</p>}
 </section></div></main>;
}
