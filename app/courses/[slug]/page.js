import Link from "next/link";
import { notFound } from "next/navigation";

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

  const { periodHome, courseContentProfile } = period;
  const focusQuestions = courseContentProfile.coreQuestions.slice(0, 3);
  const caseHighlights = [...courseContentProfile.caseStudy.mainCases, ...courseContentProfile.caseStudy.supportCases].slice(0, 4);
  const learningSignals = courseContentProfile.studentOutcomes.learningShift.length > 0
    ? courseContentProfile.studentOutcomes.learningShift
    : courseContentProfile.teachingDesign.trainingFocus;

  return (
    <CoursePeriodShell period={period} title={period.title} summary={periodHome.summary}>
      <ShowcaseSection
        title="本期概览"
        eyebrow={period.period}
        description={courseContentProfile.periodSummary.lead}
        className="showcase-section-compact course-period-home-section"
      >
        <p className="course-period-home-order">
          本期导读 · 重点问题 · 内容展开 · 材料与案例 · 学习成果 · 教学安排
        </p>

        <div className="course-period-home-grid">
          <div className="course-period-home-panel">
            <strong>课程定位</strong>
            <p>{courseContentProfile.periodSummary.position}</p>
            <ul className="course-detail-list">
              {courseContentProfile.periodSummary.keySignals.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="course-period-home-panel">
            <strong>重点问题</strong>
            <ul className="course-detail-list">
              {focusQuestions.map((item) => (
                <li key={item.question}>{item.question}</li>
              ))}
            </ul>
          </div>

          <div className="course-period-home-panel">
            <strong>核心案例</strong>
            <ul className="course-detail-list">
              {caseHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="course-period-home-panel">
            <strong>学习转变</strong>
            <ul className="course-detail-list">
              {learningSignals.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="course-period-card-grid">
          {periodHome.cards.map((card) => (
            <article key={card.key} className="course-period-card">
              <div className="course-period-card-copy">
                <span className="showcase-card-eyebrow">{card.label}</span>
                <strong>{card.summary}</strong>
                <p>{card.detail}</p>
              </div>

              <Link href={card.href} className="showcase-home-panel-link">
                查看{card.label}
              </Link>
            </article>
          ))}
        </div>
      </ShowcaseSection>
    </CoursePeriodShell>
  );
}
