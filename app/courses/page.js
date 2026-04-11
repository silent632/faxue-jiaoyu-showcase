import Link from "next/link";

import ShowcaseSection from "@/components/showcase-section";
import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";
import { getCoursePackagePeriods } from "@/lib/course-package";

export default function CoursesPage() {
  const content = buildShowcaseContent();
  const periods = getCoursePackagePeriods();
  const courseBands = content.courses?.bands ?? [];

  return (
    <main className="showcase-page" data-page-role="courses-support">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程体系</p>
          <h1>八期课程展陈</h1>
          <p>前四期聚焦课堂实施，后四期沉淀为示范视频与资源成果。</p>
        </section>

        <div className="course-exhibit-phase-grid">
          {courseBands.map((item) => (
            <article key={item.slug} className="showcase-card course-exhibit-phase-card">
              <span className="showcase-card-eyebrow">课程建设主线</span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <ShowcaseSection
          title="八期课程总览"
          eyebrow="课程展陈"
          description="每一期都保留主题、阶段定位和双入口。"
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
                    查看本期课程
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
