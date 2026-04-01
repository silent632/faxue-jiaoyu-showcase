import Link from "next/link";

export default function ShowcaseHomeHero({ content, featuredCases = [], canonicalStudyHref }) {
  const metrics = Object.values(content.metrics);

  return (
    <section className="showcase-home-hero">
      <div className="showcase-home-hero-main">
        <div className="showcase-hero-copy">
          <p className="showcase-hero-kicker">项目概览</p>
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
            <span className="showcase-section-eyebrow">平台概览</span>
            <h2>围绕案例阅读与研习组织平台入口</h2>
            <p>首页汇集案例检索、案例阅读与研习入口，便于从平台结构中把握课程运行与学习路径。</p>
          </div>

          <div className="showcase-home-preview-grid">
            <article className="showcase-home-preview-card">
              <span className="showcase-card-eyebrow">案例阅读</span>
              <strong>检索、详情与导读相互衔接</strong>
              <ul className="showcase-preview-list">
                {content.homePreview.featuredCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="showcase-home-preview-card">
              <span className="showcase-card-eyebrow">研习工作台</span>
              <strong>围绕同一份文书完成结构化输出</strong>
              <ul className="showcase-preview-list">
                {content.homePreview.studyHighlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href={canonicalStudyHref} className="showcase-inline-link">
                查看研习工作台
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
