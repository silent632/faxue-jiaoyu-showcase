import Link from "next/link";
import { notFound } from "next/navigation";

import ShowcaseNav from "@/components/showcase-nav";
import CourseVideoPlayer from "@/components/course-video-player";
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
        <header className="editorial-heading video-heading">
          <div>
            <Link href={courseHref}>← 返回本期课程</Link>
            <h1>{video.title}</h1>
            <p>{video.summary}</p>
          </div>
          <Link className="btn btn-outline" href="/courses/">全部课程</Link>
        </header>

        <article className="video-player-stage">
          <div className="showcase-video-player-frame video-player-frame-main">
            {isSegmentPage ? (
              <div className="showcase-video-placeholder">
                <span className="showcase-card-eyebrow">{video.stageTag}</span>
                <strong>{video.period}</strong>
                <p>当前内容按分段提供，可从下方继续进入。</p>
              </div>
            ) : (
              <CourseVideoPlayer source={video.sourceHref} period={video.period} />
            )}
          </div>

          <div className="video-player-below">
            <div className="video-player-summary">
              <Link href={courseHref}>查看本期课程材料 →</Link>
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
          ) : null}
          {nextVideo ? (
            <Link className="video-period-nav-card video-period-nav-next" href={`/resources/videos/${nextVideo.slug}`}>
              <span className="video-period-nav-dir">下一期 →</span>
              <strong>{nextVideo.title}</strong>
            </Link>
          ) : null}
        </nav>
      </div>
    </main>
  );
}
