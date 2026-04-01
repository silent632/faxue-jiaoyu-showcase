import Link from "next/link";

function formatDate(dateString) {
  if (!dateString) return "日期未注明";
  return dateString;
}

export default function CaseLibraryShell({ rows }) {
  const featuredRows = rows.slice(0, 12);

  return (
    <section className="case-library-shell" aria-label="案例检索库内容">
      <div className="case-library-summary">
        <article className="case-library-stat">
          <span>公开案例</span>
          <strong>{rows.length}</strong>
        </article>
        <article className="case-library-stat">
          <span>示范入口</span>
          <strong>真实源数据</strong>
        </article>
        <article className="case-library-stat">
          <span>教学定位</span>
          <strong>研习导读</strong>
        </article>
      </div>

      <div className="case-library-grid">
        {featuredRows.map((item) => (
          <Link key={item.id} href={`/cases/${item.id}`} className="case-library-card">
            <p className="case-library-eyebrow">{item.caseNumber || item.id}</p>
            <h2>{item.title}</h2>
            <p className="case-library-meta">{item.courtName || "法院信息未注明"}</p>
            <p className="case-library-meta">{formatDate(item.judgmentDate)}</p>
            <p className="case-library-summary-text">{item.causeFocus || item.resultText || item.summary}</p>
            <span className="case-library-link">查看详情</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
