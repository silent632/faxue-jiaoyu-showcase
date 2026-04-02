import Link from "next/link";

import styles from "./study-demo-shell.module.css";

export default function StudyDemoShell({ caseItem }) {
  const steps = Array.isArray(caseItem?.studySteps) ? caseItem.studySteps : [];
  const readingStep = steps[0];
  const analyticSteps = steps.slice(1);

  return (
    <section className={styles.shell} aria-label="研习工作台">
      <div className={styles.hero}>
        <div className={styles.heroTop}>
          <span className={styles.tag}>研习工作台</span>
          <span className={styles.meta}>{caseItem.caseNumber || "案号未注明"}</span>
        </div>

        <div>
          <h2 className={styles.heroTitle}>{caseItem.title}</h2>
          <p className={styles.heroDesc}>围绕同一份裁判文书的导读摘要、事实要点、争议焦点和法理要点，逐步完成结构化研习。</p>
        </div>

        <div className={styles.heroGrid}>
          <article className={styles.metaCard}>
            <span className={styles.metaLabel}>原文导读</span>
            <p className={styles.summaryText}>{caseItem.summary || "可围绕这份裁判文书继续梳理事实、争议焦点与法理分析。"}</p>
          </article>
          <article className={styles.metaCard}>
            <span className={styles.metaLabel}>案件信息</span>
            <p className={styles.summaryText}>
              {caseItem.courtName || "法院未注明"} · {caseItem.judgmentDate || "日期未注明"} · {caseItem.causeFocus || "案由未注明"}
            </p>
          </article>
        </div>
      </div>

      <div className={styles.path}>
        <span className={styles.pathLabel}>结构化研习路径</span>
        <div className={styles.pathGrid}>
          {steps.map((step) => (
            <article key={step.id} className={styles.pathItem}>
              <span className={styles.metaLabel}>{step.label}</span>
              <strong>{step.title}</strong>
              <p>{step.prompt}</p>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.stepsGrid}>
        <article className={styles.panel}>
          <span className={styles.panelLabel}>{readingStep?.label || "原文阅读"}</span>
          <h3 className={styles.panelTitle}>{readingStep?.title || "先通读，再定位关键事实"}</h3>
          <p className={styles.panelDesc}>
            先用摘要和案件基本信息建立阅读预期，再进入原文或完整研习页时，思路会更稳定。
          </p>
          <p className={styles.contentText}>{readingStep?.content || caseItem.summary || "暂无摘要信息。"}</p>
        </article>

        <article className={styles.panel}>
          <span className={styles.panelLabel}>三步输出</span>
          <h3 className={styles.panelTitle}>围绕同一份文书完成研习</h3>
          <ol className={styles.stepList}>
            {analyticSteps.map((step) => (
              <li key={step.id}>
                <strong>{step.label}：</strong>
                {step.content || "暂无参考要点。"}
              </li>
            ))}
          </ol>
        </article>
      </div>

      <Link href={`/cases/${caseItem.id}`} className={styles.backLink}>
        返回案例详情
      </Link>
    </section>
  );
}
