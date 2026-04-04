import Link from "next/link";

export default function ShowcaseHomeHero({ content, dashboardHero, trendSnapshot }) {
  const hero = dashboardHero ?? content.homeDashboard?.hero ?? {};
  const trend = trendSnapshot ?? content.homeDashboard?.trendSnapshot ?? { title: "", points: [] };
  const quickKpis = (content.homeDashboard?.kpis ?? []).slice(0, 3);

  return (
    <section className="showcase-home-hall">
      <div className="showcase-home-hall-main">
        <div className="showcase-home-hall-copy showcase-hero-copy">
          <p className="showcase-hero-kicker">平台运行总览</p>
          <h1>{hero.title || content.site.title}</h1>
          <p className="showcase-hero-subtitle">{hero.summary || content.site.subtitle}</p>
          <p className="showcase-hero-brief">应用成果与推广影响已形成，首页直接呈现运行指标、趋势与覆盖结果。</p>
          <p className="showcase-hero-intro">{content.site.intro}</p>

          <div className="showcase-home-hall-metrics" aria-label="首页关键结果">
            <div className="showcase-home-hall-metrics-head">
              <span className="showcase-card-eyebrow">关键结果速览</span>
            </div>

            <div className="showcase-home-kpi-inline">
              {quickKpis.map((item) => (
                <article key={item.label} className="showcase-home-kpi-pill">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="showcase-home-hall-aside">
          <div className="showcase-home-hall-panel">
            <div className="showcase-home-hall-panel-head">
              <span className="showcase-section-eyebrow">趋势摘要</span>
              <h2>{trend.title}</h2>
              <p>运行趋势持续支撑课程迭代与成果外延，展示平台已经形成的应用状态。</p>
            </div>

            <ul className="showcase-home-trend-points">
              {trend.points.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="showcase-home-support-links" aria-label="成果详情入口">
              <Link href="/impact" className="showcase-home-support-link">
                <span>成效展示</span>
                <strong>查看教学建设与推广应用成果</strong>
              </Link>
              <Link href="/resources" className="showcase-home-support-link">
                <span>课程视频</span>
                <strong>查看课程回看与教学材料复用情况</strong>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
