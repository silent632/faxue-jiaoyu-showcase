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

  const teachingFlow = period.outline.length > 0
    ? period.outline
    : ["案例进入", "问题识别", "课堂研讨", "总结提升"];

  const supportPoints = [
    period.videoHref
      ? (period.videoHref.includes("/resources/videos/")
        ? "已配置本期视频入口，可继续进入课程视频页查看完整内容。"
        : "已配置本期视频入口，可作为课程展示与推广应用支撑。")
      : "本期课程已完成视频成果整理，可作为课堂展示支撑。",
    period.playerMode === "segments"
      ? "已形成分段课堂记录，可按教学推进顺序查看课程实施过程。"
      : "已形成完整课程视频成果，可直接用于课程展示与观摩。",
    period.stats.evidenceCount > 0
      ? "已保留课堂实施、学生反馈或研习成果等过程性支撑材料。"
      : "已形成课堂实施过程记录，可作为教学建设的阶段性支撑。",
  ];

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
            <p className="showcase-page-kicker">课程档案</p>
            <h1>{period.title}</h1>
            <p className="course-detail-lead">{period.guide.coursePosition || period.summary}</p>
          </div>

          <div className="course-detail-hero-side">
            <div className="course-detail-chip-row">
              <span className="tag tag-accent">{period.stageTag}</span>
              <span className="tag">{period.phaseLabel}</span>
            </div>

            <div className="course-detail-summary-grid">
              <article className="course-detail-meta-card">
                <span>阶段定位</span>
                <strong>{period.module}</strong>
              </article>
              <article className="course-detail-meta-card">
                <span>课程主题</span>
                <strong>{period.guide.courseTheme || period.theme}</strong>
              </article>
              <article className="course-detail-meta-card">
                <span>授课对象</span>
                <strong>{period.guide.audience || "法学本科二、三年级学生"}</strong>
              </article>
            </div>

            <div className="course-detail-action-row">
              <Link href={period.videoHref} className="showcase-home-panel-link">
                查看本期视频
              </Link>
              <Link href="/resources" className="btn btn-ghost">
                返回课程视频
              </Link>
            </div>
          </div>
        </section>

        <ShowcaseSection
          title="课程概况"
          eyebrow={period.period}
          description="围绕课程主题、建议讲授标题、授课对象与双师配置，快速说明本期课程的基本组织方式。"
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
            title="本期学习目标"
            eyebrow="学习目标"
            description="本期课程希望学生在案例进入、规范判断和法理表达上形成的核心能力。"
            className="showcase-section-compact"
          >
            {renderList(period.guide.goals, "本期围绕课程主题组织学生形成案例分析与法理表达能力。")}
          </ShowcaseSection>

          <ShowcaseSection
            title="核心问题与案例方向"
            eyebrow="问题导向"
            description="本期围绕哪些问题进入课程、组织案例讨论，并推动学生展开判断。"
            className="showcase-section-compact"
          >
            {renderList(period.guide.caseDirections, "本期以课程主题为主线组织案例讨论与问题推进。")}
          </ShowcaseSection>
        </div>

        <div className="course-detail-two-up">
          <ShowcaseSection
            title="教学推进"
            eyebrow="教学设计"
            description="按课堂推进顺序概括本期课程的主要组织步骤与内容结构。"
            className="showcase-section-compact"
          >
            <div className="course-detail-outline-grid">
              {teachingFlow.map((item, index) => (
                <article key={`${period.slug}-${item}`} className="course-detail-outline-card">
                  <span>{`${String(index + 1).padStart(2, "0")}`}</span>
                  <strong>{item}</strong>
                </article>
              ))}
            </div>
          </ShowcaseSection>

          <ShowcaseSection
            title="教学亮点"
            eyebrow="亮点归纳"
            description="概括本期课程在双师协同、课堂组织和法理表达上的重点处理。"
            className="showcase-section-compact"
          >
            {renderList(period.guide.highlights, "本期重点围绕课程主题、案例讨论与结构化表达展开。")}
          </ShowcaseSection>
        </div>

        <ShowcaseSection
          title="学习准备"
          eyebrow="课前要求"
          description="进入课堂前的阅读、复习与问题准备，帮助学生更快进入本期讨论。"
          className="showcase-section-compact"
        >
          {renderList(period.guide.preStudy, "本期以课程主题导入和课堂问题准备为主要课前要求。")}
        </ShowcaseSection>

        <ShowcaseSection
          title="成果支撑"
          eyebrow="支撑说明"
          description="本页不再展开材料清单，改为直接说明本期已经形成的课程成果与支撑类型。"
          className="showcase-section-compact"
        >
          <div className="course-detail-support-grid">
            {supportPoints.map((item) => (
              <article key={item} className="course-detail-support-card">
                <strong>{item}</strong>
              </article>
            ))}
          </div>
        </ShowcaseSection>
      </div>
    </main>
  );
}
