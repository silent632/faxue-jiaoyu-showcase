import Link from "next/link";

import ShowcaseSection from "@/components/showcase-section";
import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function CoursesPage() {
  const content = buildShowcaseContent();
  const periods = content.courses.periods;
  const pageHighlights = [
    "每一期按课程档案方式集中承接主题、阶段定位、配套资料与对应视频入口。",
    "前四期突出课堂实施线索，后四期突出视频成果与资料沉淀的归档关系。",
    "课程体系页负责课程档案承接，不承担播放器主功能。",
  ];

  return (
    <main className="showcase-page" data-page-role="courses-support">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程体系</p>
          <h1>八期课程档案</h1>
          <p>课程体系页集中承接八期课程档案。每一期均保留课程主题、阶段定位、简要说明、配套资料与对应视频入口，形成完整的课程单元归档。</p>
        </section>

        <article className="showcase-card supporting-callout">
          <span className="showcase-card-eyebrow">课程导览</span>
          <strong>这里是八期课程的档案承接页，重心放在课程主题、资料归档与视频入口之间的对应关系。</strong>
          <ul className="supporting-list">
            {pageHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <ShowcaseSection
          title="八期课程档案单元"
          eyebrow="课程档案"
          description="课程主题、阶段定位、配套资料与对应视频入口在每一期内部统一呈现，确保八期主线清晰、职责分工稳定。"
          className="showcase-section-compact"
          aria-label="课程档案"
        >
          <div className="course-archive-grid">
            {periods.map((item) => (
              <article key={item.slug} className="showcase-card course-archive-card">
                <div className="course-archive-head">
                  <span className="showcase-card-eyebrow">{item.period}</span>
                  <strong>{item.title}</strong>
                  <small>{item.stageTag}</small>
                </div>

                <div className="course-archive-meta">
                  <p>
                    <span>阶段定位</span>
                    {item.module}
                  </p>
                  <p>
                    <span>课程主题</span>
                    {item.theme}
                  </p>
                </div>

                <p className="course-archive-description">{item.description}</p>

                <div className="course-archive-materials">
                  <span>配套资料</span>
                  <ul>
                    {item.materials.map((material) => (
                      <li key={`${item.slug}-${material}`}>{material}</li>
                    ))}
                  </ul>
                </div>

                <Link href={item.videoHref} className="showcase-home-panel-link">
                  {item.videoEntryLabel}
                </Link>
              </article>
            ))}
          </div>
        </ShowcaseSection>
      </div>
    </main>
  );
}
