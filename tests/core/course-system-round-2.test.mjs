import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCoursePackagePeriodBySlug } from "../../lib/course-package.js";
import { COURSE_MATERIAL_SLUG_MAP, resolveCourseMaterialSlug } from "../../lib/course-material-pages.js";

test("material pages follow the ten-item standard slug order", () => {
  const period02 = getCoursePackagePeriodBySlug("course-period-02");
  const slugs = period02.materialPages.map((page) => page.slug);

  assert.deepEqual(slugs, [
    "teaching-guide",
    "jurisprudence-guide",
    "study-task-sheet",
    "mentor-role-plan",
    "classroom-observation",
    "peer-review-theory",
    "peer-review-practice",
    "evaluation-metrics",
    "study-report",
    "feedback",
  ]);
});

test("material labels no longer include ordered suffix markers", () => {
  const period03 = getCoursePackagePeriodBySlug("course-period-03");
  const labels = [
    ...period03.materialPages.map((page) => page.label),
    ...period03.materialPages.map((page) => page.shortLabel),
    ...period03.materialDirectory.flatMap((group) => group.items.map((item) => item.label)),
    ...period03.materialDirectory.flatMap((group) => group.items.map((item) => item.shortLabel)),
  ].filter(Boolean);

  assert.equal(labels.some((label) => /（一）|（二）|（三）/u.test(label)), false);
});

test("material slug resolver merges legacy report and feedback slugs", () => {
  assert.equal(resolveCourseMaterialSlug("study-report-01"), "study-report");
  assert.equal(resolveCourseMaterialSlug("study-report-02"), "study-report");
  assert.equal(resolveCourseMaterialSlug("study-report-03"), "study-report");
  assert.equal(resolveCourseMaterialSlug("feedback-01"), "feedback");
  assert.equal(resolveCourseMaterialSlug("feedback-02"), "feedback");
  assert.equal(resolveCourseMaterialSlug("feedback-03"), "feedback");
  assert.equal(resolveCourseMaterialSlug("study-report"), "study-report");

  assert.deepEqual(COURSE_MATERIAL_SLUG_MAP, {
    "study-report-01": "study-report",
    "study-report-02": "study-report",
    "study-report-03": "study-report",
    "feedback-01": "feedback",
    "feedback-02": "feedback",
    "feedback-03": "feedback",
  });
});

test("material page route source wires redirect and slug resolution", () => {
  const source = readFileSync(new URL("../../app/courses/[slug]/[materialSlug]/page.js", import.meta.url), "utf8");

  assert.match(source, /redirect/u);
  assert.match(source, /resolveCourseMaterialSlug/u);
});
