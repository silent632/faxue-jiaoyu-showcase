import { loadCourseArchiveSource } from "./content/course-archive-source.js";
import { loadSiteContentSource } from "./content/site-content-source.js";
import { loadVideosContentSource } from "./content/videos-content-source.js";
import {
  buildShowcaseHomeVideoBlock,
  getShowcaseVideoPeriods,
  getShowcaseVideoPhaseGuide,
} from "./showcase-home-videos.js";
import { getDefaultShowcaseStudyDemoHref } from "./showcase-route-defaults.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function rewriteShowcaseHref(href, { canonicalCaseHref, studyDemoHref }) {
  if (typeof href !== "string") return href;
  if (href === "/cases/case-0208/study" || href.endsWith("/study")) return studyDemoHref;
  if (href === "/cases/case-0208") return canonicalCaseHref;
  return href;
}

function rewriteShowcaseLinks(value, options) {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteShowcaseLinks(item, options));
  }

  if (!value || typeof value !== "object") return value;

  const next = {};
  for (const [key, child] of Object.entries(value)) {
    next[key] = key === "href" ? rewriteShowcaseHref(child, options) : rewriteShowcaseLinks(child, options);
  }
  return next;
}

function buildCourseArchivePeriods(videoPeriods) {
  const archive = loadCourseArchiveSource();
  return videoPeriods.map((item) => ({
    slug: item.slug,
    period: item.period,
    title: item.title,
    theme: item.theme,
    module: item.module,
    stageTag: item.stageTag,
    phaseLabel: item.phaseLabel,
    description: item.summary,
    materials: archive.materialsByPeriod?.[item.period] ?? archive.defaultMaterials ?? [],
    detailHref: `/courses/${item.slug}`,
    videoHref: item.href,
    videoEntryLabel: "进入本期视频内容",
  }));
}

export function buildShowcaseNavItems({ studyDemoHref = getDefaultShowcaseStudyDemoHref() } = {}) {
  const source = loadSiteContentSource();
  return source.nav.map((item) => ({
    ...item,
    href: item.matchKind === "study" ? studyDemoHref : item.href,
  }));
}

export function buildShowcaseContent({ studyDemoHref = getDefaultShowcaseStudyDemoHref() } = {}) {
  const canonicalCaseHref = studyDemoHref.replace(/\/study\/?$/u, "");
  const siteContent = rewriteShowcaseLinks(clone(loadSiteContentSource()), { canonicalCaseHref, studyDemoHref });
  const videoContent = loadVideosContentSource();
  const videoPeriods = getShowcaseVideoPeriods();
  const phaseGuide = getShowcaseVideoPhaseGuide();
  const homeVideoBlock = buildShowcaseHomeVideoBlock();
  const courseArchivePeriods = buildCourseArchivePeriods(videoPeriods);

  return {
    ...siteContent,
    nav: buildShowcaseNavItems({ studyDemoHref }),
    homeVideoBlock,
    videoHub: {
      title: videoContent.videoHub?.title || homeVideoBlock.title,
      hero: videoContent.videoHub?.hero || homeVideoBlock.description,
      phaseGuide,
      periods: videoPeriods,
    },
    courses: {
      timeline: courseArchivePeriods.map((item) => ({ period: item.period, title: item.theme })),
      bands: phaseGuide,
      periods: courseArchivePeriods,
    },
  };
}
