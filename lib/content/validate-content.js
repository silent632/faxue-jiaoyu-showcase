import { readdirSync } from "node:fs";
import path from "node:path";

import { CONTENT_ROOT, resolveContentPath } from "./content-paths.js";
import { loadCourseContentProfileSource } from "./course-content-source.js";
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
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
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
  const filesToCheck = [
    resolveContentPath("courses", "course-period-01.json"),
  ];

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
  try {
    const period01 = loadCourseContentProfileSource("course-period-01");
    if (!period01) {
      errors.push("course-period-01 migrated content did not load");
      return;
    }
    if (!Array.isArray(period01.coreQuestions) || period01.coreQuestions.length < 3) {
      errors.push("course-period-01 must expose at least three core questions");
    }
    if (!Array.isArray(period01.contentFlow) || period01.contentFlow.length < 3) {
      errors.push("course-period-01 must expose at least three content flow entries");
    }
  } catch (error) {
    errors.push(error.message);
  }
}

export function validateContent() {
  const errors = [];
  validateCopyPolicy(errors);
  validateJsonFiles(errors);
  validateMigratedCourses(errors);
  if (!errors.length) validateContentCopy(errors);
  return {
    ok: errors.length === 0,
    errors,
  };
}
