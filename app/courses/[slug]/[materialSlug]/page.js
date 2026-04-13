import { notFound, redirect } from "next/navigation";

import CourseMaterialArticle from "@/components/course-material-article";
import { CoursePeriodShell } from "@/components/course-period-shell";
import { getCoursePackagePeriods, getCoursePackagePeriodBySlug } from "@/lib/course-package";
import { resolveCourseMaterialSlug } from "@/lib/course-material-pages";

export function generateStaticParams() {
  return getCoursePackagePeriods().flatMap((period) =>
    period.materialPages.map((page) => ({
      slug: period.slug,
      materialSlug: page.slug,
    }))
  );
}

export default async function CourseMaterialPage({ params }) {
  const { slug, materialSlug } = await params;
  const resolvedMaterialSlug = resolveCourseMaterialSlug(materialSlug);

  if (resolvedMaterialSlug !== materialSlug) {
    redirect(`/courses/${slug}/${resolvedMaterialSlug}`);
  }

  const period = getCoursePackagePeriodBySlug(slug);
  const page = period?.materialPages.find((item) => item.slug === resolvedMaterialSlug);

  if (!period || !page) {
    notFound();
  }

  return (
    <CoursePeriodShell
      period={period}
      title={`${period.period} · ${page.label}`}
      summary={page.lead}
      activeMaterialSlug={page.slug}
    >
      <CourseMaterialArticle period={period} page={page} />
    </CoursePeriodShell>
  );
}
