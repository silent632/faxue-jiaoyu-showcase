import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCoursePackagePeriodBySlug } from "../../lib/course-package.js";
import { getCourseMaterialStaticSlugs, resolveCourseMaterialSlug } from "../../lib/course-material-pages.js";

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
});

test("material static slug helper includes legacy material slugs", () => {
  const slugs = getCourseMaterialStaticSlugs();

  assert.ok(slugs.includes("study-report-01"));
  assert.ok(slugs.includes("study-report-02"));
  assert.ok(slugs.includes("study-report-03"));
  assert.ok(slugs.includes("feedback-01"));
  assert.ok(slugs.includes("feedback-02"));
  assert.ok(slugs.includes("feedback-03"));
});

test("material page route source wires redirect and static slug support", () => {
  const source = readFileSync(new URL("../../app/courses/[slug]/[materialSlug]/page.js", import.meta.url), "utf8");

  assert.match(source, /redirect/u);
  assert.match(source, /resolveCourseMaterialSlug/u);
  assert.match(source, /getCourseMaterialStaticSlugs/u);
});

test("course overview and detail pages no longer hardcode fourteen material copies", () => {
  const coursesSource = readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8");
  const periodSource = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");

  assert.doesNotMatch(coursesSource, /十四份材料|十四份材料档案/u);
  assert.doesNotMatch(coursesSource, /\?\?\s*14/u);
  assert.doesNotMatch(periodSource, /十四份材料/u);
});
