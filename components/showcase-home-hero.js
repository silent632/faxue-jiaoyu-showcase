import Link from "next/link";

export default function ShowcaseHomeHero({ content, dashboardHero, trendSnapshot }) {
  const hero = dashboardHero ?? content.homeDashboard?.hero ?? {};
  const trend = trendSnapshot ?? content.homeDashboard?.trendSnapshot ?? { title: "", points: [] };
  const quickKpis = (content.homeDashboard?.kpis ?? []).slice(0, 3);
  const reviewPoints = (content.platformHighlights ?? []).slice(0, 3);

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
              <span className="showcase-section-eyebrow">审阅摘要</span>
              <h2>先看平台是否真的在用，再看它如何支撑教学</h2>
              <p>右侧不再堆入口说明，而是直接给出专家审阅最关心的三组判断线索。</p>
            </div>

            <div className="showcase-home-review-points">
              {reviewPoints.map((item) => (
                <article key={item.title} className="showcase-home-review-card">
                  <span>{item.eyebrow}</span>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>

            <div className="showcase-home-review-foot">
              <strong>{trend.title}</strong>
              <p>{trend.points[0] || "平台运行、案例检索、研习工作台与课程视频已形成可抽查的连续链路。"}</p>
            </div>

            <div className="showcase-home-support-links" aria-label="成果详情入口">
              <Link href="/cases" className="showcase-home-support-link">
                <span>案例检索</span>
                <strong>直接抽查案例、详情与研习链路</strong>
              </Link>
              <Link href="/impact" className="showcase-home-support-link">
                <span>成效展示</span>
                <strong>查看趋势、覆盖与支撑证据</strong>
              </Link>
              <Link href="/resources" className="showcase-home-support-link">
                <span>课程视频</span>
                <strong>查看课程回看与教学证明材料</strong>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
