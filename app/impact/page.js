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
    { label: "课程周期", value: content.metrics.coursePeriods.value, note: "八期课程形成连续主题序列" },
    { label: "平台使用者", value: content.metrics.registeredUsers.value, note: "平台运行保持稳定覆盖" },
  ];
  const summaryLedger = [
    {
      label: "成果导向",
      point: "本页集中呈现平台运行、课程建设与推广应用的概括性结果。",
    },
    {
      label: "页面边界",
      point: "成效展示页偏总览表达，不展开过细的活动档案与过程证明。",
    },
    {
      label: "站内联动",
      point: "课程视频与课程档案继续承担观看与资料归档的后续承接。",
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
            <p>本页以概括性方式展示课程建设、平台运行与推广应用结果，不替代课程档案页和课程视频页。</p>
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
            <h2>平台运行趋势作为成效总览的首要轴线</h2>
            <p>访问、活跃与回访留存作为平台运行结果的核心观察面向，在此做概括性呈现。</p>
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
            <h2>教学建设与推广应用在此做概括性承接</h2>
            <p>覆盖区块回答成果已经覆盖到哪些方向，但不在此页展开过细的档案式内容。</p>
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
            <h2>课程建设、学生发展、平台运行与推广示范四条结果线索集中呈现</h2>
            <p>这里保留概括性成果条目，与课程视频页、课程体系页形成分工。</p>
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
            <h2>继续进入课程视频页或课程档案页查看对应内容</h2>
            <p>课程视频页负责观看承接，课程体系页负责课程档案承接，两者与成效展示页保持边界清晰。</p>
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
              <p>每一期课程主题、阶段定位、配套资料与对应视频入口在此集中归档。</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
