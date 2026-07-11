import Link from "next/link";
import { notFound } from "next/navigation";

import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";
import { getShowcaseVideoBySlug, getShowcaseVideoPeriods, getShowcaseVideoStaticParams } from "@/lib/showcase-home-videos";

export async function generateStaticParams() {
  return getShowcaseVideoStaticParams();
}

export default async function VideoPlayerPage({ params }) {
  const { slug } = await params;
  const content = buildShowcaseContent();
  const video = getShowcaseVideoBySlug(slug);

  if (!video) {
    notFound();
  }

  const isSegmentPage = video.playerMode === "segments";
  const courseHref = `/courses/${video.slug}`;

  const periods = getShowcaseVideoPeriods();
  const currentIndex = periods.findIndex((item) => item.slug === video.slug);
  const prevVideo = currentIndex > 0 ? periods[currentIndex - 1] : null;
  const nextVideo = currentIndex >= 0 && currentIndex < periods.length - 1 ? periods[currentIndex + 1] : null;

  return (
    <main className="showcase-page" data-page-role="video-player">
      <ShowcaseNav items={content.nav} />

      <div className="video-page-body">
        <div className="exp-ws3-topbar video-topbar">
          <div className="exp-ws3-topbar-left">
            <Link className="exp-ws3-back" href="/courses">← 课程体系</Link>
            <span className="exp-ws3-module-badge">{video.stageTag}</span>
            <div className="exp-ws3-case">
              <strong>{video.title}</strong>
              <span>{video.theme} · {video.phaseLabel}</span>
            </div>
          </div>
          <div className="exp-ws3-topbar-right">
            <Link className="btn btn-outline" href={courseHref}>本期课程档案</Link>
          </div>
        </div>

        <article className="video-player-stage">
          <div className="showcase-video-player-frame video-player-frame-main">
            {isSegmentPage ? (
              <div className="showcase-video-placeholder">
                <span className="showcase-card-eyebrow">{video.stageTag}</span>
                <strong>{video.period}</strong>
                <p>当前内容按分段提供，可从下方继续进入。</p>
              </div>
            ) : (
              <video className="showcase-video-player-element" controls preload="metadata" playsInline>
                <source src={video.sourceHref} type="video/mp4" />
                如播放器未正常显示，可改用下方备用入口打开视频。
              </video>
            )}
          </div>

          <div className="video-player-below">
            <div className="video-player-summary">
              <h1 className="video-player-title">{video.title}</h1>
              <p className="video-player-desc">{video.summary}</p>
              {video.purpose ? <p className="video-player-purpose">{video.purpose}</p> : null}
            </div>
            {!isSegmentPage ? (
              <a href={video.sourceHref} target="_blank" rel="noreferrer" className="btn btn-outline video-player-source">
                打开原始视频
              </a>
            ) : null}
          </div>
        </article>

        {isSegmentPage ? (
          <section className="showcase-card showcase-video-segment-shell" aria-label="本期内容">
            <div className="homepage-band-head">
              <span className="showcase-section-eyebrow">本期内容</span>
              <h2>本期视频内容</h2>
              <p>点击卡片查看本期各段内容。</p>
            </div>

            <div className="showcase-video-segment-grid">
              {video.segments.map((segment) => (
                <a
                  key={`${video.slug}-${segment.label}`}
                  href={segment.href}
                  target="_blank"
                  rel="noreferrer"
                  className="showcase-video-segment-card"
                >
                  <span className="showcase-card-eyebrow">{segment.label}</span>
                  <strong>{segment.title}</strong>
                  <p>{segment.note}</p>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <nav className="video-period-nav" aria-label="相邻课程视频">
          {prevVideo ? (
            <Link className="video-period-nav-card" href={`/resources/videos/${prevVideo.slug}`}>
              <span className="video-period-nav-dir">← 上一期</span>
              <strong>{prevVideo.title}</strong>
            </Link>
          ) : <span />}
          {nextVideo ? (
            <Link className="video-period-nav-card video-period-nav-next" href={`/resources/videos/${nextVideo.slug}`}>
              <span className="video-period-nav-dir">下一期 →</span>
              <strong>{nextVideo.title}</strong>
            </Link>
          ) : <span />}
        </nav>
      </div>
    </main>
  );
}
