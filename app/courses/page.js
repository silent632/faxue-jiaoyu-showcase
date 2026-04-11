import Link from "next/link";

import ShowcaseSection from "@/components/showcase-section";
import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";
import { getCoursePackagePeriods } from "@/lib/course-package";

export default function CoursesPage() {
  const content = buildShowcaseContent();
  const periods = getCoursePackagePeriods();
  const pageHighlights = [
    "八期课程均按期次建立独立档案页，可按主题查看课程内容、配套资料与实施佐证。",
    "前四期侧重课堂实施与课程进入，后四期进一步补充视频化结构、脚本与成果沉淀。",
    "每期页面均保留课程主题、学习目标、资料概览、佐证材料与视频入口的统一骨架。",
  ];

  return (
    <main className="showcase-page" data-page-role="courses-support">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程体系</p>
          <h1>八期课程档案</h1>
          <p>本页按期次梳理八期课程的主题、阶段定位、资料构成与视频入口，帮助评审快速查看各期课程内容和材料组织情况。</p>
        </section>

        <article className="showcase-card supporting-callout">
          <span className="showcase-card-eyebrow">课程导览</span>
          <strong>八期课程均已整理为独立课程单元，可继续进入每期页面查看课程主题、资料概览与实施佐证。</strong>
          <ul className="supporting-list">
            {pageHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <ShowcaseSection
          title="八期课程档案单元"
          eyebrow="课程档案"
          description="每一期均提供课程主题、资料概览、佐证材料与视频入口，可从课程内容而非原始文件名理解本期建设重点。"
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
                    {item.materialGroups.flatMap((group) => group.items).slice(0, 4).map((material) => (
                      <li key={`${item.slug}-${material.displayName}`}>{material.displayName}</li>
                    ))}
                  </ul>
                </div>

                <div className="course-archive-stats">
                  <span>{`课程资料 ${item.stats.materialCount} 项`}</span>
                  <span>{`佐证材料 ${item.stats.evidenceCount} 项`}</span>
                  {item.stats.outlineCount ? <span>{`课程结构 ${item.stats.outlineCount} 页`}</span> : null}
                </div>

                <div className="course-archive-actions">
                  <Link href={item.detailHref} className="showcase-home-panel-link">
                    查看本期课程档案
                  </Link>
                  <Link href={item.videoHref} className="btn btn-ghost">
                    对应视频入口
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
