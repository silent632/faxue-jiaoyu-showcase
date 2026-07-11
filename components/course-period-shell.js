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

  if (isMaterialPage) {
    const activePage = period.materialPages.find((item) => item.slug === activeMaterialSlug);

    return (
      <main className="showcase-page" data-page-role="course-detail">
        <ShowcaseNav />

        <div className="showcase-page-body course-material-page-body">
          <div className="exp-ws3-topbar course-material-topbar">
            <div className="exp-ws3-topbar-left">
              <Link className="exp-ws3-back" href={`/courses/${period.slug}`}>← {period.period}</Link>
              <span className="exp-ws3-module-badge">{activePage?.group || "课程材料"}</span>
              <div className="exp-ws3-case">
                <strong>{activePage?.label || title}</strong>
                <span>{period.title} · {period.module}</span>
              </div>
            </div>
            <div className="exp-ws3-topbar-right">
              <Link className="btn btn-outline" href={period.videoHref}>本期视频</Link>
            </div>
          </div>

          <div className="course-material-shell">
            <aside className="course-material-shell-aside">
              <CourseMaterialDirectory groups={period.materialDirectory} activeSlug={activeMaterialSlug} variant="aside" />
            </aside>
            <div className="course-material-shell-main">{children}</div>
          </div>
        </div>
      </main>
    );
  }

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
        <section className="showcase-card course-detail-hero">
          <div className="course-detail-hero-head">
            <div className="course-detail-hero-copy">
              <div className="course-detail-hero-kicker-row">
                <Link href="/courses" className="exp-ws3-back">← 课程体系</Link>
                <span className="tag tag-accent">{period.period}</span>
                <span className="tag">{period.stageTag}</span>
                <span className="tag">{period.phaseLabel}</span>
              </div>
              <h1>{title || period.title}</h1>
              <p className="course-detail-lead">{summary}</p>
            </div>
            <Link href={period.videoHref} className="btn btn-primary course-detail-video-btn">
              观看本期视频
            </Link>
          </div>

          <div className="course-detail-meta-strip">
            {heroMeta.map((item) => (
              <article key={item.label} className="course-detail-meta-cell">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
