function pickFirstLaw(caseItem) {
  return caseItem?.laws?.find((item) => item?.displayLaw || item?.law || item?.article) || null;
}

function formatLawLabel(item) {
  if (!item) return "结合法条与裁判理由继续完成三步研习。";

  const lawName = item.displayLaw || item.law || "相关规范";
  const article = item.article ? ` · ${item.article}` : "";
  return `${lawName}${article}`;
}

export default function StudyGuideBriefing({ caseItem }) {
  const firstLaw = pickFirstLaw(caseItem);

  return (
    <section className="study-guide-briefing glass">
      <div className="study-guide-head">
        <div className="study-guide-copy">
          <span className="section-eyebrow">案例导读</span>
          <h2 className="study-guide-title">先把握案件事实与争点，再进入结构化研习</h2>
          <p className="study-guide-desc">
            这一页会先帮你建立阅读抓手，再继续完成事实梳理、争议焦点和法理分析三步写作。
          </p>
        </div>
        <div className="study-guide-anchor">
          <span className="study-guide-anchor-label">研习抓手</span>
          <strong>{formatLawLabel(firstLaw)}</strong>
        </div>
      </div>

      <div className="study-guide-grid">
        <article className="study-guide-card">
          <span className="study-guide-card-label">案件摘要</span>
          <p>{caseItem?.summary || caseItem?.resultText || "可先结合案名、案号和裁判结果建立阅读预期。"}</p>
        </article>
        <article className="study-guide-card">
          <span className="study-guide-card-label">争点提示</span>
          <p>{caseItem?.refIssue || "先比较双方主张、抗辩与证据，再判断真正影响裁判方向的问题。"}</p>
        </article>
        <article className="study-guide-card">
          <span className="study-guide-card-label">法理切口</span>
          <p>{caseItem?.refLegal || "带着适用规则、事实涵摄和裁判理由的顺序进入写作，会更容易形成完整分析。"}</p>
        </article>
      </div>
    </section>
  );
}
