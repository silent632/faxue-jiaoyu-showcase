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
          <h1>八期课程视频成果</h1>
          <p>本页按第一期至第八期顺序展示课程视频成果，可结合课程主题和期次脉络查看各期视频内容。</p>
        </section>

        <article className="showcase-card supporting-callout">
          <span className="showcase-card-eyebrow">视频导览</span>
          <strong>八期课程视频按期次连续展示，前四期侧重课堂实施过程，后四期进一步形成视频化课程成果与资源沉淀。</strong>
          <ul className="supporting-list">
            <li>前四期集中呈现案例进入、课堂互动与机制验证的实施线索。</li>
            <li>后四期集中呈现程序正义、数字治理与智能治理议题下的视频成果沉淀。</li>
            <li>第一期、第二期的分段内容保留在各期页面内展开，八期主列表保持统一顺序。</li>
          </ul>
        </article>

        <ShowcaseVideoHub hub={content.videoHub} />
      </div>
    </main>
  );
}
