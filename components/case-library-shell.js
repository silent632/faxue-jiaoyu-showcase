import Link from "next/link";

function formatDate(dateString) {
  if (!dateString) return "日期未注明";
  return dateString;
}

const shellStyles = {
  display: "grid",
  gap: "18px",
};

const summaryStyles = {
  display: "grid",
  gap: "14px",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
};

const statStyles = {
  borderRadius: "22px",
  padding: "18px",
  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(249, 246, 241, 0.96))",
  border: "1px solid rgba(139, 91, 43, 0.12)",
  boxShadow: "0 20px 45px rgba(28, 47, 66, 0.09)",
};

const gridStyles = {
  display: "grid",
  gap: "14px",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
};

const cardStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  minHeight: "220px",
  padding: "22px",
  borderRadius: "24px",
  background: "linear-gradient(160deg, rgba(255, 255, 255, 0.96), rgba(250, 245, 237, 0.98))",
  border: "1px solid rgba(25, 49, 72, 0.12)",
  boxShadow: "0 20px 45px rgba(28, 47, 66, 0.09)",
};

export default function CaseLibraryShell({ rows }) {
  const featuredRows = rows.slice(0, 12);

  return (
    <section style={shellStyles} aria-label="案例检索库内容">
      <div style={summaryStyles}>
        <article style={statStyles}>
          <span>公开案例</span>
          <strong>{rows.length}</strong>
        </article>
        <article style={statStyles}>
          <span>示范入口</span>
          <strong>真实源数据</strong>
        </article>
        <article style={statStyles}>
          <span>教学定位</span>
          <strong>研习导读</strong>
        </article>
      </div>

      <div style={gridStyles}>
        {featuredRows.map((item) => (
          <Link key={item.id} href={`/cases/${item.id}`} style={cardStyles}>
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
