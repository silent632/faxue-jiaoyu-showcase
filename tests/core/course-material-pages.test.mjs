import test from "node:test";
import assert from "node:assert/strict";

import { getCoursePackagePeriodBySlug } from "../../lib/course-package.js";

test("course package exposes four material groups and fourteen material pages for period 02", () => {
  const period02 = getCoursePackagePeriodBySlug("course-period-02");

  assert.ok(period02);
  assert.equal(period02.materialDirectory.length, 4);
  assert.equal(period02.materialPages.length, 14);
  assert.deepEqual(
    period02.materialDirectory.map((group) => group.title),
    ["教学设计类", "课堂实施类", "协同反思类", "学习成果类"]
  );
});

test("period 02 material pages keep concrete course-facing copy", () => {
  const period02 = getCoursePackagePeriodBySlug("course-period-02");
  const guidePage = period02.materialPages.find((item) => item.slug === "teaching-guide");
  const jurisprudencePage = period02.materialPages.find((item) => item.slug === "jurisprudence-guide");

  assert.match(guidePage.lead, /权利义务相一致|小马奔腾/u);
  assert.equal(Array.isArray(guidePage.sections), true);
  assert.equal(guidePage.sections.length >= 3, true);
  assert.equal(
    jurisprudencePage.sections.some((section) => /法理|推演|思考/u.test(section.title)),
    true
  );
});

test("late periods expose course-style pages instead of production-process wording", () => {
  const period05 = getCoursePackagePeriodBySlug("course-period-05");
  const period08 = getCoursePackagePeriodBySlug("course-period-08");

  for (const period of [period05, period08]) {
    const guidePage = period.materialPages.find((item) => item.slug === "teaching-guide");
    const reportPage = period.materialPages.find((item) => item.slug === "study-report-01");

    assert.equal(typeof guidePage.lead, "string");
    assert.equal(guidePage.lead.length > 30, true);
    assert.doesNotMatch(guidePage.lead, /manifest|配音稿|逐页时长表|制作清单/u);
    assert.equal(Array.isArray(reportPage.sections), true);
    assert.equal(reportPage.sections.length >= 2, true);
  }
});
