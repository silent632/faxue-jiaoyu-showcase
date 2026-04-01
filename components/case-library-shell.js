import Link from "next/link";
import styles from "./case-library-shell.module.css";

function formatDate(dateString) {
  if (!dateString) return "日期未注明";
  return dateString;
}

export default function CaseLibraryShell({ rows }) {
  const featuredRows = rows.slice(0, 12);

  return (
    <section className={styles.shell} aria-label="案例检索库内容">
      <div className={styles.summary}>
        <article className={styles.stat}>
          <span>公开案例</span>
          <strong>{rows.length}</strong>
        </article>
        <article className={styles.stat}>
          <span>示范入口</span>
          <strong>真实源数据</strong>
        </article>
        <article className={styles.stat}>
          <span>教学定位</span>
          <strong>研习导读</strong>
        </article>
      </div>

      <div className={styles.grid}>
        {featuredRows.map((item) => (
          <Link key={item.id} href={`/cases/${item.id}`} className={styles.card}>
            <p className={styles.eyebrow}>{item.caseNumber || item.id}</p>
            <h2>{item.title}</h2>
            <p className={styles.meta}>{item.courtName || "法院信息未注明"}</p>
            <p className={styles.meta}>{formatDate(item.judgmentDate)}</p>
            <p className={styles.summaryText}>{item.causeFocus || item.resultText || item.summary}</p>
            <span className={styles.link}>查看详情</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
