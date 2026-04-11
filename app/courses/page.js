import Link from "next/link";

import ShowcaseSection from "@/components/showcase-section";
import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";
import { getCoursePackagePeriods } from "@/lib/course-package";

export default function CoursesPage() {
  const content = buildShowcaseContent();
  const periods = getCoursePackagePeriods();
  const pageHighlights = [
    "课程体系页只承担八期课程的整体导览，不再展开材料清单和文件级信息。",
    "每期档案页聚焦课程主题、教学目标、教学设计、亮点成果与视频入口。",
    "前四期侧重课堂实施与机制验证，后四期进一步形成示范视频与资源化成果。",
  ];

  return (
    <main className="showcase-page" data-page-role="courses-support">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程体系</p>
          <h1>八期课程档案</h1>
          <p>本页按期次梳理八期课程的主题主线与阶段定位，用于快速查看课程推进逻辑，并进入单期档案页继续查看具体教学设计与成果支撑。</p>
        </section>

        <article className="showcase-card supporting-callout">
          <span className="showcase-card-eyebrow">课程导览</span>
          <strong>八期课程均已整理为独立课程单元，课程体系页只做导览，单期档案页再展开课程摘要与成果支撑。</strong>
          <ul className="supporting-list">
            {pageHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <ShowcaseSection
          title="八期课程导览"
          eyebrow="课程档案"
          description="每一期均保留课程主题、阶段定位、一句话摘要与双入口，可先总览课程主线，再进入本期查看具体内容。"
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

                <p className="course-archive-description">{item.summary}</p>

                <div className="course-archive-actions">
                  <Link href={item.detailHref} className="showcase-home-panel-link">
                    查看本期课程档案
                  </Link>
                  <Link href={item.videoHref} className="btn btn-ghost">
                    查看本期视频
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </ShowcaseSection>
      </div>
    </main>
  );
}
