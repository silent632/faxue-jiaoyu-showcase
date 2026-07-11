import Link from "next/link";
import { notFound } from "next/navigation";

import CourseMaterialDirectory from "@/components/course-material-directory";
import { CoursePeriodShell } from "@/components/course-period-shell";
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
