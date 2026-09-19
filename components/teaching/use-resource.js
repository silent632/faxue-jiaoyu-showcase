'use client';
import { useEffect,useState } from 'react';
import { api } from '@/lib/api/client';
export function useResource(path){
 const [result,setResult]=useState({path:null,data:null,error:''});const [version,setVersion]=useState(0);
 useEffect(()=>{
  if(!path)return;
  const controller=new AbortController();
  // 同一资源刷新时保留编辑器，避免清空成功提示或正在输入的内容；切换资源不复用旧数据。
  api(path,{signal:controller.signal}).then(data=>{if(!controller.signal.aborted)setResult({path,data,error:''});}).catch(error=>{if(!controller.signal.aborted)setResult({path,data:null,error:error.message});});
  return()=>controller.abort();
 },[path,version]);
 return {data:result.path===path?result.data:null,error:result.path===path?result.error:'',reload:()=>setVersion(value=>value+1)};
}
export function useQueryId(){const [id,setId]=useState(null);useEffect(()=>setId(new URLSearchParams(window.location.search).get('id')||''),[]);return id;}
export function Status({resource}){return resource.error?<p role="alert">{resource.error}</p>:!resource.data?<p role="status">正在读取…</p>:null;}
