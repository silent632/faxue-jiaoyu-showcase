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
          <p>本页按第一期至第八期顺序集中展示课程视频成果，并通过阶段说明交代前四期与后四期在成果形态上的递进关系。</p>
        </section>

        <article className="showcase-card supporting-callout">
          <span className="showcase-card-eyebrow">视频导览</span>
          <strong>八期课程视频保持统一主线连续展示，前四期侧重课堂实施成果，后四期侧重示范性课程视频与资源化成果。</strong>
          <ul className="supporting-list">
            <li>前四期集中呈现案例进入、课堂互动与机制验证的实施线索。</li>
            <li>后四期集中呈现程序正义、数字治理与智能治理议题下的视频成果沉淀。</li>
            <li>第一期、第二期的分段内容已下沉到各自说明页，八期主列表保持连续顺序。</li>
          </ul>
        </article>

        <ShowcaseVideoHub hub={content.videoHub} />
      </div>
    </main>
  );
}
