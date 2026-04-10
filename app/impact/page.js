import Link from "next/link";
import ShowcaseVideoLink from "@/components/showcase-video-link";
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
    { label: "案例总量", value: content.metrics.caseCount.value, note: "详情页与 PDF 原文已连通" },
    { label: "课程周期", value: content.metrics.coursePeriods.value, note: "形成连续双师课程样本" },
    { label: "注册用户", value: content.metrics.registeredUsers.value, note: "具备稳定应用基础" },
  ];
  const summaryLedger = [
    {
      label: "浏览顺序",
      point: "运行趋势、应用覆盖与站内入口集中呈现。",
    },
    {
      label: "案例入口",
      point: "案例详情页、研习工作台与 PDF 原文保持可达。",
    },
    {
      label: "课程支撑",
      point: "课程视频与课程体系补充呈现课堂组织与建设背景。",
    },
  ];
  const evidenceCards = [
    {
      label: "案例链路",
      point: "案例检索、详情导读、研习工作台与 PDF 原文形成闭环。",
    },
    {
      label: "课程支撑",
      point: "课程体系、视频回看与检索工作台围绕同一平台组织。",
    },
    {
      label: "站内联动",
      point: "趋势、覆盖、案例链路与课程视频在站内保持连通。",
    },
  ];

  return (
    <main className="showcase-page">
      <TopNav user={user} items={content.nav} />

      <div className="showcase-page-body">
        <section className="impact-summary-deck showcase-card" aria-label="成效总览">
          <div className="impact-summary-main">
            <p className="showcase-page-kicker">成效总览</p>
            <h1>平台应用结果总览</h1>
            <p>本页汇总平台运行结果、应用覆盖与站内联动入口。</p>
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

        <section className="impact-proof-ledger showcase-card" aria-label="站内联动">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">站内联动</span>
            <h2>案例链路、课程支撑与视频入口在此集中列出</h2>
            <p>运行趋势、应用覆盖与站内入口保持同一结构。</p>
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
            <span className="showcase-section-eyebrow">课程视频</span>
            <h2>课程视频与课程体系补充呈现课堂组织线索</h2>
            <p>可继续查看课程视频与相关教学支撑。</p>
          </div>

          <div className="impact-video-layout">
            {featuredVideo ? (
              <ShowcaseVideoLink className="impact-video-featured" href={featuredVideo.href} external={featuredVideo.external}>
                <span className="showcase-card-eyebrow">主视频</span>
                <strong>{featuredVideo.title}</strong>
              </ShowcaseVideoLink>
            ) : null}

            <div className="impact-video-list">
              {supportVideos.map((item) => (
                <ShowcaseVideoLink
                  key={item.slug}
                  href={item.href}
                  external={item.external}
                  className="impact-video-item"
                >
                  <span>{item.title}</span>
                </ShowcaseVideoLink>
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
