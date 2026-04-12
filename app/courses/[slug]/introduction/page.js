import { notFound } from "next/navigation";

import { CoursePeriodSectionContent, CoursePeriodShell } from "@/components/course-period-shell";
import { getCoursePackagePeriodBySlug, getCoursePackageStaticParams } from "@/lib/course-package";

const PAGE_TITLE = "本期导读";

export function generateStaticParams() {
  return getCoursePackageStaticParams();
}

export default async function CoursePeriodIntroductionPage({ params }) {
  const { slug } = await params;
  const period = getCoursePackagePeriodBySlug(slug);

  if (!period) {
    notFound();
  }

  const section = period.sectionPages.introduction;

  return (
    <CoursePeriodShell period={period} title={`${period.period} · ${PAGE_TITLE}`} summary={section.lead} activeSectionKey="introduction">
      <CoursePeriodSectionContent period={period} section={section} />
    </CoursePeriodShell>
  );
}
