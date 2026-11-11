'use client';

import { useState } from 'react';
import Link from 'next/link';
import { libraryCategories } from '@/lib/library-categories.js';

export default function LibraryCollection({ items, topics }) {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const search = query.trim().toLocaleLowerCase();
  const filtered = items.filter(item => (category === 'all' || item.category === category) && (!search || [item.title, item.description, item.source].some(value => (value || '').toLocaleLowerCase().includes(search))));
  return <>
    <section className="console-card" aria-label="筛选资料">
      <div className="console-grid">
        <label>搜索资料<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索标题、简介或来源" /></label>
        <label>资料类别<select value={category} onChange={event => setCategory(event.target.value)}><option value="all">全部类别</option>{Object.entries(libraryCategories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      </div>
    </section>
    <p role="status">找到 {filtered.length} 份资料</p>
    {filtered.length ? <div className="console-grid">{filtered.map(item => <article className="console-card" key={item.id}>
      <p className="section-eyebrow">{libraryCategories[item.category]}</p><h2>{item.title}</h2>
      {item.description && <p>{item.description}</p>}<p className="console-muted">来源：{item.source} · 资料日期：{item.sourceDate}</p>
      <p className="console-muted">经验仅供参考，请结合最新招生或考试信息核实。</p>
      <div className="console-actions"><a className="btn btn-outline" href={item.href}>查看资料</a>{item.topicIds.map(id => { const topic = topics.find(row => row.id === id); return topic ? <Link className="btn btn-outline" href={`/knowledge/#${encodeURIComponent(id)}`} key={id}>知识点：{topic.title}</Link> : null; })}</div>
    </article>)}</div> : <section className="console-card"><h2>没有找到匹配的资料</h2><p>可以调整搜索词或资料类别。</p></section>}
  </>;
}
