import { getPublicStudyDefaultFeedback, normalizePublicStudyFeedback } from "@/lib/public-showcase-study";

function FeedbackBox({ item }) {
  const toneClass = item?.ok ? "success" : item?.tone === "warning" ? "warning" : "soft";

  return (
    <div className={`study-feedback-box ${toneClass}`}>
      <strong>{item.title || (item.ok ? "操作成功" : "提示")}</strong>
      <p>{item.message}</p>
    </div>
  );
}

export default function StudyWorkspaceActions({
  exporting,
  submitting,
  exportFeedback,
  submitFeedback,
  onExport,
  onSubmit,
}) {
  const feedbackItems = [
    exportFeedback ? { key: "export", ...normalizePublicStudyFeedback(exportFeedback) } : null,
    submitFeedback ? { key: "submit", ...normalizePublicStudyFeedback(submitFeedback) } : null,
  ].filter(Boolean);

  return (
    <section className="study-actions-card card">
      <div className="study-actions-head">
        <div className="study-actions-copy">
          <span className="section-eyebrow">结尾动作</span>
          <h2 className="study-actions-title">完成这次研习</h2>
          <p className="study-actions-desc">填写内容可继续保存在当前浏览器中，并在整理完成后导出研习记录。</p>
        </div>
      </div>

      <div className="study-actions-main">
        <button className="btn btn-primary" type="button" onClick={onExport} disabled={exporting}>
          {exporting ? "导出中..." : "导出研习记录"}
        </button>
        <button className="btn btn-accent" type="button" onClick={onSubmit} disabled={submitting}>
          {submitting ? "处理中..." : "提交研习"}
        </button>
      </div>

      <div className="study-feedback-stack">
        {feedbackItems.length ? (
          feedbackItems.map((item) => <FeedbackBox key={item.key} item={item} />)
        ) : (
          <FeedbackBox item={getPublicStudyDefaultFeedback()} />
        )}
      </div>
    </section>
  );
}
