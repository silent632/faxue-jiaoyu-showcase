import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCoursePackagePeriodBySlug } from "../../lib/course-package.js";

test("course package exposes four material groups and ten material pages for period 02", () => {
  const period02 = getCoursePackagePeriodBySlug("course-period-02");

  assert.ok(period02);
  assert.equal(period02.materialDirectory.length, 4);
  assert.equal(period02.materialPages.length, 10);
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
    const reportPage = period.materialPages.find((item) => item.slug === "study-report");

    assert.equal(typeof guidePage.lead, "string");
    assert.equal(guidePage.lead.length > 30, true);
    assert.doesNotMatch(guidePage.lead, /manifest|配音稿|逐页时长表|制作清单/u);
    assert.equal(Array.isArray(reportPage.sections), true);
    assert.equal(reportPage.sections.length >= 2, true);
  }
});

test("feedback and report pages avoid proof-style wrappers and synthetic section headings", () => {
  const period06 = getCoursePackagePeriodBySlug("course-period-06");
  const feedbackPage = period06.materialPages.find((item) => item.slug === "feedback");
  const reportPage = period06.materialPages.find((item) => item.slug === "study-report");

  assert.equal("purpose" in feedbackPage, false);
  assert.doesNotMatch(feedbackPage.lead, /证明|课后反馈页整理/u);
  assert.equal(feedbackPage.sections.some((section) => /^反馈焦点\d+$/u.test(section.title || "")), false);
  assert.equal(reportPage.sections.some((section) => /^研习报告视角\d+$/u.test(section.title || "")), false);
});

test("material article source uses article-first rendering without stacked summary wrappers", () => {
  const source = readFileSync(new URL("../../components/course-material-article.js", import.meta.url), "utf8");

  assert.doesNotMatch(source, /page\.purpose/u);
  assert.doesNotMatch(source, /ShowcaseSection/u);
  assert.match(source, /course-material-article-body/u);
});

test("course period shell source exposes a split material layout for active material pages", () => {
  const source = readFileSync(new URL("../../components/course-period-shell.js", import.meta.url), "utf8");

  assert.match(source, /course-material-shell/u);
  assert.match(source, /course-material-shell-aside/u);
  assert.match(source, /course-material-shell-main/u);
});
