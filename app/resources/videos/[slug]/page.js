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

  if (!video || video.external) {
    notFound();
  }

  return (
    <main className="showcase-page" data-page-role="video-player">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程视频播放页</p>
          <h1>{video.title}</h1>
          <p>{video.summary}</p>
        </section>

        <article className="showcase-card showcase-video-player-shell">
          <div className="showcase-video-player-frame">
            <video className="showcase-video-player-element" controls preload="metadata" playsInline>
              <source src={video.sourceHref} type="video/mp4" />
              当前浏览器暂不支持站内播放，请使用下方备用入口打开视频。
            </video>
          </div>

          <div className="showcase-video-player-meta">
            <section className="showcase-video-player-copy">
              <span className="showcase-card-eyebrow">{video.label}</span>
              <strong>{video.title}</strong>
              <p>{video.purpose}</p>
            </section>

            <section className="showcase-video-player-actions">
              <span className="showcase-card-eyebrow">播放说明</span>
              <p>该页面已将腾讯云视频接入站内播放器，可直接播放；如网络环境较慢，可改用原始视频入口。</p>
              <div className="showcase-video-player-action-row">
                <Link href="/resources" className="btn btn-ghost">
                  返回视频中心
                </Link>
                <a href={video.sourceHref} target="_blank" rel="noreferrer" className="showcase-home-panel-link">
                  打开原始视频
                </a>
              </div>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
