import Link from 'next/link';
import ShowcaseNav from '@/components/showcase-nav';
import KnowledgeMap, { ChapterBranches } from '@/components/knowledge-map';
import { loadCourseTasks } from '@/lib/content/course-tasks.js';
import { getPublicJurisprudenceLearning } from '@/lib/content/jurisprudence-learning.js';

export const metadata = { title: '法理学知识图谱 · 法理学学习' };

export default function KnowledgePage() {
  const { chapters, topics, caseLinks } = getPublicJurisprudenceLearning();
  const courseTasks = loadCourseTasks();

  return (
    <main className="showcase-page">
      <ShowcaseNav />
      <div className="page-wrap page-stack">
        <header className="showcase-card">
          <h1>法理学知识图谱</h1>
          <p>按章节复习概念，再用相关案例检验自己的理解。</p>
        </header>
        {chapters.length ? <KnowledgeMap chapters={chapters} /> : <p>知识点暂不可浏览。<Link href="/cases/">前往案例检索</Link></p>}
        {chapters.map(chapter => {
          const chapterTopics = topics.filter(topic => topic.chapterId === chapter.id);
          return (
            <section className="showcase-card knowledge-chapter" key={chapter.id} id={`chapter-${chapter.id}`}>
              <div className="knowledge-chapter-heading">
                <h2>{chapter.title}</h2>
                <a href="#knowledge-map-title">返回总图</a>
              </div>
              <ChapterBranches chapter={chapter} topics={chapterTopics} />
              <div className="knowledge-topic-grid">
                {chapterTopics.map(topic => {
                  const links = caseLinks.filter(link => link.topicId === topic.id);
                  const courses = courseTasks.filter(task => links.some(link => link.caseId === task.caseId));
                  return (
                    <article key={topic.id} id={topic.id} className="knowledge-topic-card">
                      <h3>{topic.title}</h3>
                      <p>{topic.summary || topic.description}</p>
                      {topic.summarySource && <p className="knowledge-source">参考出处 · {topic.summarySource}</p>}
                      <div className="knowledge-topic-links">
                        {links.length > 0 && <Link href={`/cases/?topic=${encodeURIComponent(topic.id)}`}>查看相关案例（{links.length}）</Link>}
                        {courses.map(task => <Link key={task.slug} href={`/courses/${task.slug}/`}>第{Number(task.slug.slice(-2))}期课程</Link>)}
                        <Link href={`/community/?knowledge=${encodeURIComponent(topic.id)}`}>围绕这个知识点提问</Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
