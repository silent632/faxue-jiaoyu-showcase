"use client";
export default function WelcomeTrigger(){return <button className="btn btn-outline" type="button" onClick={()=>window.dispatchEvent(new Event('faxue-open-welcome'))}>再读使用者欢迎</button>;}
