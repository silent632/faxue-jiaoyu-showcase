import Link from "next/link";
import { notFound } from "next/navigation";

import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { getCoursePackagePeriodBySlug, getCoursePackageStaticParams } from "@/lib/course-package";

export function generateStaticParams() {
  return getCoursePackageStaticParams();
}

function renderList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
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

  if (!period) {
    notFound();
  }

  const detail = period.detailContent;
  const heroMeta = [
    { label: "课程主题", value: period.guide.courseTheme || period.theme },
    { label: "课程位置", value: period.module },
    { label: "内容类型", value: period.archiveCard.contentType },
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
            <h1>{period.title}</h1>
            <p className="course-detail-lead">{period.archiveCard.lead}</p>
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
              <Link href="/resources" className="btn btn-ghost">
                返回课程视频
              </Link>
            </div>
          </div>
        </section>

        <ShowcaseSection title="本期导读" eyebrow={period.period} className="showcase-section-compact">
          <div className="course-reading-paragraph-group">
            {detail.intro.map((paragraph) => (
              <p key={paragraph} className="course-reading-paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="核心问题" eyebrow="问题进入" className="showcase-section-compact">
          {renderList(detail.keyQuestions)}
        </ShowcaseSection>

        <ShowcaseSection title="内容展开" eyebrow="课程主线" className="showcase-section-compact">
          <div className="course-reading-section-grid">
            {detail.sections.map((section) => (
              <article key={section.title} className="course-reading-section-card">
                <strong>{section.title}</strong>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="课程材料" eyebrow="材料摘要" className="showcase-section-compact">
          <div className="course-material-highlight-grid">
            {detail.materialHighlights.map((item) => (
              <article key={item.title} className="course-material-highlight-card">
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
              </article>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="教学设计" eyebrow="课堂组织" className="showcase-section-compact">
          <div className="course-reading-paragraph-group">
            <p className="course-reading-paragraph">{detail.teachingDesign.summary}</p>
          </div>
          {renderList(detail.teachingDesign.bullets)}
        </ShowcaseSection>

        <ShowcaseSection title="学习收获" eyebrow="阅读收束" className="showcase-section-compact">
          {renderList(detail.learningTakeaways)}
        </ShowcaseSection>
      </div>
    </main>
  );
}
