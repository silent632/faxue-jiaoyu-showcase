import { notFound } from "next/navigation";

import CourseMaterialArticle from "@/components/course-material-article";
import { CoursePeriodShell } from "@/components/course-period-shell";
import LegacyCourseMaterialRedirect from "@/components/legacy-course-material-redirect";
import { getCoursePackagePeriods, getCoursePackagePeriodBySlug } from "@/lib/course-package";
import { getCourseMaterialStaticSlugs, resolveCourseMaterialSlug } from "@/lib/course-material-pages";

export function generateStaticParams() {
  const materialSlugs = getCourseMaterialStaticSlugs();

  return getCoursePackagePeriods().flatMap((period) =>
    materialSlugs.map((materialSlug) => ({
      slug: period.slug,
      materialSlug,
    }))
  );
}

export default async function CourseMaterialPage({ params }) {
  const { slug, materialSlug } = await params;
  const resolvedMaterialSlug = resolveCourseMaterialSlug(materialSlug);
  const period = getCoursePackagePeriodBySlug(slug);
  const page = period?.materialPages.find((item) => item.slug === resolvedMaterialSlug);

  if (!period || !page) {
    notFound();
  }

  if (resolvedMaterialSlug !== materialSlug) {
    return (
      <CoursePeriodShell
        period={period}
        title={`${period.period} · ${page.label}`}
        summary={page.lead}
        activeMaterialSlug={page.slug}
      >
        <LegacyCourseMaterialRedirect href={`/courses/${slug}/${resolvedMaterialSlug}`} label={page.shortLabel || page.label} />
      </CoursePeriodShell>
    );
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
