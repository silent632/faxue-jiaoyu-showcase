import CourseTaskCard from "@/components/course-task-card";
import { loadCourseTasks } from "@/lib/content/course-tasks.js";
import Link from "next/link";
import { notFound } from "next/navigation";

import CourseMaterialDirectory from "@/components/course-material-directory";
import { CoursePeriodShell } from "@/components/course-period-shell";
import { getCoursePackagePeriodBySlug, getCoursePackageStaticParams } from "@/lib/course-package";
import { buildShowcaseContent } from "@/lib/showcase-content.js";
import { loadShowcaseCases } from "@/lib/showcase-cases.js";

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
  const allCases = await loadShowcaseCases();
  const caseMap = new Map(allCases.map((item) => [item.id, item]));
  const recommendedCases = (profile.recommendedCases || [])
    .map((item) => ({
      ...item,
      caseItem: caseMap.get(item.caseId),
    }))
    .filter((item) => item.caseItem);
  const recommendationCopy = buildShowcaseContent().learningLoop.courseRecommendation;

  return (
    <CoursePeriodShell period={period} title={period.title} summary={summary}>
      <CourseTaskCard task={loadCourseTasks().find(task => task.slug === slug)} />
      {/* 本期简报：定位 + 线索 + 三个切入面板 + 阅读提示 */}
      <section className="showcase-card course-period-briefing" aria-label="本期简报">
        <div className="course-period-briefing-grid">
          <article className="course-period-panel course-period-panel-wide">
            <h3 className="course-period-panel-title">课程定位与承接</h3>
            <p>{profile.periodSummary.position}</p>
            <p>{profile.periodSummary.bridge}</p>
          </article>

          {highlights.length > 0 ? (
            <article className="course-period-panel">
              <h3 className="course-period-panel-title">本期进入线索</h3>
              <ul className="course-period-panel-list">
                {highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {entryPanels.map((panel) => (
            <article className="course-period-panel" key={panel.title}>
              <h3 className="course-period-panel-title">{panel.title}</h3>
              {panel.summary ? <p className="course-period-panel-summary">{panel.summary}</p> : null}
              <ul className="course-period-panel-list">
                {panel.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}

          {materialNotes.length > 0 ? (
            <article className="course-period-panel">
              <h3 className="course-period-panel-title">材料阅读提示</h3>
              <ul className="course-period-panel-list">
                {materialNotes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>
      </section>

      {recommendedCases.length ? (
        <section className="showcase-card course-recommended-cases" aria-label={recommendationCopy.title}>
          <div className="course-recommended-head">
            <span className="section-eyebrow">{recommendationCopy.eyebrow}</span>
            <h2>{recommendationCopy.title}</h2>
            <p>{recommendationCopy.description}</p>
          </div>
          <div className="course-recommended-grid">
            {recommendedCases.map(({ caseId, reason, caseItem }) => (
              <Link key={caseId} className="course-recommended-card" href={`/cases/${caseId}`}>
                <span>{caseItem.causeFocus}</span>
                <strong>{caseItem.title}</strong>
                <small>{caseItem.caseNumber}</small>
                <p>{reason}</p>
                <em>{recommendationCopy.actionLabel} →</em>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* 本期材料档案 */}
      <section className="showcase-card course-period-materials" aria-label="本期材料入口">
        <div className="course-period-materials-head">
          <div>
            <p className="section-eyebrow">{materialCount}份材料 · 四类分组</p>
            <h2>本期材料档案</h2>
          </div>
          <div className="course-period-home-actions">
            {firstMaterial ? (
              <Link href={firstMaterial.href} className="btn btn-primary">
                从{firstMaterial.shortLabel}开始
              </Link>
            ) : null}
            <Link href={period.videoHref} className="btn btn-outline">
              查看本期视频
            </Link>
          </div>
        </div>

        <CourseMaterialDirectory groups={period.materialDirectory} variant="inline" />
      </section>
    </CoursePeriodShell>
  );
}

export async function generateMetadata({ params }) { const { slug } = await params; const period = getCoursePackagePeriodBySlug(slug); return period ? { title: `${period.title} · 课程研习`, description: period.courseContentProfile.periodSummary.lead, alternates: { canonical: `/courses/${slug}/` } } : {}; }
