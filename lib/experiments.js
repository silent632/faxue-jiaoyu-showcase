import { loadJsonFile } from "./content/load-json.js";
import { resolveContentPath } from "./content/content-paths.js";

let cachedExperiments = null;
let cachedTags = null;

export function loadExperimentsContent() {
  if (!cachedExperiments) {
    cachedExperiments = loadJsonFile(resolveContentPath("experiments.json"));
  }
  return cachedExperiments;
}

export function loadJurisprudenceTags() {
  if (!cachedTags) {
    cachedTags = loadJsonFile(resolveContentPath("jurisprudence-tags.json"));
  }
  return cachedTags;
}

export function getExperimentModules() {
  return loadExperimentsContent().modules;
}

export function getExperimentModuleById(moduleId) {
  return getExperimentModules().find((m) => m.id === moduleId) || null;
}

export function getExperimentMicroLoop() {
  return loadExperimentsContent().microLoop;
}

export function getExperimentFormula() {
  return loadExperimentsContent().formula;
}

export function getExperimentStaticParams() {
  return getExperimentModules().map((m) => ({ moduleId: m.id }));
}

export function getTagGroupForModule(moduleId) {
  const tags = loadJurisprudenceTags();
  const group = tags.groups.find((g) => g.feedsModule === moduleId);
  if (!group) return null;
  return {
    ...group,
    tags: tags.tags.filter((t) => t.group === group.id),
  };
}

export function filterCasesForModule(cases, moduleId) {
  const mod = getExperimentModuleById(moduleId);
  if (!mod) return [];
  const primaryTags = mod.primaryTags || [];
  return cases.filter((c) => {
    const caseTags = c.jurisprudenceTags || [];
    return caseTags.some((t) => primaryTags.includes(t));
  });
}

export function sortCasesByRelevance(cases, moduleId) {
  const mod = getExperimentModuleById(moduleId);
  if (!mod) return cases;
  const primaryTags = mod.primaryTags || [];
  return [...cases].sort((a, b) => {
    const aHits = (a.jurisprudenceTags || []).filter((t) => primaryTags.includes(t)).length;
    const bHits = (b.jurisprudenceTags || []).filter((t) => primaryTags.includes(t)).length;
    return bHits - aHits;
  });
}
