'use client';
import Link from 'next/link';
import { useSession } from './session-provider';
import { useEffect, useState } from 'react';
export default function PrivateGate({roles,children}){
 const session=useSession();
 const [loginHref,setLoginHref]=useState('/login/');
 useEffect(()=>{const params=new URLSearchParams(window.location.search);const caseId=params.get('case');const knowledge=params.get('knowledge');if(window.location.pathname==='/community/'&&/^case-\d{4}$/.test(caseId||''))setLoginHref('/login/?next='+encodeURIComponent('/community/?case='+caseId));else if(window.location.pathname==='/community/'&&/^[a-z0-9-]{1,80}$/.test(knowledge||''))setLoginHref('/login/?next='+encodeURIComponent('/community/?knowledge='+knowledge));},[]);
 if(!session.ready)return <p role="status">正在确认账号…</p>;
 if(!session.user)return <section className="console-card"><p role="status">{session.error||'登录后查看与你有关的学习内容。'}</p><Link className="btn btn-accent" href={loginHref}>前往登录</Link></section>;
 if(session.user.mustChangePassword)return <section className="console-card"><p>首次登录请先设置新密码。</p><Link className="btn btn-accent" href={loginHref}>设置登录密码</Link></section>;
 if(roles&&!roles.some(role=>session.user.roles.includes(role)))return <p role="alert">当前账号没有此页面的访问权限。</p>;
 return <div key={session.user.id}>{children}</div>;
}
