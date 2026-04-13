import Link from "next/link";
import { notFound } from "next/navigation";

import CourseMaterialDirectory from "@/components/course-material-directory";
import { CoursePeriodShell } from "@/components/course-period-shell";
import ShowcaseSection from "@/components/showcase-section";
import { getCoursePackagePeriodBySlug, getCoursePackageStaticParams } from "@/lib/course-package";

export function generateStaticParams() {
  return getCoursePackageStaticParams();
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const period = getCoursePackagePeriodBySlug(slug);

  if (!period) {
    notFound();
  }

  const profile = period.courseContentProfile;
  const featuredQuestions = profile.coreQuestions.slice(0, 3);
  const outlineEntries = profile.contentFlow.slice(0, 4);
  const firstMaterial = period.materialPages[0];

  return (
    <CoursePeriodShell period={period} title={period.title} summary={period.periodHome.summary}>
      <section className="showcase-card course-period-bridge">
        <div className="course-period-bridge-copy">
          <span className="showcase-card-eyebrow">{period.period}</span>
          <h2>本期进入方式</h2>
          <p className="course-detail-lead">{profile.periodSummary.lead}</p>
          <p>{profile.periodSummary.position}</p>
          <p>{profile.periodSummary.bridge}</p>
          <ul className="course-detail-list">
            {profile.periodSummary.keySignals.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="course-period-bridge-side">
          <div className="course-period-home-panel">
            <strong>本期核心问题</strong>
            <ul className="course-detail-list">
              {featuredQuestions.map((item) => (
                <li key={item.question}>{item.question}</li>
              ))}
            </ul>
          </div>

          <div className="course-period-home-panel">
            <strong>进入正文前先抓住这四步</strong>
            <ol className="course-period-outline-list">
              {outlineEntries.map((item, index) => (
                <li key={item.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.goal}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <ShowcaseSection
        title="统一材料目录"
        eyebrow="十四份材料"
        description="这一页只做引子，下面的链接直接进入材料正文。"
        className="showcase-section-compact course-period-home-section"
      >
        <CourseMaterialDirectory groups={period.materialDirectory} variant="inline" />

        <div className="course-period-home-actions">
          {firstMaterial ? (
            <Link href={firstMaterial.href} className="showcase-home-panel-link">
              进入{firstMaterial.shortLabel}
            </Link>
          ) : null}
          <Link href={period.videoHref} className="btn btn-ghost">
            查看本期视频
          </Link>
        </div>
      </ShowcaseSection>
    </CoursePeriodShell>
  );
}
