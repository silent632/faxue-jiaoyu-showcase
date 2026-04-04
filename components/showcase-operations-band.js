export default function ShowcaseOperationsBand({ kpis = [], className = "" }) {
  const sectionClassName = ["homepage-operations-band", "showcase-card", className].filter(Boolean).join(" ");

  return (
    <section className={sectionClassName} aria-label="平台关键指标">
      <div className="homepage-band-head">
        <span className="showcase-section-eyebrow">关键指标</span>
        <h2>平台运行结果已形成稳定指标面板</h2>
        <p>围绕用户规模、访问活跃与工作台留存，首页直接展示当前运行状态。</p>
      </div>

      <div className="homepage-kpi-grid">
        {kpis.map((item) => (
          <article key={item.label} className="homepage-kpi-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
