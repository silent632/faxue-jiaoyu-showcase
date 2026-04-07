import { charLen, STUDY_STEP_MIN_CHARS } from "@/lib/study-workspace";

export default function StudyWorkspaceStepCard({
  idx,
  title,
  prompt,
  value,
  onChange,
  showRef,
  onToggleRef,
  refText,
}) {
  const count = charLen(value);
  const done = count >= STUDY_STEP_MIN_CHARS;
  const canOpenRef = done && !!refText;
  const remaining = Math.max(0, STUDY_STEP_MIN_CHARS - count);
  const refButtonLabel = showRef
    ? "收起参考要点"
    : !refText
      ? "暂无参考要点"
      : canOpenRef
        ? "对照参考要点"
        : `再写 ${remaining} 字后可对照`;
  const stepNote = canOpenRef
    ? "可结合参考要点检查是否遗漏关键事实、争点或法理。"
    : refText
      ? `写满 ${STUDY_STEP_MIN_CHARS} 字后可查看参考要点。`
      : "当前步骤暂未提供参考要点，可继续完成自己的分析。";

  return (
    <section className="study-step-card card">
      <div className="study-step-head">
        <div className="study-step-title-group">
          <span className="step-badge">{idx}</span>
          <div className="study-step-title-copy">
            <h3 className="study-step-title">{title}</h3>
            <p className="study-step-brief">{stepNote}</p>
          </div>
        </div>
        <span className={`study-step-status${done ? " done" : ""}`}>{done ? "已完成初稿" : `待写满 ${STUDY_STEP_MIN_CHARS} 字`}</span>
      </div>

      <div className="hint-box study-step-prompt">
        <span className="study-step-prompt-label">写作任务</span>
        <p className="study-step-prompt-text">{prompt}</p>
      </div>

      <textarea
        className="input study-step-textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="在这里输入你的分析内容..."
      />

      <div className="study-step-foot">
        <div className="study-step-count-wrap">
          <span className={`study-step-count${done ? " done" : ""}`}>
            {count} / {STUDY_STEP_MIN_CHARS} 字
          </span>
          <span className="study-step-tip">{stepNote}</span>
        </div>
        <div className="study-step-actions">
          <button
            className="btn btn-ghost"
            type="button"
            disabled={!canOpenRef}
            title={!done ? "完成当前分析后即可查看参考要点。" : !refText ? "当前暂无参考要点。" : ""}
            onClick={onToggleRef}
          >
            {refButtonLabel}
          </button>
        </div>
      </div>

      {showRef ? (
        <div className="ref-box study-ref-box">
          <div className="study-ref-head">
            <strong>参考要点</strong>
            <span>对照与补充参考</span>
          </div>
          <p className="study-ref-text">{refText || "当前暂无参考要点。"}</p>
        </div>
      ) : null}
    </section>
  );
}
