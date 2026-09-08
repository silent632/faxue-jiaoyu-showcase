"use client";
import {useEffect,useState} from 'react';
import {buildFeedbackMail} from '../lib/feedback-mail.js';
const KEY='faxue-feedback-draft-v1';
export default function FeedbackForm({config}){
 const [text,setText]=useState('');const [category,setCategory]=useState('操作问题');const [source,setSource]=useState('');const [notice,setNotice]=useState('');
 useEffect(()=>{try{const saved=JSON.parse(sessionStorage.getItem(KEY)||'{}');setText(typeof saved.text==='string'?saved.text:'');setCategory(['操作问题','内容疑问','功能建议','其他'].includes(saved.category)?saved.category:'操作问题');const from=new URLSearchParams(location.search).get('from');setSource(from?.startsWith('/')&&!from.startsWith('//')?from.split(/[?#]/)[0]:saved.source||'');}catch{/* 草稿损坏不阻断反馈入口。 */}},[]);
 function update(next){const data={text,category,source,...next};setText(data.text);setCategory(data.category);setSource(data.source);try{sessionStorage.setItem(KEY,JSON.stringify(data));setNotice('内容暂存在本次浏览器会话，尚未提交。');}catch{setNotice('浏览器无法暂存内容，请先复制保存。');}}
 const summary=`反馈类型：${category}\n问题页面：${source||'未指定'}\n具体描述：\n${text}`;
 const mail=buildFeedbackMail(config.email||'',category,summary);
 async function copy(){try{await navigator.clipboard.writeText(summary);setNotice('已复制反馈内容。请粘贴到邮件或意见表单，并自行确认发送；当前尚未发送。');}catch{setNotice('复制未成功，请手动选中下方内容复制。');}}
 return <section className="showcase-card help-card feedback-form"><h2>把你的经历告诉我们</h2><p>请描述遇到的问题、操作步骤或改进建议。可以先在下方整理意见，再通过邮件发送；点击联系按钮会打开邮件应用，仍需你确认发送。</p>
 <label htmlFor="feedback-type">反馈类型</label><select id="feedback-type" value={category} onChange={e=>update({category:e.target.value})}>{['操作问题','内容疑问','功能建议','其他'].map(v=><option key={v}>{v}</option>)}</select>
 <label htmlFor="feedback-source">问题所在页面（可修改）</label><input id="feedback-source" value={source} maxLength={500} onChange={e=>update({source:e.target.value})} placeholder="例如 /courses/course-period-01/"/>
 <label htmlFor="feedback-description">具体描述</label><textarea id="feedback-description" rows={6} maxLength={5000} value={text} onChange={e=>update({text:e.target.value})} placeholder="你在哪一步遇到了什么问题？希望怎样改善？"/>
 <p className="help-caption">{config.privacy}</p>
 {config.email && <div className="feedback-email"><p>直接联系：<a href={`mailto:${config.email}`}>{config.email}</a></p><div className="help-actions"><button type="button" className="btn btn-outline" disabled={!text.trim()} onClick={copy}>复制反馈内容</button>{text.trim() ? <a className="btn btn-accent" href={mail.href}>通过邮件反馈</a> : <a className="btn btn-outline" href={`mailto:${config.email}`}>打开邮件联系</a>}</div><p>{mail.copyRequired ? '意见较长，请先复制反馈内容，再粘贴到邮件正文，避免邮件应用截断内容。' : '邮件草稿会带入反馈类型、问题页面与描述。请在邮件应用中确认内容并发送。'}若没有打开邮件应用，可复制邮箱和内容，使用网页版邮箱发送。网站不会自动发送邮件，也无法确认邮件是否送达。</p></div>}

 {config.formUrl ? <><div className="help-actions"><button className="btn btn-outline" disabled={!text.trim()} onClick={copy}>复制反馈内容</button><a className="btn btn-accent" href={config.formUrl} target="_blank" rel="noopener noreferrer">前往{config.providerName||'意见'}表单提交 ↗</a></div><p>将打开外部表单。是否成功送达，以该表单的提交结果为准；关闭或提交失败时，可返回这里继续复制内容。</p></> : !config.email ? <p role="note">意见接收渠道正在配置。你可以先整理并复制意见保存，当前内容不会发送给维护者。</p> : null}
 {!config.formUrl&&!config.email&&<button type="button" className="btn btn-outline" disabled={!text.trim()} onClick={copy}>复制意见备份</button>}
 <p role="status">{notice}</p><details><summary>查看可复制的完整内容</summary><pre className="feedback-preview">{summary}</pre></details>
 </section>;
}
