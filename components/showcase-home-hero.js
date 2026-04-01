import Link from "next/link";

export default function ShowcaseHomeHero({ content, featuredCases = [], canonicalStudyHref }) {
  const metrics = Object.values(content.metrics);

  return (
    <section className="showcase-home-hero">
      <div className="showcase-home-hero-main">
        <div className="showcase-hero-copy">
          <p className="showcase-hero-kicker">教学成果展示</p>
          <h1>{content.site.title}</h1>
          <p className="showcase-hero-subtitle">{content.site.subtitle}</p>
          <p className="showcase-hero-intro">{content.site.intro}</p>

          <div className="showcase-home-actions">
            {content.homeEntries.map((item) => (
              <Link key={item.href} href={item.href} className="showcase-home-action-card">
                <span>{item.label}</span>
                <strong>{item.description}</strong>
              </Link>
            ))}
          </div>
        </div>

        <aside className="showcase-home-preview">
          <div className="showcase-home-preview-head">
            <span className="showcase-section-eyebrow">真实模块预览</span>
            <h2>首页直接接上真实平台链路</h2>
            <p>展示站不再停留在概念层，而是直接承接真实检索、真实详情与真实研习页面。</p>
          </div>

          <div className="showcase-home-preview-grid">
            <article className="showcase-home-preview-card">
              <span className="showcase-card-eyebrow">真实工作区</span>
              <strong>案例检索与详情阅读</strong>
              <ul className="showcase-preview-list">
                {content.homePreview.featuredCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="showcase-home-preview-card">
              <span className="showcase-card-eyebrow">研习结构</span>
              <strong>公开展示模式下的真实工作台</strong>
              <ul className="showcase-preview-list">
                {content.homePreview.studyHighlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href={canonicalStudyHref} className="showcase-inline-link">
                直接查看研习工作台
              </Link>
            </article>
          </div>

          <div className="showcase-home-case-strip">
            {featuredCases.map((item) => (
              <Link key={item.id} href={`/cases/${item.id}`} className="showcase-home-case-pill">
                <span>{item.caseNumber || "案例"}</span>
                <strong>{item.title}</strong>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <div className="showcase-metrics" aria-label="平台概览指标">
        {metrics.map((metric) => (
          <article key={metric.label} className="showcase-metric-card">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
