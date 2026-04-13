import Link from "next/link";

import ShowcaseSection from "@/components/showcase-section";
import ShowcaseNav from "@/components/showcase-nav";
import { getCoursePackagePeriods } from "@/lib/course-package";

const GUIDE_BANDS = [
  {
    title: "第一期至第四期",
    description: "从类案检索、法理原理到程序判断，重心放在案例进入、争点识别与课堂表达。",
  },
  {
    title: "第五期至第八期",
    description: "从程序正义延伸到数字治理、平台劳动与生成式 AI，重心转向治理边界和责任判断。",
  },
  {
    title: "统一材料框架",
    description: "八期课程统一保留四类、十份材料档案；单期课程交代主题与承接关系，材料子页展开具体正文。",
  },
];

export default function CoursesPage() {
  const periods = getCoursePackagePeriods();
  const standardDirectory = periods[0]?.materialDirectory ?? [];
  const standardMaterialCount = periods[0]?.materialPages?.length ?? 10;

  return (
    <main className="showcase-page" data-page-role="courses-support">
      <ShowcaseNav />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程体系</p>
          <h1>八期课程档案</h1>
          <p>
            八期课程沿两个阶段推进，统一采用四类、{standardMaterialCount}份材料档案组织课程内容；单期课程交代主题、
            承接关系与进入路径，材料子页展开具体正文。
          </p>
        </section>

        <div className="course-guide-band-grid" aria-label="课程阶段">
          {GUIDE_BANDS.map((item) => (
            <article key={item.title} className="showcase-card course-guide-band-card">
              <span className="showcase-card-eyebrow">课程推进</span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <ShowcaseSection
          title="统一材料框架"
          eyebrow={`四类材料 · ${standardMaterialCount}份档案`}
          description="四类材料贯穿八期课程，但每一期都围绕自身主题重写法理导学、任务单、课堂观察和学习成果。"
          className="showcase-section-compact"
          aria-label="统一材料框架"
        >
          <div className="course-unified-material-grid">
            {standardDirectory.map((group) => (
              <article key={group.title} className="course-unified-material-card">
                <span className="showcase-card-eyebrow">{group.items.length}份材料</span>
                <strong>{group.title}</strong>

                <ul className="course-unified-material-list" aria-label={`${group.title}材料`}>
                  {group.items.map((item) => (
                    <li key={item.slug} className="course-unified-material-item">
                      {item.shortLabel}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="课程档案"
          eyebrow="八期课程"
          description="八期课程按主题递进，进入单期课程后，统一材料档案与本期视频分别展开。"
          className="showcase-section-compact"
          aria-label="课程档案"
        >
          <div className="course-archive-grid">
            {periods.map((item) => (
              <article key={item.slug} className="showcase-card course-archive-card course-guide-card">
                <div className="course-guide-card-head">
                  <span className="showcase-card-eyebrow">{item.period}</span>
                  <strong>{item.title}</strong>
                  <small>{item.archiveCard.contentType}</small>
                </div>

                <p className="course-guide-lead">{item.archiveCard.lead}</p>

                <ul className="course-guide-key-list" aria-label={`${item.period}核心内容`}>
                  {item.archiveCard.keyPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>

                <div className="course-guide-card-meta">
                  <span>{item.stageTag} · {standardMaterialCount}份材料</span>
                  <strong>{item.module}</strong>
                </div>

                <div className="course-archive-actions">
                  <Link href={item.detailHref} className="showcase-home-panel-link">
                    进入本期课程
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
