import Link from 'next/link';
import ShowcaseNav from '@/components/showcase-nav';

export const metadata = { title: '资料与问答 · 法理学学习' };

export default function LearningResourcesPage() {
  return (
    <main className="showcase-page">
      <ShowcaseNav />
      <div className="editorial-width page-stack">
        <header className="editorial-heading">
          <div><h1>资料与问答</h1><p>查学习资料、核对法条，和同学或老师讨论案例。</p></div>
        </header>
        <div className="resource-primary-grid">
          <section className="editorial-panel resource-entry">
            <div><h2>学习资料</h2><p>按类别查找备考经验和学习参考。</p></div>
            <Link href="/resources/library/" className="btn btn-accent">进入资料专区 →</Link>
          </section>
          <section className="editorial-panel resource-entry">
            <div><h2>学习问答</h2><p>登录后围绕法理概念、课程内容和裁判文书提问或回答。</p></div>
            <Link href="/community/" className="btn btn-accent">进入学习问答 →</Link>
          </section>
        </div>
        <nav className="editorial-panel resource-secondary" aria-label="学习工具">
          <Link href="/resources/laws/">法条检索 →</Link>
          <Link href="/help/">使用帮助 →</Link>
          <Link href="/help/feedback/">意见反馈 →</Link>
        </nav>
      </div>
    </main>
  );
}
