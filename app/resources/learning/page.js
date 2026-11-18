import Link from 'next/link';
import ShowcaseNav from '@/components/showcase-nav';

export const metadata = { title: '资料与问答 · 法理学学习' };

export default function LearningResourcesPage() {
  return <main className="showcase-page">
    <ShowcaseNav />
    <div className="console-page">
      <header><p className="section-eyebrow">共同学习</p><h1>资料与问答</h1><p>查找学习资料，与同学和老师交流问题。</p></header>
      <div className="console-grid">
        <section className="console-card"><h2>学习资料</h2><p>查看整理的学习资料和课程资源。</p><Link href="/resources/library/" className="btn btn-accent">进入资料专区</Link></section>
        <section className="console-card"><h2>学习问答</h2><p>围绕案例和法理问题提问、回答与讨论。</p><Link href="/community/" className="btn btn-accent">进入学习问答</Link></section>
        <section className="console-card"><h2>使用帮助</h2><p>查看使用指南，或向我们反馈使用体验。</p><div className="console-actions"><Link href="/help/" className="btn btn-outline">使用帮助</Link><Link href="/help/feedback/" className="btn btn-outline">意见反馈</Link></div></section>
      </div>
    </div>
  </main>;
}
