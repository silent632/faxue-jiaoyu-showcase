
'use client';
import { useEffect,useState } from 'react';
import { useResource,Status } from '@/components/teaching/use-resource';
import PublicScene from './public-scene';
export default function PublicSceneGate({sceneId}){
 const [version,setVersion]=useState(null);const [hasSaved,setHasSaved]=useState(false);const [exportError,setExportError]=useState('');useEffect(()=>setVersion(new URLSearchParams(window.location.search).get('version')||''),[]);
 useEffect(()=>{try{setHasSaved(Object.keys(localStorage).some(key=>key.startsWith('faxue-scene-guest:'+sceneId+':')));}catch{}},[sceneId]);
 function exportSaved(){try{const records={};for(const key of Object.keys(localStorage)){if(key.startsWith('faxue-scene-guest:'+sceneId+':')){const raw=localStorage.getItem(key);try{records[key]=JSON.parse(raw);}catch{records[key]={unreadableRaw:raw};}}}const url=URL.createObjectURL(new Blob([JSON.stringify({sceneId,records},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='本机听证历史记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setExportError('无法读取本机历史记录，请检查浏览器的存储权限。');}}
 const scene=useResource(version===null?null:'/public/scenes/'+encodeURIComponent(sceneId)+(version?'?version='+encodeURIComponent(version):''));
 return <>{hasSaved&&<p><button className="btn btn-outline" onClick={exportSaved}>导出本机听证历史（含旧版本）</button></p>}{exportError&&<p role="alert">{exportError}</p>}<Status resource={scene}/>{scene.data&&<PublicScene key={scene.data.id+':'+scene.data.version} script={scene.data}/>}</>;
}
