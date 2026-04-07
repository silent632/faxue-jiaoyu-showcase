import { getPublicStudyOverviewDescription } from "@/lib/public-showcase-study";

export default function StudyWorkspaceOverview({
  hasPdf,
  mode,
  saveInfo,
  doneCount,
  totalChars,
  availableRefCount,
  completionText,
  actionLabel,
}) {
  return (
    <section className={`study-overview glass-sm${mode === "guide" ? " study-overview-guide" : ""}`}>
      <div className="study-overview-head">
        <div className="study-overview-copy">
          <span className="section-eyebrow">写作工作台</span>
          <h2 className="study-overview-title">{hasPdf ? "先独立作答，再逐步对照参考" : "跟着导读抓手，完成这次三步研习"}</h2>
          <p className="study-overview-desc">{getPublicStudyOverviewDescription({ hasPdf })}</p>
        </div>
        <div className="study-save-pill">{saveInfo}</div>
      </div>

      <div className="study-overview-grid">
        <article className="study-metric-card">
          <span className="study-metric-label">当前进度</span>
          <strong className="study-metric-value">{doneCount} / 3</strong>
          <p className="study-metric-hint">完成三步后，可导出本次研习记录。</p>
        </article>
        <article className="study-metric-card">
          <span className="study-metric-label">已写字数</span>
          <strong className="study-metric-value">{totalChars}</strong>
          <p className="study-metric-hint">每一步达到 50 字后即可查看参考要点。</p>
        </article>
        <article className="study-metric-card">
          <span className="study-metric-label">参考要点</span>
          <strong className="study-metric-value study-metric-value-sm">{availableRefCount} / 3</strong>
          <p className="study-metric-hint">事实、争点、法理三部分都可分别对照。</p>
        </article>
      </div>

      <div className="study-overview-callout">
        <strong>{actionLabel}</strong>
        <p>{completionText}</p>
      </div>
    </section>
  );
}
