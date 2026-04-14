import Link from "next/link";
import { notFound } from "next/navigation";

import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";
import { getShowcaseVideoBySlug, getShowcaseVideoStaticParams } from "@/lib/showcase-home-videos";

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
  const actionLabel = isSegmentPage ? "查看本期内容" : "打开原始视频";
  const courseHref = `/courses/${video.slug}`;

  return (
    <main className="showcase-page" data-page-role="video-player">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程视频成果</p>
          <h1>{video.title}</h1>
          <p>{video.summary}</p>
        </section>

        <article className="showcase-card showcase-video-player-shell">
          <div className="showcase-video-player-frame">
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

          <div className="showcase-video-player-meta">
            <section className="showcase-video-player-copy">
              <span className="showcase-card-eyebrow">{video.stageTag}</span>
              <strong>{video.theme}</strong>
              <p>{isSegmentPage ? "当前内容按分段入口提供。" : "本期视频可直接在站内观看。"}</p>
              <small>{video.phaseLabel}</small>
            </section>

            <section className="showcase-video-player-actions">
              <span className="showcase-card-eyebrow">相关入口</span>
              <p>
                {isSegmentPage ? "下方提供本期内容入口。" : "如需单独打开视频，可继续使用原始视频链接。"}
              </p>
              <div className="showcase-video-player-action-row">
                <Link href="/resources" className="btn btn-ghost">
                  返回视频中心
                </Link>
                <Link href={courseHref} className="btn btn-ghost">
                  查看本期课程档案
                </Link>
                {!isSegmentPage ? (
                  <a href={video.sourceHref} target="_blank" rel="noreferrer" className="showcase-home-panel-link">
                    {actionLabel}
                  </a>
                ) : null}
              </div>
            </section>
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
      </div>
    </main>
  );
}
