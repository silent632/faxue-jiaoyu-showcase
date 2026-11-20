import Link from 'next/link';
import ShowcaseNav from '@/components/showcase-nav';
import KnowledgeMap from '@/components/knowledge-map';
import { loadCourseTasks } from '@/lib/content/course-tasks.js';
import { getPublicJurisprudenceLearning } from '@/lib/content/jurisprudence-learning.js';

export const metadata = { title: '法理学知识图谱 · 法理学学习' };

export default function KnowledgePage() {
  const { chapters, topics, caseLinks } = getPublicJurisprudenceLearning();
  const publicTopics = topics.map(({ id, title, chapterId, parentId, revisionSections }) => ({
    id, title, chapterId, parentId,
    sections: revisionSections.map(({ title, paragraphs }) => ({ title, paragraphs })),
  }));
  const courseLinks = loadCourseTasks().map(({ slug, caseId }) => ({ slug, caseId }));
  return (
    <main className="showcase-page">
      <ShowcaseNav />
      <div className="editorial-width page-stack">
        <header className="editorial-heading">
          <div><h1>法理学知识图谱</h1><p>按章节复习概念，结合相关裁判文书理解法理。</p></div>
          <Link href="/cases/">浏览案例 →</Link>
        </header>
        {chapters.length > 0 && <KnowledgeMap chapters={chapters} topics={publicTopics} caseLinks={caseLinks} courseLinks={courseLinks} />}
      </div>
    </main>
  );
}
