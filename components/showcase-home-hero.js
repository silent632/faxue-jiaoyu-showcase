import Link from "next/link";

export default function ShowcaseHomeHero({ content, featuredCases = [], canonicalStudyHref }) {
  const metrics = Object.values(content.metrics);
  const heroContent = content.homeHero;

  return (
    <section className="showcase-home-hall">
      <div className="showcase-home-hall-main">
        <div className="showcase-home-hall-copy showcase-hero-copy">
          <p className="showcase-hero-kicker">{heroContent.kicker}</p>
          <h1>{content.site.title}</h1>
          <p className="showcase-hero-subtitle">{content.site.subtitle}</p>
          <p className="showcase-hero-brief">{heroContent.brief}</p>
          <p className="showcase-hero-intro">{content.site.intro}</p>

          <div className="showcase-home-hall-metrics" aria-label="平台概览指标">
            <div className="showcase-home-hall-metrics-head">
              <span className="showcase-card-eyebrow">平台概况</span>
              <p>{heroContent.metricsIntro}</p>
            </div>

            <div className="showcase-metrics">
              {metrics.map((metric) => (
                <article key={metric.label} className="showcase-metric-card">
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="showcase-home-hall-aside">
          <div className="showcase-home-hall-panel">
            <div className="showcase-home-hall-panel-head">
              <span className="showcase-section-eyebrow">核心入口</span>
              <h2>从真实案例进入平台学习链路</h2>
              <p>首页保留检索、导读与研习的主要入口，便于直接进入案例浏览与教学观摩。</p>
            </div>

            <div className="showcase-home-module-grid" aria-label="核心功能入口">
              {heroContent.primaryModules.map((item) => (
                <Link key={item.href} href={item.href} className="showcase-home-module-card">
                  <span className="showcase-card-eyebrow">{item.label}</span>
                  <strong>{item.description}</strong>
                </Link>
              ))}
            </div>

            <div className="showcase-home-support-links" aria-label="补充入口">
              {heroContent.secondaryModules.map((item) => (
                <Link key={item.href} href={item.href} className="showcase-home-support-link">
                  <span>{item.label}</span>
                  <strong>{item.description}</strong>
                </Link>
              ))}
            </div>

            <div className="showcase-home-case-strip">
              {featuredCases.map((item) => (
                <Link key={item.id} href={`/cases/${item.id}`} className="showcase-home-case-pill">
                  <span>{item.caseNumber || "典型案例"}</span>
                  <strong>{item.title}</strong>
                </Link>
              ))}
            </div>

            <Link href={canonicalStudyHref} className="showcase-home-panel-link">
              进入研习工作台
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
