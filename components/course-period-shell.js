import Link from "next/link";

import ShowcaseNav from "@/components/showcase-nav";
import CourseMaterialDirectory from "@/components/course-material-directory";

export function CoursePeriodShell({
  period,
  title,
  summary,
  activeMaterialSlug = null,
  children,
}) {
  const isMaterialPage = Boolean(activeMaterialSlug);
  const heroMeta = [
    { label: "课程主题", value: period.guide.courseTheme || period.theme },
    { label: "课程模块", value: period.module },
    { label: "理论导师", value: period.guide.theoryMentor },
    { label: "实务导师", value: period.guide.practiceMentor },
  ].filter((item) => item.value);

  return (
    <main className="showcase-page" data-page-role="course-detail">
      <ShowcaseNav />

      <div className="showcase-page-body">
        <div className="course-detail-back-row">
          <Link href="/courses" className="btn btn-ghost">
            返回课程体系
          </Link>
        </div>

        <section className="showcase-card course-detail-hero">
          <div className="course-detail-hero-copy">
            <p className="showcase-page-kicker">{period.period}</p>
            <h1>{title || period.title}</h1>
            <p className="course-detail-lead">{summary}</p>
          </div>

          <div className="course-detail-hero-side">
            <div className="course-detail-chip-row">
              <span className="tag tag-accent">{period.stageTag}</span>
              <span className="tag">{period.phaseLabel}</span>
            </div>

            <div className="course-detail-meta-grid">
              {heroMeta.map((item) => (
                <article key={item.label} className="course-detail-meta-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>

            <div className="course-detail-action-row">
              <Link href={period.videoHref} className="showcase-home-panel-link">
                查看本期视频
              </Link>
            </div>
          </div>
        </section>

        {isMaterialPage ? (
          <div className="course-material-shell">
            <aside className="course-material-shell-aside">
              <CourseMaterialDirectory groups={period.materialDirectory} activeSlug={activeMaterialSlug} variant="aside" />
            </aside>
            <div className="course-material-shell-main">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </main>
  );
}
