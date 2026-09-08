import { readFileSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./content/content-paths.js";
import { loadCourseArchiveSource } from "./content/course-archive-source.js";
import { loadSiteContentSource } from "./content/site-content-source.js";
import { loadVideosContentSource } from "./content/videos-content-source.js";
import {
  buildShowcaseHomeVideoBlock,
  getShowcaseVideoPeriods,
  getShowcaseVideoPhaseGuide,
} from "./showcase-home-videos.js";

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

export function buildShowcaseNavItems() {
  return loadSiteContentSource().nav;
}

export function buildShowcaseContent() {
  const siteContent = loadSiteContentSource();
  const videoContent = loadVideosContentSource();
  const videoPeriods = getShowcaseVideoPeriods();
  const phaseGuide = getShowcaseVideoPhaseGuide();
  const homeVideoBlock = buildShowcaseHomeVideoBlock();
  const courseArchivePeriods = buildCourseArchivePeriods(videoPeriods);

  return {
    ...siteContent,
    metrics: { ...siteContent.metrics,
      caseCount: { ...siteContent.metrics.caseCount, value: `${JSON.parse(readFileSync(path.join(REPO_ROOT, "data/generated/cases-extracted.json"), "utf8")).length}+`, raw: JSON.parse(readFileSync(path.join(REPO_ROOT, "data/generated/cases-extracted.json"), "utf8")).length, status: "content-count" },
      coursePeriods: { ...siteContent.metrics.coursePeriods, value: `${videoPeriods.length}期`, raw: videoPeriods.length, status: "content-count" },
    },
    nav: buildShowcaseNavItems(),
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
