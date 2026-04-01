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
    exportFeedback ? { key: "export", ...exportFeedback } : null,
    submitFeedback ? { key: "submit", ...submitFeedback } : null,
  ].filter(Boolean);

  return (
    <section className="study-actions-card card">
      <div className="study-actions-head">
        <div className="study-actions-copy">
          <span className="section-eyebrow">结尾动作</span>
          <h2 className="study-actions-title">完成这次研习</h2>
          <p className="study-actions-desc">公开展示模式下会保留导出与本地草稿体验，但不会向真实后台提交记录。</p>
        </div>
      </div>

      <div className="study-actions-main">
        <button className="btn btn-primary" type="button" onClick={onExport} disabled={exporting}>
          {exporting ? "导出中..." : "导出研习记录"}
        </button>
        <button className="btn btn-accent" type="button" onClick={onSubmit} disabled={submitting}>
          {submitting ? "处理中..." : "提交研习（展示模式）"}
        </button>
      </div>

      <div className="study-feedback-stack">
        {feedbackItems.length ? (
          feedbackItems.map((item) => <FeedbackBox key={item.key} item={item} />)
        ) : (
          <FeedbackBox
            item={{
              ok: true,
              tone: "soft",
              title: "公开展示说明",
              message: "你可以继续填写三步内容，系统会在本地保存草稿；提交按钮仅用于展示平台的真实工作流结构。",
            }}
          />
        )}
      </div>
    </section>
  );
}
