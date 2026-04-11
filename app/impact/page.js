import Link from "next/link";

import TopNav from "@/components/top-nav";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function ImpactPage() {
  const content = buildShowcaseContent();
  const user = getPublicShowcaseUser();
  const trendPanels = content.impactDashboard?.trendPanels ?? [];
  const coverageCards = content.impactDashboard?.coverageCards ?? [];
  const impactSections = content.impact?.sections ?? [];
  const summaryCards = [
    { label: "案例总量", value: content.metrics.caseCount.value, note: "案例详情与 PDF 原文已连通" },
    { label: "课程周期", value: content.metrics.coursePeriods.value, note: "八期课程覆盖连续主题" },
    { label: "视频播放", value: content.metrics.totalVideoPlays.value, note: "课程视频播放超过 5 万次" },
    { label: "平台使用者", value: content.metrics.registeredUsers.value, note: "平台运行保持稳定覆盖" },
  ];
  const summaryLedger = [
    {
      label: "平台运行",
      point: "访问、活跃和回访数据能够直接说明平台状态。",
    },
    {
      label: "课程建设",
      point: "八期课程、课程视频和课程档案已经连通。",
    },
    {
      label: "推广应用",
      point: "课程视频累计播放 5万+，传播结果已经清晰可见。",
    },
  ];

  return (
    <main className="showcase-page">
      <TopNav user={user} items={content.nav} />

      <div className="showcase-page-body">
        <section className="impact-summary-deck showcase-card" aria-label="成效总览">
          <div className="impact-summary-main">
            <p className="showcase-page-kicker">成效展示</p>
            <h1>平台应用结果总览</h1>
            <p>查看平台运行、课程建设和传播结果。</p>
          </div>

          <div className="impact-summary-inline">
            {summaryCards.map((item) => (
              <article key={item.label} className="impact-summary-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
              </article>
            ))}
          </div>

          <div className="impact-summary-ledger">
            {summaryLedger.map((item) => (
              <article key={item.label} className="impact-summary-note">
                <span>{item.label}</span>
                <strong>{item.point}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="impact-trend-section showcase-card" aria-label="运行趋势">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">运行趋势</span>
            <h2>平台运行</h2>
            <p>访问、活跃和回访数据保持稳定。</p>
          </div>

          <div className="impact-dashboard-grid">
            {trendPanels.map((panel) => (
              <article key={panel.title} className="homepage-trend-card">
                <span>{panel.title}</span>
                <strong>{panel.value}</strong>
                <p>{panel.detail}</p>
                <small>
                  {panel.metricLabel}：{panel.metricValue}
                </small>
              </article>
            ))}
          </div>
        </section>

        <section className="impact-coverage-section showcase-card" aria-label="应用覆盖">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">应用覆盖</span>
            <h2>课程建设与应用覆盖</h2>
            <p>课程、资源和展示入口已经连成一体。</p>
          </div>

          <div className="impact-grid-two-up">
            {coverageCards.map((item) => (
              <article key={item.title} className="homepage-coverage-card">
                <span>{item.title}</span>
                <strong>{item.coverageValue}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="impact-proof-ledger showcase-card" aria-label="成果概览">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">成果概览</span>
            <h2>代表性成果</h2>
            <p>课程建设、学生发展、平台运行和推广结果集中展示。</p>
          </div>

          <div className="impact-dashboard-grid">
            {impactSections.map((item) => (
              <article key={item.title} className="showcase-card impact-proof-card">
                <span className="showcase-card-eyebrow">{item.title}</span>
                <strong>{item.intro}</strong>
                <p>{item.points[0]}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="impact-support-appendix showcase-card" aria-label="后续查看">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">后续查看</span>
            <h2>继续查看课程视频和课程体系</h2>
            <p>课程视频和课程档案都可以继续展开查看。</p>
          </div>

          <div className="impact-grid-two-up">
            <Link href="/resources" className="showcase-entry-card impact-entry-card">
              <span>课程视频</span>
              <strong>查看八期课程视频成果</strong>
              <p>前四期与后四期的阶段说明、八期主卡片与本期观看入口在此统一呈现。</p>
            </Link>

            <Link href="/courses" className="showcase-entry-card impact-entry-card">
              <span>课程体系</span>
              <strong>查看八期课程档案</strong>
              <p>按主题、目标、教学设计和成果支撑查看八期课程档案。</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
