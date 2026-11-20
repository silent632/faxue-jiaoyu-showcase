import { Suspense } from 'react';
import StudyLawNavigation from '@/components/study-law-navigation';
import ShowcaseNav from '@/components/showcase-nav';
import LawIndex from '@/components/law-index';
import documents from '@/content/law-library.json';
import { caseReadingIds } from '@/lib/content/case-reading-source.js';

export const metadata = { title: '法条检索 · 法理学学习' };

const catalogue = documents.map(({ slug, title, aliases, version, effective, repealed, articles }) => ({
  slug, title, aliases, version, effective, repealed, articleCount: articles.length,
}));

export default function LawSearchPage() {
  return (
    <main className="showcase-page">
      <ShowcaseNav />
      <div className="editorial-width page-stack">
        <header className="editorial-heading">
          <div><h1>法条检索</h1><p>浏览法规全文，检索条文并查找引用该条文的案例。</p></div>
          <Suspense><StudyLawNavigation caseIds={caseReadingIds} /></Suspense>
        </header>
        <Suspense fallback={<p>正在加载法条索引</p>}><LawIndex catalogue={catalogue} caseIds={caseReadingIds} /></Suspense>
      </div>
    </main>
  );
}
