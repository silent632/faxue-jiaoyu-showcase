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
          <p>八期课程视频按期次展开，直接进入对应内容。</p>
        </section>
        <ShowcaseVideoHub hub={content.videoHub} />
      </div>
    </main>
  );
}
