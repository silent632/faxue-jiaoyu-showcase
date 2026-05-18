import { loadSiteContentSource } from "./content/site-content-source.js";

function getMetaSource() {
  return loadSiteContentSource().supportingPageMeta || {};
}

export function getCourseTimelineDetail(item) {
  const source = getMetaSource();
  return (
    source.timelineDetailsByPeriod?.[item.period] ??
    source.timelineDetailsByPeriod?.[item.title] ??
    source.defaultTimelineDetail ?? {
      phase: "课程推进",
      focus: "围绕案例研习、规范适用与课堂讨论组织课程。",
    }
  );
}

export function defaultResourceSectionMeta(group) {
  return {
    eyebrow: "资源配置",
    title: group.title,
    description: group.intro ?? "围绕课程实施、课堂协同与学习评价提供教学支撑材料。",
  };
}

export function buildResourceSectionMeta(group) {
  return getMetaSource().resourceSectionMetaByTitle?.[group.title] ?? defaultResourceSectionMeta(group);
}

export function defaultResourceNote(group) {
  return `${group.title}中的材料围绕课程实施、研习支持与成果回收提供稳定支撑。`;
}

export function buildResourceNote(group, item) {
  return getMetaSource().resourceNotesByItem?.[item] ?? defaultResourceNote(group);
}

export function defaultImpactSectionMeta(item) {
  return {
    eyebrow: "项目成效",
    title: item.title,
    description: item.intro ?? "围绕教学建设、平台运行与学习成果持续呈现项目推进成效。",
  };
}

export function buildImpactSectionMeta(item) {
  return getMetaSource().impactSectionMetaByTitle?.[item.title] ?? defaultImpactSectionMeta(item);
}

export function defaultImpactSummary(item) {
  const fallbackPoints =
    item.points?.length > 0
      ? item.points.slice(0, 3)
      : ["围绕课程实施、资源支撑与平台展示持续沉淀项目成效。"];

  return {
    lead: item.intro ?? "项目围绕课程实施、案例研习与平台支撑形成了持续推进的整体成效。",
    points: fallbackPoints,
  };
}

export function buildImpactSummary(item) {
  return getMetaSource().impactSummariesByTitle?.[item.title] ?? defaultImpactSummary(item);
}
