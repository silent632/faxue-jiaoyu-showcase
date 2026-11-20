import Link from 'next/link';
import LawCitationButton from '@/components/law-citation-button';
import { Suspense } from 'react';
import StudyLawNavigation from '@/components/study-law-navigation';
import { notFound } from 'next/navigation';
import ShowcaseNav from '@/components/showcase-nav';
import documents from '@/content/law-library.json';
import { caseReadingIds } from '@/lib/content/case-reading-source.js';
import { formatLawVersion } from '@/lib/law-library.js';

export function generateStaticParams() {
  return documents.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: documents.find(document => document.slug === slug)?.title || '法规全文' };
}

export default async function StatutePage({ params }) {
  const { slug } = await params;
  const document = documents.find(item => item.slug === slug);
  if (!document) notFound();
  const { title, version, source, articles } = document;
  return (
    <main className="showcase-page">
      <ShowcaseNav />
      <div className="editorial-width page-stack">
        <header className="editorial-heading">
          <div><h1>{title}</h1><p>{formatLawVersion(document)} · 共 {articles.length} 条</p></div>
          <Suspense fallback={<Link href="/resources/laws/">← 返回法条检索</Link>}><StudyLawNavigation document caseIds={caseReadingIds}
            related={slug === "tort-liability-historical" ? { slug: "civil", article: 1260, label: "查看民法典废止依据" } : null} /></Suspense>
        </header>
        <div className="editorial-panel statute-text">
          <p className="editorial-muted"><a href={source} target="_blank" rel="noreferrer">核对官方公布文本 ↗</a></p>
          {articles.map(({ number, label, section, paragraphs }, index) => (
            <article key={number} id={`article-${number}`}>
              {section && section !== articles[index - 1]?.section && <p className="statute-section">{section}</p>}
              <h2>{label}</h2>
              {paragraphs.map((paragraph, order) => <p key={order}>{paragraph}</p>)}
              <LawCitationButton title={title} version={version} label={label} />
              <Link href={`/cases/?${new URLSearchParams({ lawName: document.aliases[0], lawArticle: label })}`}>查找引用本条的案例 →</Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
