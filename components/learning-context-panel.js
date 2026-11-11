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
    <Link href={`/knowledge/#${encodeURIComponent(link.topicId)}`}>回顾知识点</Link>
  </section>;
}
