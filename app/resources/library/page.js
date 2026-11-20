import Link from 'next/link';
import ShowcaseNav from '@/components/showcase-nav';
import ExperienceReading from '@/components/experience-reading';
import LibraryCollection from '@/components/library-collection';
import { getPublicLibrary } from '@/lib/content/library.js';
import { getPublicJurisprudenceLearning } from '@/lib/content/jurisprudence-learning.js';

export const metadata = { title: '资料专区 · 法理学学习' };

export default function LibraryPage() {
  const library = getPublicLibrary();
  const articles = library.filter(item => item.reading);
  const materials = library.filter(item => !item.reading);
  const { topics } = getPublicJurisprudenceLearning();
  return (
    <main className="showcase-page">
      <ShowcaseNav />
      <div className="editorial-width page-stack">
        <header className="editorial-heading">
          <div><h1>资料专区</h1><p>阅读往届升学经验和课程学习资料。</p></div>
          <Link href="/resources/learning/">← 返回资料与问答</Link>
        </header>
        <ExperienceReading articles={articles} />
        {materials.length ? <LibraryCollection items={materials} topics={topics} /> : (
          <section className="editorial-panel resource-entry">
            <div><h2>法考与下载资料</h2><p>暂时没有可下载的文件。</p></div>
            <Link href="/community/">交流备考问题 →</Link>
          </section>
        )}
      </div>
    </main>
  );
}
