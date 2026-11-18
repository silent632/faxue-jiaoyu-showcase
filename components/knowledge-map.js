import Link from 'next/link';

export default function KnowledgeMap({ chapters }) {
  return <section className="knowledge-map-card" aria-labelledby="knowledge-map-title">
    <h2 id="knowledge-map-title">选择复习章节</h2>
    <p>从法理学的整体结构出发，选择一个章节查看知识点。</p>
    <div className="knowledge-map" aria-label="法理学章节图">
      <svg className="knowledge-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {chapters.map((chapter, index) => {
          const angle = (index / chapters.length) * Math.PI * 2 - Math.PI / 2;
          return <line key={chapter.id} x1="50" y1="50" x2={50 + 38 * Math.cos(angle)} y2={50 + 37 * Math.sin(angle)} />;
        })}
      </svg>
      <div className="knowledge-map-center" aria-hidden="true">法理学<br />知识图谱</div>
      {chapters.map((chapter, index) => {
        const angle = (index / chapters.length) * Math.PI * 2 - Math.PI / 2;
        const style = { '--map-x': `${50 + 38 * Math.cos(angle)}%`, '--map-y': `${50 + 37 * Math.sin(angle)}%` };
        return <a key={chapter.id} className="knowledge-map-node" style={style} href={`#chapter-${chapter.id}`}>{chapter.title}</a>;
      })}
    </div>
    <div className="knowledge-map-list">
      {chapters.map(chapter => <a key={chapter.id} href={`#chapter-${chapter.id}`}>{chapter.title}</a>)}
    </div>
    <Link href="/cases/" className="btn btn-outline">浏览全部案例</Link>
  </section>;
}

function BranchNodes({ topics, parentId }) {
  const children = topics.filter(topic => topic.parentId === parentId);
  if (!children.length) return null;

  return (
    <ul>
      {children.map(topic => (
        <li key={topic.id}>
          <a href={`#${topic.id}`}>{topic.title}</a>
          <BranchNodes topics={topics} parentId={topic.id} />
        </li>
      ))}
    </ul>
  );
}

export function ChapterBranches({ chapter, topics }) {
  return (
    <div className="knowledge-chapter-map" aria-label={`${chapter.title}的知识分支`}>
      <strong>{chapter.title}</strong>
      <BranchNodes topics={topics} />
    </div>
  );
}
