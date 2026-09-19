'use client';
import Link from 'next/link';
import { useSession } from './session-provider';
export default function PrivateGate({roles,children}){
 const session=useSession();
 if(!session.ready)return <p role="status">正在确认账号…</p>;
 if(!session.user)return <section className="console-card"><p role="status">{session.error||'登录后查看与你有关的学习内容。'}</p><Link className="btn btn-accent" href="/login/">前往登录</Link></section>;
 if(roles&&!roles.some(role=>session.user.roles.includes(role)))return <p role="alert">当前账号没有此页面的访问权限。</p>;
 return <div key={session.user.id}>{children}</div>;
}
