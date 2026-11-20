import CourseTaskCard from "@/components/course-task-card";
import { getPublicJurisprudenceLearning } from "@/lib/content/jurisprudence-learning.js";
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
  const summary = period.archiveCard.lead;
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
  const task = loadCourseTasks().find(item => item.slug === slug);
  const { topics, caseLinks } = getPublicJurisprudenceLearning();
  const caseTopics = topics.filter(topic => caseLinks.some(link => link.caseId === task?.caseId && link.topicId === topic.id));
  const recommendationCopy = buildShowcaseContent().learningLoop.courseRecommendation;

  return (
    <CoursePeriodShell period={period} title={period.title} summary={summary}>
      {task && <CourseTaskCard task={task} />}
      <section className="showcase-card course-learning-focus" aria-label="本期学习重点">
        <div>
          <h2>本期学习重点</h2>
          <p>{task?.goal || summary}</p>
        </div>
        {caseTopics.length > 0 && <div>
          <h3>相关法理知识</h3>
          <div className="console-actions">
            {caseTopics.map(topic => <Link key={topic.id} className="btn btn-outline" href={`/knowledge/#${topic.id}`}>{topic.title} →</Link>)}
          </div>
        </div>}
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
              <Link key={caseId} className="course-recommended-card" href={`/cases/${caseId}/?course=${slug}&origin=course`}>
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
      <section id="course-materials" className="showcase-card course-period-materials" aria-label="本期材料入口">
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

        <details className="course-period-materials-disclosure">
          <summary>展开本期材料</summary>
          <CourseMaterialDirectory groups={period.materialDirectory} variant="inline" />
        </details>
      </section>
    </CoursePeriodShell>
  );
}

export async function generateMetadata({ params }) { const { slug } = await params; const period = getCoursePackagePeriodBySlug(slug); return period ? { title: `${period.title} · 课程研习`, description: period.courseContentProfile.periodSummary.lead, alternates: { canonical: `/courses/${slug}/` } } : {}; }
