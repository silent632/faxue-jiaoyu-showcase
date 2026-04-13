import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCoursePackagePeriodBySlug } from "../../lib/course-package.js";
import { getCourseMaterialStaticSlugs, resolveCourseMaterialSlug } from "../../lib/course-material-pages.js";
import { getShowcaseVideoBySlug } from "../../lib/showcase-home-videos.js";

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

test("courses page removes legacy unified material copy and adopts compact framework class names", () => {
  const coursesSource = readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8");

  assert.doesNotMatch(coursesSource, /四类材料贯穿八期课程/u);
  assert.doesNotMatch(coursesSource, /每一期都围绕自身主题重写法理导学、任务单、课堂观察和学习成果/u);
  assert.match(coursesSource, /course-framework/u);
  assert.doesNotMatch(coursesSource, /course-unified-material-/u);
});

test("courses page copy avoids reviewer-rejected wording like 便于", () => {
  const coursesSource = readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8");

  assert.doesNotMatch(coursesSource, /便于/u);
});

test("late-stage showcase video copy is concrete and tied to legal themes", () => {
  const period05 = getShowcaseVideoBySlug("course-period-05");
  const period06 = getShowcaseVideoBySlug("course-period-06");
  const period08 = getShowcaseVideoBySlug("course-period-08");
  const texts = [period05, period06, period08]
    .flatMap((item) => [item?.summary ?? "", item?.purpose ?? ""])
    .join("\n");

  assert.equal(Boolean(period05 && period06 && period08), true);
  assert.doesNotMatch(texts, /示范课程视频展示/u);
  assert.doesNotMatch(texts, /资源化表达的延展方向/u);
  assert.doesNotMatch(texts, /阶段性收束/u);

  const period05Text = `${period05.summary}\n${period05.purpose}`;
  const period06Text = `${period06.summary}\n${period06.purpose}`;
  const period08Text = `${period08.summary}\n${period08.purpose}`;

  assert.match(period05Text, /非法证据/u);
  assert.match(period05Text, /程序正义/u);
  assert.match(period05Text, /国家.{0,8}取证|取证.{0,8}国家/u);
  assert.match(period05Text, /权力|权限|取证权|边界/u);

  assert.match(period06Text, /人脸识别/u);
  assert.match(period06Text, /同意.{0,8}边界|边界.{0,8}同意/u);
  assert.match(period06Text, /人格权/u);

  assert.match(period08Text, /生成式\s*AI/u);
  assert.match(period08Text, /作品认定/u);
  assert.match(period08Text, /责任.{0,8}边界|边界.{0,8}责任/u);
});

test("globals css removes legacy course-system dead class selectors", () => {
  const globalsSource = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.doesNotMatch(globalsSource, /\.course-period-bridge\b/u);
  assert.doesNotMatch(globalsSource, /\.course-period-outline-list\b/u);
  assert.doesNotMatch(globalsSource, /\.course-period-home-panel\b/u);
  assert.doesNotMatch(globalsSource, /\.course-material-clue\b/u);
});
