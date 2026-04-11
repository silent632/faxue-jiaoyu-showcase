import Link from "next/link";
import { notFound } from "next/navigation";

import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { getCoursePackagePeriodBySlug, getCoursePackageStaticParams } from "@/lib/course-package";
import { buildShowcaseContent } from "@/lib/showcase-content";

export function generateStaticParams() {
  return getCoursePackageStaticParams();
}

function renderList(items, emptyText) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="showcase-section-description">{emptyText}</p>;
  }

  return (
    <ul className="course-detail-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const period = getCoursePackagePeriodBySlug(slug);
  const content = buildShowcaseContent();

  if (!period) {
    notFound();
  }

  const overviewMeta = [
    { label: "阶段定位", value: period.module },
    { label: "课程主题", value: period.guide.courseTheme || period.theme },
    { label: "建议讲授标题", value: period.guide.teachingTitle || period.title.replace(/^第[一二三四五六七八]期\s*/u, "") },
    { label: "授课对象", value: period.guide.audience || "法学本科二、三年级学生" },
  ].filter((item) => item.value);

  const mentorMeta = [
    { label: "理论导师", value: period.guide.theoryMentor },
    { label: "实务导师", value: period.guide.practiceMentor },
  ].filter((item) => item.value);

  return (
    <main className="showcase-page" data-page-role="course-detail">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <div className="course-detail-back-row">
          <Link href="/courses" className="btn btn-ghost">
            返回课程体系
          </Link>
        </div>

        <section className="showcase-card course-detail-hero">
          <div className="course-detail-hero-copy">
            <p className="showcase-page-kicker">课程资料</p>
            <h1>{period.title}</h1>
            <p className="course-detail-lead">
              {period.guide.coursePosition || period.summary}
            </p>
          </div>

          <div className="course-detail-hero-side">
            <div className="course-detail-chip-row">
              <span className="tag tag-accent">{period.stageTag}</span>
              <span className="tag">{period.phaseLabel}</span>
            </div>

            <div className="course-detail-stat-grid">
              <article className="course-detail-stat-card">
                <span>课程资料</span>
                <strong>{period.stats.materialCount}</strong>
              </article>
              <article className="course-detail-stat-card">
                <span>佐证材料</span>
                <strong>{period.stats.evidenceCount}</strong>
              </article>
              <article className="course-detail-stat-card">
                <span>视频入口</span>
                <strong>{period.stats.outlineCount ? `${period.stats.outlineCount} 页结构` : "已配置"}</strong>
              </article>
            </div>

            <div className="course-detail-action-row">
              <Link href={period.videoHref} className="showcase-home-panel-link">
                视频入口
              </Link>
            </div>
          </div>
        </section>

        <ShowcaseSection
          title="课程概况"
          eyebrow={period.period}
          description="围绕课程主题、授课对象和双师配置，快速说明本期课程的组织方式。"
          className="showcase-section-compact"
        >
          <div className="course-detail-meta-grid">
            {overviewMeta.map((item) => (
              <article key={item.label} className="course-detail-meta-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
            {mentorMeta.map((item) => (
              <article key={item.label} className="course-detail-meta-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </ShowcaseSection>

        <div className="course-detail-two-up">
          <ShowcaseSection
            title="课前学习要求"
            eyebrow="学习准备"
            description="进入课堂前需要完成的阅读、复习与问题准备。"
            className="showcase-section-compact"
          >
            {renderList(period.guide.preStudy, "本期未单列课前学习要求。")}
          </ShowcaseSection>

          <ShowcaseSection
            title="本期学习目标"
            eyebrow="学习目标"
            description="本期课程希望学生形成的核心理解与分析能力。"
            className="showcase-section-compact"
          >
            {renderList(period.guide.goals, "本期未单列学习目标。")}
          </ShowcaseSection>
        </div>

        <div className="course-detail-two-up">
          <ShowcaseSection
            title="推荐案例与问题方向"
            eyebrow="案例方向"
            description="围绕本期主题组织的典型裁判文书阅读与案例讨论方向。"
            className="showcase-section-compact"
          >
            {renderList(period.guide.caseDirections, "本期以课程主题为主线组织案例讨论。")}
          </ShowcaseSection>

          <ShowcaseSection
            title="教学设计亮点"
            eyebrow="教学设计"
            description="本期课程在课堂组织和法理表达上的重点处理。"
            className="showcase-section-compact"
          >
            {renderList(period.guide.highlights, "本期重点围绕课程主题、案例讨论与结构化表达展开。")}
          </ShowcaseSection>
        </div>

        <ShowcaseSection
          title="课程结构"
          eyebrow="内容结构"
          description="结合课程资料与视频结构整理出的本期课程内容主线。"
          className="showcase-section-compact"
        >
          <div className="course-detail-outline-grid">
            {period.outline.map((item, index) => (
              <article key={`${period.slug}-${item}`} className="course-detail-outline-card">
                <span>{`${String(index + 1).padStart(2, "0")}`}</span>
                <strong>{item}</strong>
              </article>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="资料概览"
          eyebrow="课程资料"
          description="课程资料、佐证材料与视频制作材料均已按规范名称整理，不再直接展示原始文件名。"
          className="showcase-section-compact"
        >
          <div className="course-detail-material-group-grid">
            {period.materialGroups.map((group) => (
              <article key={`${period.slug}-${group.title}`} className="showcase-card course-detail-material-group">
                <span className="showcase-card-eyebrow">{group.title}</span>
                <strong>{`${group.items.length} 项`}</strong>
                <ul className="course-detail-material-list">
                  {group.items.map((item) => (
                    <li key={`${group.title}-${item.displayName}`}>
                      <span>{item.displayName}</span>
                      <small>{item.kind}</small>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </ShowcaseSection>
      </div>
    </main>
  );
}
