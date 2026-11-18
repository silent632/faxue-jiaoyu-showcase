'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LearningContextPanel({ links = [] }) {
  const [topicId, setTopicId] = useState('');
  useEffect(() => { setTopicId(new URLSearchParams(window.location.search).get('topic') || ''); }, []);
  const link = links.find(item => item.topicId === topicId);
  if (!link) return null;
  return <section className="console-card" aria-label="当前法理学习提示">
    <h2>当前法理知识：{link.topicTitle}</h2>
    <p>{link.question}</p>
    <p>阅读依据：{link.evidence}</p>
    <div className="knowledge-topic-links">
      {link.sourceFile && link.pages?.length > 0 && <a href={`/pdfs/${encodeURIComponent(link.sourceFile)}#page=${link.pages[0]}`}>打开原文第 {link.pages[0]} 页</a>}
      <Link href={`/knowledge/#${encodeURIComponent(link.topicId)}`}>回顾知识点</Link>
    </div>
  </section>;
}
