import { notFound } from "next/navigation";

import { CoursePeriodSectionContent, CoursePeriodShell } from "@/components/course-period-shell";
import { getCoursePackagePeriodBySlug, getCoursePackageStaticParams } from "@/lib/course-package";

export function generateStaticParams() {
  return getCoursePackageStaticParams();
}

export default async function CoursePeriodOutcomesPage({ params }) {
  const { slug } = await params;
  const period = getCoursePackagePeriodBySlug(slug);

  if (!period) {
    notFound();
  }

  const { courseContentProfile, sectionPages } = period;
  const section = sectionPages.outcomes;

  return (
    <CoursePeriodShell
      period={period}
      title={`${period.period} · ${section.title}`}
      summary={courseContentProfile.sectionSummaries.outcomes.detail}
      activeSectionKey="outcomes"
    >
      <CoursePeriodSectionContent period={period} section={section} />
    </CoursePeriodShell>
  );
}
