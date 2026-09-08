"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
export const WELCOME_KEY = 'faxue-welcome-dismissed';
export default function WelcomeAnnouncement({ copy, email }) {
 const ref=useRef(null);const [open,setOpen]=useState(false);
 useEffect(()=>{
  let dismissed=false;
  try{dismissed=localStorage.getItem(WELCOME_KEY)===copy.version || sessionStorage.getItem(WELCOME_KEY)===copy.version;}catch{/* 存储禁用时本次页面仍可正常关闭。 */}
  if(!dismissed)setOpen(true);
  const reopen=()=>setOpen(true);window.addEventListener('faxue-open-welcome',reopen);
  return()=>window.removeEventListener('faxue-open-welcome',reopen);
 },[copy.version]);
 useEffect(()=>{
  const dialog=ref.current;if(!open||!dialog)return;
  const previous=document.activeElement;const overflow=document.body.style.overflow;
  dialog.showModal();document.body.style.overflow='hidden';dialog.querySelector('h2')?.focus();
  return()=>{dialog.close();document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus();};
 },[open]);
 function dismiss(){
  try{localStorage.setItem(WELCOME_KEY,copy.version);}catch{try{sessionStorage.setItem(WELCOME_KEY,copy.version);}catch{/* 不阻断关闭。 */}}
  setOpen(false);
 }
 return <dialog ref={ref} className="welcome-dialog" aria-labelledby="welcome-title" onCancel={event=>{event.preventDefault();dismiss();}}>
  <button type="button" className="welcome-close" aria-label="关闭使用者欢迎" onClick={dismiss}>×</button>
  <p className="section-eyebrow">{copy.eyebrow}</p>
  <h2 id="welcome-title" tabIndex={-1}>{copy.title}</h2>
  <div className="welcome-copy" tabIndex={0} role="region" aria-label="欢迎正文">{copy.paragraphs.map(p=><p key={p}>{p}</p>)}{email && <p className="welcome-feedback">{copy.feedbackInvitation}<a href={`mailto:${email}`}>{email}</a>。期待你的声音，帮助这个平台变得更好。</p>}</div>
  <div className="help-actions"><Link href="/help/guide/" className="btn btn-accent" onClick={dismiss}>查看使用指南</Link><Link href="/courses/course-period-01/" className="btn btn-outline" onClick={dismiss}>开始法理学探索</Link></div>
  <p className="help-caption">此后可在“帮助与反馈”中再次查看这封欢迎信。</p>
 </dialog>;
}
