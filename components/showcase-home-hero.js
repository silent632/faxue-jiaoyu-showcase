import Link from "next/link";

export default function ShowcaseHomeHero({ content, featuredCases = [], canonicalStudyHref }) {
  const metrics = Object.values(content.metrics);
  const heroContent = content.homeHero;

  return (
    <section className="showcase-home-hero">
      <div className="showcase-home-hero-main">
        <div className="showcase-hero-copy">
          <p className="showcase-hero-kicker">{heroContent.kicker}</p>
          <h1>{content.site.title}</h1>
          <p className="showcase-hero-subtitle">{content.site.subtitle}</p>
          <p className="showcase-hero-brief">{heroContent.brief}</p>
          <p className="showcase-hero-intro">{content.site.intro}</p>

          <div className="showcase-home-actions" aria-label="核心功能入口">
            {heroContent.primaryModules.map((item, index) => (
              <Link key={item.href} href={item.href} className="showcase-home-action-card">
                <span>{index === 0 ? "核心入口一" : "核心入口二"}</span>
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>

          <div className="showcase-home-secondary-links" aria-label="补充入口">
            {heroContent.secondaryModules.map((item) => (
              <Link key={item.href} href={item.href} className="showcase-home-secondary-link">
                <span>{item.label}</span>
                <strong>{item.description}</strong>
              </Link>
            ))}
          </div>
        </div>

        <aside className="showcase-home-preview">
          <div className="showcase-home-preview-head">
            <span className="showcase-section-eyebrow">平台概览</span>
            <h2>围绕案例研习组织平台首屏</h2>
            <p>首页首先呈现案例检索与研习工作台，再由案例详情承担阅读衔接与导读判断。</p>
          </div>

          <div className="showcase-home-fact-list" aria-label="平台首页说明">
            {heroContent.supportingFacts.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>

          <div className="showcase-home-preview-grid">
            <article className="showcase-home-preview-card">
              <span className="showcase-card-eyebrow">案例阅读</span>
              <strong>检索结果与案例导读形成稳定入口</strong>
              <ul className="showcase-preview-list">
                {content.homePreview.featuredCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="showcase-home-preview-card">
              <span className="showcase-card-eyebrow">研习工作台</span>
              <strong>围绕同一份文书完成结构化研习</strong>
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

      <section className="showcase-metrics-band" aria-label="平台概览指标">
        <div className="showcase-metrics-intro">
          <span className="showcase-card-eyebrow">平台概况</span>
          <strong>课程建设、案例资源与平台运行指标</strong>
          <p>指标信息与首页主入口并置，便于快速理解平台规模与建设基础。</p>
        </div>

        <div className="showcase-metrics">
          {metrics.map((metric) => (
            <article key={metric.label} className="showcase-metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
