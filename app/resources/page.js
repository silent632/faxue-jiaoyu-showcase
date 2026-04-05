import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseVideoHub from "@/components/showcase-video-hub";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function ResourcesPage() {
  const content = buildShowcaseContent();

  return (
    <main className="showcase-page" data-page-role="video-hub">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程视频</p>
          <h1>示范性教学视频</h1>
          <p>围绕双师课堂组织、案例进入与研习引导，集中呈现可回看的课程视频，用于课程观摩、教学复盘与平台成果展示。</p>
        </section>

        <article className="showcase-card supporting-callout">
          <span className="showcase-card-eyebrow">视频导览</span>
          <strong>课程视频与示范性教学视频服务于课程观摩，也用于平台应用成果的公开展示。</strong>
          <ul className="supporting-list">
            <li>主视频用于呈现课堂主线，便于快速了解双师课程组织方式。</li>
            <li>播放列表按教学阶段补充课堂片段，支持课程复盘与示范观摩。</li>
            <li>视频中心与课程体系、成效展示保持联动，方便教学应用结果对照查看。</li>
          </ul>
        </article>

        <ShowcaseVideoHub hub={content.videoHub} />
      </div>
    </main>
  );
}
