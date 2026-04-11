import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getCoursePackagePeriodBySlug,
  getCoursePackageStaticParams,
  normalizeCourseMaterialDisplayName,
} from "../../lib/course-package.js";

test("course package metadata exposes eight detail pages with normalized material names", () => {
  const params = getCoursePackageStaticParams();
  const period01 = getCoursePackagePeriodBySlug("course-period-01");
  const period06 = getCoursePackagePeriodBySlug("course-period-06");

  assert.equal(params.length, 8);
  assert.ok(params.some((item) => item.slug === "course-period-01"));
  assert.ok(params.some((item) => item.slug === "course-period-08"));

  assert.ok(period01);
  assert.equal(period01.period, "第一期");
  assert.equal(period01.detailHref, "/courses/course-period-01");
  assert.ok(Array.isArray(period01.materialGroups));
  assert.ok(period01.materialGroups.some((group) => group.title === "课程资料"));
  assert.ok(period01.materialGroups.some((group) => group.items.some((item) => item.displayName === "课程课件：类案检索与法律适用")));
  assert.ok(period01.materialGroups.some((group) => group.items.some((item) => item.displayName === "课件讲义版：类案检索与法律适用")));
  assert.ok(period01.materialGroups.some((group) => group.items.some((item) => item.displayName === "专题阅读：司法裁判的“同”与“不同”")));

  assert.ok(period06);
  assert.equal(period06.period, "第六期");
  assert.match(period06.guide.courseTheme, /个人信息保护与技术治理/u);
  assert.match(period06.guide.teachingTitle, /人脸识别中的同意边界/u);
  assert.ok(period06.outline.length >= 6);
  assert.ok(period06.materialGroups.some((group) => group.title === "佐证材料"));
});

test("material display name normalization removes raw file noise", () => {
  assert.equal(
    normalizeCourseMaterialDisplayName("课件：类案检索与法律适用（0905）.pptx"),
    "课程课件：类案检索与法律适用"
  );
  assert.equal(
    normalizeCourseMaterialDisplayName("课件：类案检索与法律适用（0905）(1).pdf"),
    "课件讲义版：类案检索与法律适用"
  );
  assert.equal(
    normalizeCourseMaterialDisplayName("司法裁判的“同”与“不同”：当法官自由裁量遇上科技赋能(1).pdf"),
    "专题阅读：司法裁判的“同”与“不同”"
  );
});

test("course detail page is exported as a static route with package-backed content", () => {
  const source = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");

  assert.match(source, /generateStaticParams/u);
  assert.match(source, /getCoursePackageStaticParams/u);
  assert.match(source, /getCoursePackagePeriodBySlug/u);
  assert.match(source, /本期成果|课程看点/u);
  assert.match(source, /教学设计/u);
  assert.equal(/课程概况/u.test(source), false);
});
