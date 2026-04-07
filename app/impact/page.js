import Link from "next/link";
import TopNav from "@/components/top-nav";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function ImpactPage() {
  const content = buildShowcaseContent();
  const user = getPublicShowcaseUser();
  const trendPanels = content.impactDashboard?.trendPanels ?? [];
  const coverageCards = content.impactDashboard?.coverageCards ?? [];
  const supportVideos = content.videoHub?.playlist ?? [];
  const featuredVideo = content.videoHub?.featured;
  const summaryCards = [
    { label: "案例总量", value: content.metrics.caseCount.value, note: "可直接抽查详情页与原文" },
    { label: "课程周期", value: content.metrics.coursePeriods.value, note: "形成连续双师课程样本" },
    { label: "注册用户", value: content.metrics.registeredUsers.value, note: "具备稳定应用基础" },
  ];
  const summaryLedger = [
    {
      label: "核验次序",
      point: "先看运行趋势，再核应用覆盖，最后进入案例链路与视频佐证。",
    },
    {
      label: "抽查入口",
      point: "案例详情页、研习工作台与 PDF 原文保持可达。",
    },
    {
      label: "附录材料",
      point: "课程视频与课程体系作为补充材料，便于继续核验。",
    },
  ];
  const evidenceCards = [
    {
      label: "使用链路",
      point: "案例检索、详情导读、研习工作台与 PDF 原文形成闭环。",
    },
    {
      label: "课程支撑",
      point: "课程体系、视频回看与检索工作台围绕同一平台组织。",
    },
    {
      label: "审阅方式",
      point: "专家可按趋势、覆盖、案例抽查和视频支撑四条线快速核验项目真实性。",
    },
  ];

  return (
    <main className="showcase-page">
      <TopNav user={user} items={content.nav} />

      <div className="showcase-page-body">
        <section className="impact-summary-deck showcase-card" aria-label="成效总览">
          <div className="impact-summary-main">
            <p className="showcase-page-kicker">结果核验总览</p>
            <h1>平台应用结果总览</h1>
            <p>本页聚焦专家真正会看的三类信息：平台是否已形成稳定结果、应用覆盖是否可证明、证据链路是否方便继续抽查。</p>
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
            <h2>平台运行趋势作为成效总览首要轴线</h2>
            <p>持续跟踪访问活跃、回访留存与课程迭代，确保应用结果可见、可对照。</p>
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
            <h2>教学建设与推广应用覆盖已能形成稳定证明</h2>
            <p>覆盖区块直接回答这项建设覆盖到哪里、是否已经进入真实教学环节。</p>
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

        <section className="impact-proof-ledger showcase-card" aria-label="审阅证据">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">审阅证据</span>
            <h2>使用链路、课程支撑与核验方式在此集中列出</h2>
            <p>趋势与覆盖确认后，可顺着这里继续进入案例链路与课程支撑材料。</p>
          </div>

          <div className="impact-dashboard-grid">
            {evidenceCards.map((item) => (
              <article key={`${item.label}-${item.point}`} className="showcase-card impact-proof-card">
                <span className="showcase-card-eyebrow">{item.label}</span>
                <strong>{item.point}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="impact-support-appendix showcase-card" aria-label="视频推广支持">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">附录佐证</span>
            <h2>课程视频与课程体系作为补充佐证材料</h2>
            <p>需要补充说明时，可继续查看课程视频与相关教学支撑。</p>
          </div>

          <div className="impact-video-layout">
            {featuredVideo ? (
              <a className="impact-video-featured" href={featuredVideo.href} target="_blank" rel="noreferrer">
                <span className="showcase-card-eyebrow">主视频</span>
                <strong>{featuredVideo.title}</strong>
              </a>
            ) : null}

            <div className="impact-video-list">
              {supportVideos.map((item) => (
                <a key={item.slug} href={item.href} target="_blank" rel="noreferrer" className="impact-video-item">
                  <span>{item.title}</span>
                </a>
              ))}
            </div>
          </div>

          <Link href="/resources" className="showcase-home-panel-link">
            进入课程视频中心
          </Link>
        </section>
      </div>
    </main>
  );
}
