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
  const { periodHome } = period;
  const summary = periodHome.summary;
  const entryPanels = period.periodHome.entryPanels?.slice(0, 3) ?? [];
  const materialNotes = period.periodHome.materialNotes ?? [];
  const highlights = periodHome.highlights ?? [];
  const firstMaterial = period.materialPages[0];
  const materialCount = period.materialPages.length;

  return (
    <CoursePeriodShell period={period} title={period.title} summary={summary}>
      <section className="showcase-card course-period-entry-grid">
        <div className="course-period-entry-main">
          <span className="showcase-card-eyebrow">{period.period}</span>

          <div className="course-period-entry-panel">
            <strong>课程定位与承接</strong>
            <p>{profile.periodSummary.position}</p>
            <p>{profile.periodSummary.bridge}</p>
          </div>

          {highlights.length > 0 ? (
            <div className="course-period-entry-panel">
              <strong>本期进入线索</strong>
              <ul className="course-detail-list">
                {highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="course-period-entry-panel">
            <strong>材料阅读提示</strong>
            <ul className="course-period-material-notes">
              {materialNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="course-period-entry-side">
          {entryPanels.map((panel) => (
            <div className="course-period-entry-panel" key={panel.title}>
              <strong>{panel.title}</strong>
              {panel.summary ? <p>{panel.summary}</p> : null}
              <ul className="course-detail-list">
                {panel.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <ShowcaseSection
        title="本期材料入口"
        eyebrow={`${materialCount}份材料`}
        description="统一材料目录按课堂功能分组，先看教学材料指南与法理导学，再进入任务单、课堂观察与学生成果。"
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
