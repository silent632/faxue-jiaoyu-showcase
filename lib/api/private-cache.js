export function pendingDrafts(userId){
 const records={};if(!userId||typeof window==='undefined')return records;
 try{for(let index=0;index<localStorage.length;index++){const key=localStorage.key(index);if(key?.startsWith('faxue-private:'+userId+':')){const raw=localStorage.getItem(key);try{records[key]=JSON.parse(raw);}catch{records[key]={unreadableRaw:raw};}}}
 }catch{const error=new Error('浏览器禁止读取本机暂存，无法确认是否还有未同步稿。请先导出编辑区的内容，再决定是否退出。');error.code='draft_storage_unavailable';throw error;}
 return records;
}
export function clearPrivateCache(userId){for(const key of Object.keys(pendingDrafts(userId)))localStorage.removeItem(key);}
export function exportPendingDrafts(userId){const records=pendingDrafts(userId);const url=URL.createObjectURL(new Blob([JSON.stringify({type:'unsynced-private-drafts',records},null,2)],{type:'application/json'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='待同步学习稿.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
