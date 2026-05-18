import { existsSync } from "node:fs";
import path from "node:path";

import { resolveContentPath } from "./content-paths.js";
import { loadJsonFile } from "./load-json.js";

const MIGRATED_COURSE_SLUGS = new Set([
  "course-period-01",
  "course-period-02",
  "course-period-03",
  "course-period-04",
  "course-period-05",
  "course-period-06",
  "course-period-07",
  "course-period-08",
]);

function validateCourseProfileShape(slug, profile) {
  const requiredObjectFields = [
    "periodSummary",
    "caseStudy",
    "materialsInterpretation",
    "studentOutcomes",
    "teachingDesign",
    "sectionSummaries",
  ];
  const requiredArrayFields = ["coreQuestions", "contentFlow"];

  for (const field of requiredObjectFields) {
    if (!profile[field] || typeof profile[field] !== "object" || Array.isArray(profile[field])) {
      throw new Error(`${slug} content field "${field}" must be an object`);
    }
  }

  for (const field of requiredArrayFields) {
    if (!Array.isArray(profile[field])) {
      throw new Error(`${slug} content field "${field}" must be an array`);
    }
  }

  if (typeof profile.periodSummary.theme !== "string" || !profile.periodSummary.theme.trim()) {
    throw new Error(`${slug} content field "periodSummary.theme" is required`);
  }

  return profile;
}

export function loadCourseContentProfileSource(slug) {
  if (!MIGRATED_COURSE_SLUGS.has(slug)) return null;

  const filePath = resolveContentPath("courses", `${slug}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Migrated course content file is missing: ${path.relative(process.cwd(), filePath)}`);
  }

  return validateCourseProfileShape(slug, loadJsonFile(filePath));
}

export function getMigratedCourseSlugs() {
  return [...MIGRATED_COURSE_SLUGS];
}
