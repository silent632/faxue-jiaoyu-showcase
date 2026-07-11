const STEP_LABELS = ["事实梳理", "争议焦点", "法理分析"];

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
    <section className={`study-overview glass-sm${mode === "guide" ? " study-overview-guide" : ""}`} title={completionText}>
      <div className="study-overview-progress">
        <div className="exp-ws3-progress-label">
          Step <strong>{Math.min(doneCount + 1, 3)}</strong> / 3
        </div>
        <div className="exp-ws3-progress-track">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className={`exp-ws3-progress-seg${i < doneCount ? " done" : i === doneCount ? " done" : ""}`}>
              <span className="exp-ws3-progress-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="exp-ws3-progress-text">{label}</span>
            </div>
          ))}
        </div>
        <div className="study-save-pill">{saveInfo}</div>
      </div>

      <div className="study-status-strip">
        <span className="study-status-item">
          <span className="study-status-label">已写</span>
          <strong>{totalChars}</strong> 字
        </span>
        <span className="study-status-divider" />
        <span className="study-status-item">
          <span className="study-status-label">参考要点</span>
          <strong>{availableRefCount}/3</strong>
        </span>
        <span className="study-status-action">{actionLabel}</span>
      </div>
    </section>
  );
}
