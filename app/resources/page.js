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
          <p>集中呈现双师课堂相关课程视频，覆盖案例进入、课堂组织与研习展开等内容。</p>
        </section>

        <article className="showcase-card supporting-callout">
          <span className="showcase-card-eyebrow">视频导览</span>
          <strong>课程视频与示范性教学视频汇集双师课堂的主要片段与典型环节。</strong>
          <ul className="supporting-list">
            <li>主视频呈现每期课堂主线与主要议题。</li>
            <li>播放列表补充教学阶段中的课堂片段与案例讨论。</li>
            <li>视频中心与课程体系、成效展示保持联动，可配合站内内容一并查看。</li>
          </ul>
        </article>

        <ShowcaseVideoHub hub={content.videoHub} />
      </div>
    </main>
  );
}
