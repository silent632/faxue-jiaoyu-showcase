import Link from "next/link";
import ShowcaseHomeHero from "@/components/showcase-home-hero";
import ShowcaseOperationsBand from "@/components/showcase-operations-band";
import ShowcaseTrendPanel from "@/components/showcase-trend-panel";
import TopNav from "@/components/top-nav";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { getShowcaseCanonicalStudyHref, loadShowcaseCases } from "@/lib/showcase-cases";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default async function HomePage() {
  const content = buildShowcaseContent();
  const user = getPublicShowcaseUser();
  const studyHref = getShowcaseCanonicalStudyHref();
  const cases = await loadShowcaseCases();
  const featuredCases = cases.slice(0, 3);
  const coverageCards = content.impactDashboard?.coverageCards ?? [];
  const trendPanels = content.impactDashboard?.trendPanels ?? [];
  const reviewHighlights = [
    "首页只保留专家审阅真正需要先看到的结果、趋势与覆盖证据。",
    "案例检索、详情页、研习工作台和 PDF 原文现在都可以直接抽查。",
    "课程视频与课程体系退居支撑位，避免首页继续像成果堆砌页。",
  ];
  const evidenceCards = [
    {
      eyebrow: "运行证据",
      title: trendPanels[0]?.value || "运行指标持续更新",
      description: trendPanels[0]?.detail || "围绕访问、活跃与课程迭代形成连续运行轨迹。",
      metric: `${trendPanels[0]?.metricLabel || "指标"} · ${trendPanels[0]?.metricValue || "更新中"}`,
    },
    {
      eyebrow: "覆盖证据",
      title: coverageCards[0]?.title || "教学建设覆盖",
      description: coverageCards[0]?.description || "课程、任务单和评价指标已形成支撑闭环。",
      metric: coverageCards[0]?.coverageValue || "持续扩展",
    },
    {
      eyebrow: "链路证据",
      title: "案例检索、导读判断与研习工作台已打通",
      description: "专家可直接从检索结果抽样进入详情页，再进入研习页与 PDF 原文核查。",
      metric: "检索 -> 详情 -> 研习 -> PDF",
    },
  ];

  return (
    <main className="showcase-page">
      <TopNav user={user} items={content.nav} />

      <div className="showcase-page-body">
        <ShowcaseHomeHero
          content={content}
          dashboardHero={content.homeDashboard.hero}
          trendSnapshot={content.homeDashboard.trendSnapshot}
        />

        <ShowcaseOperationsBand kpis={content.homeDashboard.kpis} className="homepage-operations-kpis" />

        <ShowcaseTrendPanel
          trendSnapshot={content.homeDashboard.trendSnapshot}
          panels={trendPanels}
          className="homepage-trend-summary"
        />

        <section className="homepage-review-strip showcase-card" aria-label="审阅提示">
          {reviewHighlights.map((item, index) => (
            <article key={item} className="homepage-review-item">
              <span>{`0${index + 1}`}</span>
              <strong>{item}</strong>
            </article>
          ))}
        </section>

        <section className="homepage-coverage-band showcase-card" aria-label="平台应用覆盖">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">应用覆盖</span>
            <h2>不只展示结果，还要给出足够硬的审阅证据</h2>
            <p>首页中段集中呈现运行、覆盖与使用链路三类证据，帮助专家快速判断平台是否真实可查、可用、可复核。</p>
          </div>

          <div className="homepage-evidence-grid">
            {evidenceCards.map((item) => (
              <article key={item.title} className="homepage-evidence-card">
                <span className="showcase-card-eyebrow">{item.eyebrow}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <small>{item.metric}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="homepage-platform-entry-grid showcase-card" aria-label="平台入口总览">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">审阅入口</span>
            <h2>需要深入核查时，首页后段保留三类直接入口</h2>
            <p>把案例检索、样本案例和研习工作台压缩成一段明确的审阅轨道，减少首页继续铺陈说明性内容。</p>
          </div>

          <div className="homepage-entry-rail">
            <div className="homepage-platform-entry-list">
              {content.homeEntries.map((item) => (
                <Link key={item.href} href={item.href} className="homepage-platform-entry-card">
                  <span className="showcase-card-eyebrow">{item.label}</span>
                  <strong>{item.description}</strong>
                </Link>
              ))}
            </div>

            <div className="homepage-platform-live-list">
              {featuredCases.map((item) => (
                <Link key={item.id} href={`/cases/${item.id}`} className="homepage-platform-case-card">
                  <span>{item.caseNumber || item.causeFocus || "典型案例"}</span>
                  <strong>{item.title}</strong>
                </Link>
              ))}

              <Link href={studyHref} className="homepage-platform-case-card is-action">
                <span>工作台入口</span>
                <strong>直接进入研习工作台，检查结构化研习链路</strong>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
