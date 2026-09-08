import { validateRepositoryCaseRubrics } from "./case-rubrics.js";
import { validateRepositoryAnnotationEvidence } from "./annotation-evidence.js";
import { validateRepositoryNormEvidence } from "./norm-evidence.js";
import { readdirSync } from "node:fs";
import path from "node:path";

import { CONTENT_ROOT, REPO_ROOT, resolveContentPath } from "./content-paths.js";
import { getMigratedCourseSlugs, loadCourseContentProfileSource } from "./course-content-source.js";
import { loadCopyPolicy, listForbiddenCopyMatches } from "./copy-policy.js";
import { loadJsonFile } from "./load-json.js";
import { validateRepositoryCaseEvidence } from "./case-evidence.js";

function collectStrings(value, result = []) {
  if (typeof value === "string") {
    result.push(value);
    return result;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, result);
    return result;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, result);
  }
  return result;
}

function validateCopyPolicy(errors) {
  try {
    loadCopyPolicy();
  } catch (error) {
    errors.push(error.message);
  }
}

function validateJsonFiles(errors) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "copy-policy.json") {
        files.push(fullPath);
      }
    }
  };

  walk(CONTENT_ROOT);
  for (const filePath of files) {
    try {
      loadJsonFile(filePath);
    } catch (error) {
      errors.push(error.message);
    }
  }
}

function validateContentCopy(errors) {
  const policy = loadCopyPolicy();
  const filesToCheck = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "copy-policy.json") {
        filesToCheck.push(fullPath);
      }
    }
  };

  walk(CONTENT_ROOT);

  for (const filePath of filesToCheck) {
    let payload;
    try {
      payload = loadJsonFile(filePath);
    } catch (_error) {
      continue;
    }

    const text = collectStrings(payload).join("\n");
    const matches = listForbiddenCopyMatches(text, policy);
    if (matches.length) {
      errors.push(`${path.relative(CONTENT_ROOT, filePath)} contains forbidden copy: ${matches.join(", ")}`);
    }
  }
}

function validateMigratedCourses(errors) {
  let caseIds = new Set();
  try {
    const cases = loadJsonFile(path.join(REPO_ROOT, "data", "generated", "cases-extracted.json"));
    caseIds = new Set((Array.isArray(cases) ? cases : []).map((item) => item.case_id));
  } catch (error) {
    errors.push(error.message);
  }

  for (const slug of getMigratedCourseSlugs()) {
    try {
      const profile = loadCourseContentProfileSource(slug);
      if (!profile) {
        errors.push(`${slug} migrated content did not load`);
        continue;
      }
      if (!Array.isArray(profile.coreQuestions) || profile.coreQuestions.length < 3) {
        errors.push(`${slug} must expose at least three core questions`);
      }
      if (!Array.isArray(profile.contentFlow) || profile.contentFlow.length < 3) {
        errors.push(`${slug} must expose at least three content flow entries`);
      }
      if (!Array.isArray(profile.recommendedCases) || profile.recommendedCases.length < 3 || profile.recommendedCases.length > 4) {
        errors.push(`${slug} must expose three or four recommended cases`);
      }
      const seenCaseIds = new Set();
      for (const item of profile.recommendedCases || []) {
        if (!caseIds.has(item.caseId)) {
          errors.push(`${slug} recommended case ${item.caseId || "unknown"} does not exist`);
        }
        if (!item.reason || typeof item.reason !== "string" || !item.reason.trim()) {
          errors.push(`${slug} recommended case ${item.caseId || "unknown"} must include a reason`);
        }
        if (seenCaseIds.has(item.caseId)) {
          errors.push(`${slug} recommended case ${item.caseId} is duplicated`);
        }
        seenCaseIds.add(item.caseId);
      }
    } catch (error) {
      errors.push(error.message);
    }
  }
}

