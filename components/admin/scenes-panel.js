'use client';
import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useSession } from '@/components/auth/session-provider';
import { useResource,Status } from '@/components/teaching/use-resource';
export default function ScenesPanel(){const {csrfToken}=useSession();const resource=useResource('/admin/scenes');const [error,setError]=useState('');const [busy,setBusy]=useState(false);return <section className="console-card"><h2>场景版本</h2><Status resource={resource}/>{error&&<p role="alert">{error}</p>}{resource.data?.items.map(scene=><article key={scene.id+scene.version}><h3>{scene.title} · {scene.version}</h3><p>{scene.reviewStatus}</p><p>{scene.published?'已开放自主体验与新教学任务':'未开放新的体验与任务'}</p><button className="btn btn-outline" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await api('/admin/scenes/'+scene.id+'/publication',{method:'POST',csrfToken,data:{version:scene.version,published:!scene.published}});resource.reload();}catch(e){setError(e.message);}finally{setBusy(false);}}}>{scene.published?'撤下此版本（保留已有课程记录）':'开放体验与教学任务（保留审阅提示）'}</button></article>)}</section>;}
