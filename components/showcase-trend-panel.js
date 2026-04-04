export default function ShowcaseTrendPanel({ trendSnapshot, panels = [], className = "" }) {
  const trend = trendSnapshot && typeof trendSnapshot === "object" ? trendSnapshot : {};
  const points = Array.isArray(trend.points) ? trend.points : [];
  const panelList = Array.isArray(panels) ? panels : [];
  const sectionClassName = ["homepage-trend-panel", "showcase-card", className].filter(Boolean).join(" ");

  return (
    <section className={sectionClassName} aria-label="平台运行趋势摘要">
      <div className="homepage-band-head">
        <span className="showcase-section-eyebrow">运行趋势</span>
        <h2>{trend.title || "平台运行趋势"}</h2>
      </div>

      <div className="homepage-trend-layout">
        <ul className="homepage-trend-points">
          {points.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="homepage-trend-cards">
          {panelList.map((panel, index) => (
            <article key={panel.title || `trend-${index}`} className="homepage-trend-card">
              <span>{panel.title || `趋势板块 ${index + 1}`}</span>
              <strong>{panel.value || "持续更新中"}</strong>
              <p>{panel.detail || "平台运行指标持续跟踪课堂与应用反馈。"}</p>
              <small>
                {panel.metricLabel || "指标"}：{panel.metricValue || "更新中"}
              </small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
