import Link from 'next/link';
import ShowcaseNav from '@/components/showcase-nav';
import { getPublicJurisprudenceLearning } from '@/lib/content/jurisprudence-learning.js';

export const metadata = { title: '法理知识与案例 · 法理学学习' };

export default function KnowledgePage() {
  const { chapters, topics, caseLinks } = getPublicJurisprudenceLearning();
  return <main className="showcase-page"><ShowcaseNav/><div className="page-wrap page-stack">
    <header className="showcase-card"><p className="section-eyebrow">法理学 · 知识与案例</p><h1>从课堂知识走进案例</h1><p>选择学习主题，带着问题阅读裁判文书。</p><Link className="btn btn-outline" href="/cases/">浏览全部案例</Link></header>
    {chapters.length === 0 ? <section className="card"><h2>法理知识与案例</h2><p>目前没有可供浏览的知识点关联，可先从案例检索开始学习。</p><Link className="btn btn-accent" href="/cases/">前往案例检索</Link></section> : chapters.map(chapter => {
      const chapterTopics = topics.filter(topic => topic.chapterId === chapter.id);
      return <section className="card" key={chapter.id}><h2>{chapter.title}</h2>{chapterTopics.length ? chapterTopics.map(topic => {
        const count = caseLinks.filter(link => link.topicId === topic.id).length;
        return <article key={topic.id} id={topic.id}><h3>{topic.title}</h3><p>{topic.description}</p><p>{count ? `已关联 ${count} 篇案例` : '暂无关联案例'}</p>{count > 0 && <Link className="btn btn-outline" href={`/cases/?topic=${encodeURIComponent(topic.id)}`}>查看相关案例</Link>} <Link className="btn btn-outline" href={`/community/?knowledge=${encodeURIComponent(topic.id)}`}>围绕这个知识点提问</Link></article>;
      }) : <p>本章节暂无可浏览的知识点。</p>}</section>;
    })}
  </div></main>;
}