function validateSiteContent(errors) {
  let site;
  try {
    site = loadJsonFile(resolveContentPath("site.json"));
  } catch (error) {
    errors.push(error.message);
    return;
  }

  if (!site.site?.title) errors.push("site.json must include site.title");
  if (!Array.isArray(site.nav) || site.nav.length !== 6) errors.push("site.json must include six public nav items including help");
  if (!site.metrics || typeof site.metrics !== "object" || Object.keys(site.metrics).length < 4) {
    errors.push("site.json must include platform metrics");
  }
  if (!Array.isArray(site.impact?.sections) || site.impact.sections.length !== 4) {
    errors.push("site.json must include four impact sections");
  }
  if (!site.learningLoop?.archive?.title || !site.learningLoop?.archive?.empty?.description) {
    errors.push("site.json must include archive page copy");
  }
}

function validateExperimentsContent(errors) {
  let data;
  try {
    data = loadJsonFile(resolveContentPath("experiments.json"));
  } catch (error) {
    errors.push(error.message);
    return;
  }

  if (!Array.isArray(data.modules) || data.modules.length !== 6) {
    errors.push("experiments.json must include six experiment modules");
    return;
  }
  for (const mod of data.modules) {
    if (!mod.id || !mod.name || !mod.skill || !mod.chapter) {
      errors.push(`experiments.json module ${mod.id || "unknown"} is missing required fields`);
    }
    if (!mod.dualTeacher?.theoryPrompt || !mod.dualTeacher?.practicePrompt) {
      errors.push(`experiments.json module ${mod.id || "unknown"} must include dual-teacher prompts`);
    }
    if (!mod.selfEvaluation?.dimensions || !Array.isArray(mod.selfEvaluation.dimensions) || mod.selfEvaluation.dimensions.length === 0) {
      errors.push(`experiments.json module ${mod.id || "unknown"} must include selfEvaluation dimensions`);
    }
  }
}

function validateJurisprudenceTags(errors) {
  let data;
  try {
    data = loadJsonFile(resolveContentPath("jurisprudence-tags.json"));
  } catch (error) {
    errors.push(error.message);
    return;
  }

  if (!Array.isArray(data.groups) || data.groups.length < 6) {
    errors.push("jurisprudence-tags.json must include at least six tag groups");
  }
  if (!Array.isArray(data.tags) || data.tags.length < 10) {
    errors.push("jurisprudence-tags.json must include at least ten tags");
  }
  for (const tag of data.tags || []) {
    if (!tag.id || !tag.label || !tag.group) {
      errors.push(`jurisprudence-tags.json tag ${tag.id || "unknown"} is missing required fields`);
    }
  }
}

function validateVideoContent(errors) {
  let videos;
  try {
    videos = loadJsonFile(resolveContentPath("videos.json"));
  } catch (error) {
    errors.push(error.message);
    return;
  }

  if (!Array.isArray(videos.phaseGuide) || videos.phaseGuide.length < 2) {
    errors.push("videos.json must include phaseGuide entries");
  }
  if (!Array.isArray(videos.periods) || videos.periods.length !== 8) {
    errors.push("videos.json must include eight video periods");
    return;
  }
  for (const period of videos.periods) {
    if (!period.slug || !period.period || !period.title || !period.sourceHref) {
      errors.push(`videos.json period ${period.slug || "unknown"} is missing required fields`);
    }
  }
}

export function validateContent() {
  const errors = [];
  errors.push(...validateRepositoryCaseEvidence());
  errors.push(...validateRepositoryNormEvidence());
  errors.push(...validateRepositoryAnnotationEvidence());
  errors.push(...validateRepositoryCaseRubrics());
  validateCopyPolicy(errors);
  validateJsonFiles(errors);
  validateMigratedCourses(errors);
  validateSiteContent(errors);
  validateExperimentsContent(errors);
  validateJurisprudenceTags(errors);
  validateVideoContent(errors);
  if (!errors.length) validateContentCopy(errors);
  return {
    ok: errors.length === 0,
    errors,
  };
}
