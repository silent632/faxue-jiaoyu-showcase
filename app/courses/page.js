import Link from "next/link";

import ShowcaseSection from "@/components/showcase-section";
import ShowcaseNav from "@/components/showcase-nav";
import { getCoursePackagePeriods } from "@/lib/course-package";

const GUIDE_BANDS = [
  {
    title: "第一期至第四期",
    description: "从类案检索、法理原理到程序判断，重心落在课堂问题推进与案例阅读。",
  },
  {
    title: "第五期至第八期",
    description: "从示范课程延伸到专题议题，继续保留课程主线、材料摘要与教学组织。",
  },
];

export default function CoursesPage() {
  const periods = getCoursePackagePeriods();

  return (
    <main className="showcase-page" data-page-role="courses-support">
      <ShowcaseNav />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程体系</p>
          <h1>八期课程导览</h1>
          <p>八期课程按主题推进，每一期都提供课程阅读页和视频入口。</p>
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
          title="课程档案"
          eyebrow="八期课程"
          description="每一期都给出切入点、关键词和课程入口。"
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
                  <span>{item.stageTag}</span>
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
