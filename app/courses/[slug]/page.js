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

  const home = period.periodHome;

  return (
    <CoursePeriodShell period={period} title={period.title} summary={home.summary}>
      <ShowcaseSection
        title="本期线索"
        eyebrow={period.period}
        description="这一期的课程主线、材料入口和六个栏目入口都集中放在这里。"
        className="showcase-section-compact course-period-home-section"
      >
        <p className="course-period-home-order">
          本期导读 · 重点问题 · 内容展开 · 材料与案例 · 学习成果 · 教学安排
        </p>

        <div className="course-period-home-grid">
          <div className="course-period-home-panel">
            <strong>主线概览</strong>
            <ul className="course-detail-list">
              {home.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="course-period-home-panel">
            <strong>材料线索</strong>
            <div className="course-material-clue-row">
              {home.materialClues.map((item) => (
                <span key={item} className="course-material-clue">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="course-period-card-grid">
          {period.periodHome.cards.map((card) => (
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
