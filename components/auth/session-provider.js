'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api/client';
import { pendingDrafts,clearPrivateCache } from '@/lib/api/private-cache';
const SessionContext = createContext(null);
export function SessionProvider({ children }) {
  const generation=useRef(0);
  const [state, setState] = useState({ ready: false, user: null, csrfToken: null, error: '' });
  const refresh = useCallback(async () => {
    const current=++generation.current;
    try { const data = await api('/auth/me'); if(current!==generation.current)return null;setState({ ready: true, ...data, error: '' }); return data; }
    catch (error) { if(current!==generation.current)return null;setState({ ready: true, user: null, csrfToken: null, error: error.status === 401 ? '' : error.message }); return null; }
  }, []);
  useEffect(() => {
    refresh();
    // 跨标签页退出或切换后重新确认身份，不在通知中传递令牌。
    const onStorage = event => { if (event.key === 'faxue-session-event') {setState({ready:false,user:null,csrfToken:null,error:''});refresh();} };
    const onFocus = () => refresh();
    window.addEventListener('storage', onStorage); window.addEventListener('focus', onFocus);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('focus', onFocus); };
  }, [refresh]);
  const announce = () => { try { localStorage.setItem('faxue-session-event', crypto.randomUUID()); } catch {} };
  const login = async (loginId,password) => { await api('/auth/login',{method:'POST',data:{loginId,password}}); const result = await refresh(); announce(); return result; };
  const logout = async ({clearPending=false,ignoreUnreadableCache=false}={}) => {
    let hasPending=false;try{hasPending=Object.keys(pendingDrafts(state.user?.id)).length>0;}catch(error){if(!ignoreUnreadableCache||error.code!=='draft_storage_unavailable')throw error;}
    if(!clearPending&&hasPending){const error=new Error('本机还有未同步的学习稿。请先回到我的任务保存，或导出这些稿件后退出。');error.code='unsynced_drafts';throw error;}
    await api('/auth/logout',{method:'POST',csrfToken:state.csrfToken});
    generation.current++;try{clearPrivateCache(state.user?.id);}catch{}finally{setState({ready:true,user:null,csrfToken:null,error:''});announce();}
  };
  return <SessionContext.Provider value={{...state,refresh,login,logout}}>{children}</SessionContext.Provider>;
}
export function useSession() { const value=useContext(SessionContext); if(!value) throw new Error('SessionProvider is required'); return value; }
