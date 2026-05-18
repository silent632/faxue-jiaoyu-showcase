import { readdirSync } from "node:fs";
import path from "node:path";

import { CONTENT_ROOT, resolveContentPath } from "./content-paths.js";
import { getMigratedCourseSlugs, loadCourseContentProfileSource } from "./course-content-source.js";
import { loadCopyPolicy, listForbiddenCopyMatches } from "./copy-policy.js";
import { loadJsonFile } from "./load-json.js";

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
  if (!Array.isArray(site.nav) || site.nav.length < 5) errors.push("site.json must include public nav items");
  if (!Array.isArray(site.homeResultTracks) || site.homeResultTracks.length !== 3) {
    errors.push("site.json must include three home result tracks");
  }
  if (!Array.isArray(site.impact?.sections) || site.impact.sections.length !== 4) {
    errors.push("site.json must include four impact sections");
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
  validateCopyPolicy(errors);
  validateJsonFiles(errors);
  validateMigratedCourses(errors);
  validateSiteContent(errors);
  validateVideoContent(errors);
  if (!errors.length) validateContentCopy(errors);
  return {
    ok: errors.length === 0,
    errors,
  };
}
