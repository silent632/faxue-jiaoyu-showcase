import Link from "next/link";
import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function ImpactPage() {
  const content = buildShowcaseContent();
  const trendPanels = content.impactDashboard?.trendPanels ?? [];
  const coverageCards = content.impactDashboard?.coverageCards ?? [];
  const supportVideos = content.videoHub?.playlist ?? [];
  const featuredVideo = content.videoHub?.featured;
  const reviewBand = [
    { label: "案例总量", value: content.metrics.caseCount.value, note: "可直接抽查详情页与原文" },
    { label: "课程周期", value: content.metrics.coursePeriods.value, note: "形成连续双师课程样本" },
    { label: "注册用户", value: content.metrics.registeredUsers.value, note: "具备稳定应用基础" },
  ];
  const evidenceCards = [
    {
      label: "使用链路",
      point: "案例检索、详情导读、研习工作台与 PDF 原文形成闭环。",
    },
    {
      label: "课程支撑",
      point: "课程体系、视频回看与检索工作台不再分散展示，而是围绕同一平台组织。",
    },
    {
      label: "审阅方式",
      point: "专家可按趋势、覆盖、案例抽查和视频支撑四条线快速核验项目真实性。",
    },
  ];

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head impact-dashboard-head">
          <p className="showcase-page-kicker">成效展示</p>
          <h1>平台应用结果总览</h1>
          <p>本页不再平铺传统成果条目，而是把专家真正会看的结果、覆盖和支撑证据压缩成一套可核验的总览结构。</p>
        </section>

        <section className="impact-review-band showcase-card" aria-label="成效总览摘要">
          {reviewBand.map((item) => (
            <article key={item.label} className="impact-review-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.note}</p>
            </article>
          ))}
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
            <h2>教学建设与推广应用覆盖持续提升</h2>
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

        <section className="impact-evidence-section showcase-card" aria-label="审阅证据">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">审阅证据</span>
            <h2>除趋势与覆盖外，还要保留可抽样、可复核的链路证据</h2>
          </div>

          <div className="impact-dashboard-grid">
            {evidenceCards.map((item) => (
              <article key={`${item.label}-${item.point}`} className="showcase-card impact-activity-card">
                <span className="showcase-card-eyebrow">{item.label}</span>
                <strong>{item.point}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="impact-video-support showcase-card" aria-label="视频推广支持">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">视频推广支持</span>
            <h2>课程视频保留在最后，作为专家需要时再查看的支撑性证据</h2>
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
