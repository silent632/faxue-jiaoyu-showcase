import { loadShowcaseCases } from '../lib/showcase-cases.js';
import { getExperimentModules } from '../lib/experiments.js';
import { getMigratedCourseSlugs } from '../lib/content/course-content-source.js';
export const dynamic = 'force-static';
export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://falixue-yanxi.pages.dev';
  const paths = ['/', '/cases/', '/courses/', '/experiments/', '/archive/', '/help/', '/help/guide/', '/help/feedback/', '/resources/',
    ...(await loadShowcaseCases()).flatMap(c => [`/cases/${c.id}/`, `/cases/${c.id}/study/`]),
    ...getMigratedCourseSlugs().map(slug => `/courses/${slug}/`), ...getExperimentModules().map(m => `/experiments/${m.id}/`)];
  return paths.map(p => ({ url: `${base}${p}` }));
}
