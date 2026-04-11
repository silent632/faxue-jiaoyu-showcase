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

  const infoMeta = [
    { label: "阶段定位", value: period.module },
    { label: "课程主题", value: period.guide.courseTheme || period.theme },
    { label: "建议讲授标题", value: period.guide.teachingTitle || period.title.replace(/^第[一二三四五六七八]期\s*/u, "") },
    { label: "授课对象", value: period.guide.audience || "法学本科二、三年级学生" },
    { label: "理论导师", value: period.guide.theoryMentor },
    { label: "实务导师", value: period.guide.practiceMentor },
  ].filter((item) => item.value);

  const teachingFlow = period.outline.length > 0
    ? period.outline
    : ["案例进入", "问题识别", "课堂研讨", "总结提升"];

  const resultCards = [
    {
      label: "展示重点",
      title: period.playerMode === "segments" ? "分段课堂记录" : "站内课程视频",
      description: period.playerMode === "segments"
        ? "本期内容可按分段顺序查看。"
        : "本期课程视频可直接观看。",
    },
    {
      label: "课程亮点",
      title: period.guide.highlights?.[0] || "课程主题与课堂推进保持统一。",
      description: period.summary,
    },
    {
      label: "支撑内容",
      title: period.stats.evidenceCount > 0 ? "课堂记录与学生反馈已保留。" : "课堂推进过程已有记录。",
      description: period.playerMode === "segments"
        ? "课程展示和课堂推进可以对应查看。"
        : "课程视频与课程主题可以对照查看。",
    },
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
            <p className="showcase-page-kicker">课程展陈</p>
            <h1>{period.title}</h1>
            <p className="course-detail-lead">{period.guide.coursePosition || period.summary}</p>
          </div>

          <div className="course-detail-hero-side">
            <div className="course-detail-chip-row">
              <span className="tag tag-accent">{period.stageTag}</span>
              <span className="tag">{period.phaseLabel}</span>
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
          title="本期成果"
          eyebrow={period.period}
          description="先看本期成果与亮点。"
          className="showcase-section-compact"
        >
          <div className="course-detail-support-grid">
            {resultCards.map((item) => (
              <article key={item.label} className="course-detail-support-card">
                <span className="showcase-card-eyebrow">{item.label}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </ShowcaseSection>

        <div className="course-detail-two-up">
          <ShowcaseSection
            title="课程信息"
            eyebrow="基本信息"
            description="课程主题、讲授标题、授课对象与双师配置。"
            className="showcase-section-compact"
          >
            <div className="course-detail-meta-grid">
              {infoMeta.map((item) => (
                <article key={item.label} className="course-detail-meta-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </ShowcaseSection>

          <ShowcaseSection
            title="教学设计"
            eyebrow="课堂推进"
            description="本期课堂推进结构。"
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
        </div>

        <div className="course-detail-two-up">
          <ShowcaseSection
            title="学习目标"
            eyebrow="课堂目标"
            description="本期核心能力目标。"
            className="showcase-section-compact"
          >
            {renderList(period.guide.goals, "本期围绕课程主题组织案例分析与法理表达。")}
          </ShowcaseSection>

          <ShowcaseSection
            title="问题线索"
            eyebrow="讨论重点"
            description="本期主要讨论问题。"
            className="showcase-section-compact"
          >
            {renderList(period.guide.caseDirections, "本期讨论围绕课程主题展开。")}
          </ShowcaseSection>
        </div>

        <ShowcaseSection
          title="课前准备"
          eyebrow="学习准备"
          description="进入课堂前的阅读与准备。"
          className="showcase-section-compact"
        >
          {renderList(period.guide.preStudy, "本期以课程主题导入和课堂问题准备为主。")}
        </ShowcaseSection>
      </div>
    </main>
  );
}
