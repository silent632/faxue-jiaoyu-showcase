import Link from "next/link";
import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function ImpactPage() {
  const content = buildShowcaseContent();
  const trendPanels = content.impactDashboard?.trendPanels ?? [];
  const coverageCards = content.impactDashboard?.coverageCards ?? [];
  const supportVideos = content.videoHub?.playlist ?? [];
  const featuredVideo = content.videoHub?.featured;
  const activityCards = [
    ...trendPanels.map((panel) => ({
      label: panel.title,
      point: panel.detail || panel.value,
    })),
    ...supportVideos.map((item) => ({
      label: "视频推广支持",
      point: item.title,
    })),
  ].slice(0, 4);

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head impact-dashboard-head">
          <p className="showcase-page-kicker">成效展示</p>
          <h1>平台应用结果总览</h1>
          <p>围绕平台运行趋势、应用覆盖与视频推广支持，集中展示项目应用成果与持续运行状态。</p>
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

        <section className="impact-activity-section showcase-card" aria-label="应用活动">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">应用活动</span>
            <h2>平台应用活动与课程推进保持联动</h2>
          </div>

          <div className="impact-dashboard-grid">
            {activityCards.map((item) => (
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
            <h2>课程视频为推广展示与教学支持提供直接入口</h2>
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
