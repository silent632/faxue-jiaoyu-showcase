import Link from "next/link";

const DEFAULT_FEEDBACK = Object.freeze({
  ok: true,
  tone: "soft",
  title: "研习说明",
  message: "可在线继续记录研习内容并整理完善，填写结果会保存在当前浏览器中，完成后可导出留存。",
});

function normalizeFeedback(item) {
  if (!item) return null;
  if (item.ok && item.tone === "success") return item;
  return {
    ...item,
    title: item.title || "研习说明",
    tone: item.tone === "success" ? "success" : "soft",
    message: "可继续在线整理研习内容，完成后可导出记录留存。",
  };
}

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
  caseId,
  hasPdf,
  mode,
  doneCount,
  recommendedModules,
  copy,
  exporting,
  exportFeedback,
  onExport,
}) {
  const feedbackItems = [
    exportFeedback ? { key: "export", ...normalizeFeedback(exportFeedback) } : null,
  ].filter(Boolean);

  return (
    <section className={`study-actions-card card${mode === "guide" ? " study-actions-card-guide" : ""}`}>
      <div className="study-actions-head">
        <div className="study-actions-copy">
          <span className="section-eyebrow">结尾动作</span>
          <h2 className="study-actions-title">完成这次研习</h2>
          <p className="study-actions-desc">
            {hasPdf
              ? "填写内容可继续保存在当前浏览器中，并在整理完成后导出研习记录。"
              : "先完成三步写作，再把事实梳理、争点与法理分析导出留存。"}
          </p>
        </div>
      </div>

      <div className="study-actions-main">
        <button className="btn btn-primary" type="button" onClick={onExport} disabled={exporting}>
          {exporting ? "导出中..." : "导出研习记录"}
        </button>
      </div>

      <div className={`study-next-panel${doneCount === 3 ? " is-ready" : " is-locked"}`}>
        <div>
          <span className="section-eyebrow">{copy?.eyebrow}</span>
          <h3>{copy?.title}</h3>
          <p>{doneCount === 3 ? copy?.readyDescription : copy?.lockedDescription}</p>
        </div>
        {doneCount === 3 ? (
          <div className="study-next-links">
            {(recommendedModules || []).map((item) => (
              <Link key={item.id} href={`/experiments/${item.id}?case=${caseId}`} className="btn btn-outline">
                {item.shortName}
              </Link>
            ))}
            <Link href="/archive" className="btn btn-ghost">{copy?.archiveLabel}</Link>
          </div>
        ) : (
          <div className="exp-ws3-stage-locked">
            <span className="exp-ws3-lock-num">{doneCount}/3</span>
            <span>{copy?.lockedDescription}</span>
          </div>
        )}
      </div>

      <div className="study-feedback-stack">
        {feedbackItems.length ? (
          feedbackItems.map((item) => <FeedbackBox key={item.key} item={item} />)
        ) : (
          <FeedbackBox item={DEFAULT_FEEDBACK} />
        )}
      </div>
    </section>
  );
}
