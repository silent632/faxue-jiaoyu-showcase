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
  const flowEntries = profile.contentFlow.slice(0, 4);
  const firstMaterial = period.materialPages[0];

  return (
    <CoursePeriodShell period={period} title={period.title} summary={period.periodHome.summary}>
      <ShowcaseSection
        title="本期定位"
        eyebrow={period.period}
        description={profile.periodSummary.lead}
        className="showcase-section-compact course-period-home-section"
      >
        <div className="course-period-home-grid">
          <div className="course-period-home-panel">
            <strong>课程位置</strong>
            <p>{profile.periodSummary.position}</p>
            <ul className="course-detail-list">
              {profile.periodSummary.keySignals.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="course-period-home-panel">
            <strong>承接关系</strong>
            <p>{profile.periodSummary.bridge}</p>
            <ul className="course-detail-list">
              {featuredQuestions.map((item) => (
                <li key={item.question}>{item.question}</li>
              ))}
            </ul>
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="课程推进"
        eyebrow="课堂结构"
        description="课程围绕核心问题、典型争议、裁判方法与课堂收束逐步展开。"
        className="showcase-section-compact course-period-home-section"
      >
        <div className="course-period-card-grid">
          {flowEntries.map((item, index) => (
            <article key={item.title} className="course-period-card">
              <div className="course-period-card-copy">
                <span className="showcase-card-eyebrow">
                  {String(index + 1).padStart(2, "0")} · {item.title}
                </span>
                <strong>{item.goal}</strong>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="统一材料目录"
        eyebrow="十四份材料档案"
        description="四类材料沿教学设计、课堂实施、协同反思与结课输出展开，所有链接直接落到材料正文。"
        className="showcase-section-compact course-period-home-section"
      >
        <CourseMaterialDirectory groups={period.materialDirectory} />

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
