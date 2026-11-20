'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

function BranchDiagram({ label, center, nodes }) {
  const positions = nodes.map((node, index) => {
    const angle = index / nodes.length * Math.PI * 2 - Math.PI / 2;
    return { ...node, x: 50 + Math.cos(angle) * 39, y: 50 + Math.sin(angle) * 37 };
  });

  return (
    <nav className="knowledge-diagram" aria-label={label}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {positions.map(({ id, x, y, active }) => <line key={id} className={active ? "knowledge-branch-active" : undefined} pathLength="1" x1="50" y1="50" x2={x} y2={y} />)}
      </svg>
      <strong className="knowledge-diagram-center">{center}</strong>
      {positions.map(({ id, title, href, active, x, y }) => (
        <a className="knowledge-diagram-node" href={href} key={id}
          aria-current={active ? 'location' : undefined} style={{ '--node-x': `${x}%`, '--node-y': `${y}%` }}>
          {title}
        </a>
      ))}
    </nav>
  );
}

function DescendantTopics({ topics, parent, current }) {
  const children = topics.filter(topic => topic.parentId === parent);
  if (!children.length) return null;
  return <ul>{children.map(child => <li key={child.id}>
    <a href={`#${child.id}`} aria-current={child.id === current ? 'location' : undefined}>{child.title}</a>
    <DescendantTopics topics={topics} parent={child.id} current={current} />
  </li>)}</ul>;
}

export default function KnowledgeMap({ chapters, topics, courseLinks, caseLinks }) {
  const [target, setTarget] = useState('');
  useEffect(() => {
    const sync = () => setTarget(window.location.hash.slice(1));
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const selected = topics.find(topic => topic.id === target);
  const chapter = chapters.find(item => item.id === (selected?.chapterId || target.replace(/^chapter-/, '')));
  const selection = chapter ? topics.filter(topic => topic.chapterId === chapter.id) : [];
  const branches = selection.filter(topic => !topic.parentId);
  const active = selected || branches[0];
  let branch = active;
  while (branch?.parentId) branch = selection.find(topic => topic.id === branch.parentId);
  const matches = caseLinks.filter(link => link.topicId === active?.id);
  const courses = courseLinks.filter(course => matches.some(link => link.caseId === course.caseId));

  return (
    <section className="knowledge-atlas" id="chapters" aria-label="法理学知识图谱">
      {chapter ? <>
        <div className="knowledge-atlas-bar">
          <a href="#chapters">← 全部章节</a>
          <h2>{chapter.title}</h2>
        </div>
        <BranchDiagram label={`${chapter.title}知识点`} center={chapter.title}
          nodes={branches.map(topic => ({ ...topic, href: `#${topic.id}`, active: topic.id === branch?.id }))} />
        {active && <article className="knowledge-focus" key={active.id}>
          <h3>{active.title}</h3>
          {active.sections.map(section => <section key={section.title} className="knowledge-lesson-section">
            <h4>{section.title}</h4>
            {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </section>)}
          <DescendantTopics topics={selection} parent={branch?.id} current={active.id} />
          {matches.length > 0 && <div className="knowledge-topic-links">
            <Link href={`/cases/?topic=${encodeURIComponent(active.id)}`}>查看相关案例（{matches.length}）</Link>
            {courses.map(task => <Link key={task.slug} href={`/courses/${task.slug}/`}>第{Number(task.slug.slice(-2))}期课程</Link>)}
          </div>}
        </article>}
      </> : <BranchDiagram label="法理学章节" center="法理学"
        nodes={chapters.map(item => ({ ...item, href: `#chapter-${item.id}` }))} />}
    </section>
  );
}
