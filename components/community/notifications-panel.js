'use client';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useSession } from '@/components/auth/session-provider';
import { useResource,Status } from '@/components/teaching/use-resource';
export default function NotificationsPanel(){const {csrfToken}=useSession();const [page,setPage]=useState(1);const resource=useResource('/notifications?page='+page);const [error,setError]=useState('');return <section className="console-card"><h2>回复与反馈</h2><Status resource={resource}/>{error&&<p role="alert">{error}</p>}{resource.data?.items.length===0&&<p>本页没有可见的新通知。</p>}{resource.data?.items.map(item=><p key={item.id}><Link href={item.href}>{item.title}</Link> {item.read_at?'已读':<button className="btn btn-outline" onClick={async()=>{try{await api('/notifications/'+item.id+'/read',{method:'POST',csrfToken});resource.reload();}catch(e){setError(e.message);}}}>标为已读</button>}</p>)}<div className="console-actions"><button className="btn btn-outline" disabled={page===1} onClick={()=>setPage(page-1)}>上一页</button><span>第{page}页</span><button className="btn btn-outline" onClick={()=>setPage(page+1)}>下一页</button></div></section>;}
