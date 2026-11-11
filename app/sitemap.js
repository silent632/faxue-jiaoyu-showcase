import { loadShowcaseCases } from '../lib/showcase-cases.js';
import { getExperimentModules } from '../lib/experiments.js';
import { getMigratedCourseSlugs } from '../lib/content/course-content-source.js';
import { getCoursePackagePeriods } from '../lib/course-package.js';
import { getShowcaseVideoStaticParams } from '../lib/showcase-home-videos.js';
export const dynamic = 'force-static';
export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://falixue-yanxi.pages.dev';
  const paths = ['/', '/cases/', '/knowledge/', '/courses/', '/experiments/', '/archive/', '/help/', '/help/guide/', '/help/feedback/', '/resources/',
    ...(await loadShowcaseCases()).flatMap(c => [`/cases/${c.id}/`, `/cases/${c.id}/study/`]),
    ...getMigratedCourseSlugs().map(slug => `/courses/${slug}/`),
    ...getCoursePackagePeriods().flatMap(period => (period.materialPages || []).map(page => `/courses/${period.slug}/${page.slug}/`)),
    ...getShowcaseVideoStaticParams().map(video => `/resources/videos/${video.slug}/`),
    ...getExperimentModules().map(m => `/experiments/${m.id}/`)];
  return paths.map(p => ({ url: `${base}${p}` }));
}
