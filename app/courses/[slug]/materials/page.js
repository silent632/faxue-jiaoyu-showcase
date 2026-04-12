import { notFound } from "next/navigation";

import { CoursePeriodSectionContent, CoursePeriodShell } from "@/components/course-period-shell";
import { getCoursePackagePeriodBySlug, getCoursePackageStaticParams } from "@/lib/course-package";

const PAGE_TITLE = "材料与案例";

export function generateStaticParams() {
  return getCoursePackageStaticParams();
}

export default async function CoursePeriodMaterialsPage({ params }) {
  const { slug } = await params;
  const period = getCoursePackagePeriodBySlug(slug);

  if (!period) {
    notFound();
  }

  const section = period.sectionPages.materials;

  return (
    <CoursePeriodShell period={period} title={`${period.period} · ${PAGE_TITLE}`} summary={section.lead} activeSectionKey="materials">
      <CoursePeriodSectionContent period={period} section={section} />
    </CoursePeriodShell>
  );
}
