import { loadVideosContentSource } from "./content/videos-content-source.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getVideoSource() {
  return loadVideosContentSource();
}

export function buildShowcaseVideoPeriod({
  slug,
  period,
  title,
  theme,
  stageTag,
  phaseLabel,
  module,
  summary,
  purpose,
  sourceHref = null,
  segments = [],
}) {
  const source = getVideoSource();
  const pathPrefix = source.internalPathPrefix || "/resources/videos";
  const normalizedSourceHref = typeof sourceHref === "string" && sourceHref.trim().length > 0 ? sourceHref.trim() : null;
  const normalizedSegments = Array.isArray(segments) ? segments : [];
  const prefersDirectVideo = Boolean(normalizedSourceHref);

  return {
    slug,
    period,
    title,
    theme,
    stageTag,
    phaseLabel,
    module,
    summary,
    purpose,
    href: `${pathPrefix}/${slug}`,
    sourceHref: normalizedSourceHref,
    external: false,
    playerMode: prefersDirectVideo ? "video" : normalizedSegments.length > 0 ? "segments" : "video",
    segments: prefersDirectVideo ? [] : normalizedSegments,
  };
}

export function getShowcaseVideoPeriods() {
  return getVideoSource().periods.map((item) => buildShowcaseVideoPeriod(item));
}

export function getShowcaseVideoPhaseGuide() {
  return clone(getVideoSource().phaseGuide || []);
}

export function getShowcaseVideoBySlug(slug) {
  return getShowcaseVideoPeriods().find((item) => item.slug === slug) || null;
}

export function getShowcaseVideoStaticParams() {
  return getVideoSource().periods.map((item) => ({ slug: item.slug }));
}

export function buildShowcaseHomeVideoBlock() {
  const source = getVideoSource();
  return {
    title: source.homeBlock?.title || "八期课程视频成果",
    description: source.homeBlock?.description || "八期课程视频按期次展示。",
    phaseGuide: getShowcaseVideoPhaseGuide(),
    periods: getShowcaseVideoPeriods(),
  };
}
