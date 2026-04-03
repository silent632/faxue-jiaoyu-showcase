import test from "node:test";
import assert from "node:assert/strict";

import { getShowcaseCanonicalStudyHref } from "../../lib/showcase-cases.js";
import { buildShowcaseContent } from "../../lib/showcase-content.js";

test("showcase content exposes approved title, nav, metrics, and page sections", () => {
  const content = buildShowcaseContent();
  const canonicalStudyHref = getShowcaseCanonicalStudyHref();
  const canonicalDetailHref = canonicalStudyHref.replace(/\/study\/?$/u, "");

  assert.equal(content.site.title, "裁判文书研习平台");
  assert.equal(content.metrics.caseCount.label, "典型案例");
  assert.equal(content.metrics.caseCount.value, "210+");
  assert.equal(content.metrics.caseCount.raw, 210);
  assert.equal(content.metrics.coursePeriods.label, "双师课程");
  assert.equal(content.metrics.coursePeriods.value, "8期");
  assert.equal(content.metrics.coursePeriods.raw, 8);
  assert.equal(content.metrics.registeredUsers.label, "注册用户");
  assert.equal(content.metrics.registeredUsers.value, "800+");
  assert.equal(content.metrics.registeredUsers.raw, 800);
  assert.equal(content.metrics.totalVisits.label, "累计访问");
  assert.equal(content.metrics.totalVisits.value, "2万+");
  assert.equal(content.metrics.totalVisits.raw, 20000);
  assert.deepEqual(content.nav.map((item) => item.href), [
    "/",
    "/courses",
    "/resources",
    "/cases",
    getShowcaseCanonicalStudyHref(),
    "/impact",
  ]);
  assert.deepEqual(content.nav.map((item) => item.matchKind || item.matchPrefix), [
    "/",
    "/courses",
    "/resources",
    "cases",
    "study",
    "/impact",
  ]);
  assert.deepEqual(content.homeEntries.map((item) => item.href), ["/cases", canonicalDetailHref, canonicalStudyHref]);
  assert.equal(content.homeFlow.length, 3);
  assert.ok(content.homePreview);
  assert.equal(content.homePreview.featuredCases.length, 3);
  assert.equal(content.homePreview.studyHighlights.length, 3);
  assert.equal(content.platformHighlights.length, 3);
  assert.equal(content.courses.timeline.length, 8);
  assert.deepEqual(content.courses.timeline.map((item) => item.period), [
    "第一期",
    "第二期",
    "第三期",
    "第四期",
    "第五期",
    "第六期",
    "第七期",
    "第八期",
  ]);
  assert.equal(content.resources.groups.length, 2);
  assert.deepEqual(content.resources.groups.map((group) => group.title), [
    "教学资源与资源体系",
    "标准材料与标准化支撑",
  ]);
  assert.equal(content.resources.groups[0].items.length, 4);
  assert.equal(content.resources.groups[1].items.length, 5);
  assert.equal(content.impact.sections.length, 4);
  assert.deepEqual(content.impact.sections.map((item) => item.title), [
    "教学建设成效",
    "学生发展成效",
    "平台运行成效",
    "推广示范成效",
  ]);
  assert.equal(content.impact.sections[0].points.length, 3);
});

test("showcase content avoids label-board wording in content pages", () => {
  const content = buildShowcaseContent();
  const text = JSON.stringify({
    courses: content.courses,
    resources: content.resources,
    impact: content.impact,
  });

  assert.equal(/资源单元/u.test(text), false);
  assert.equal(/价值维度/u.test(text), false);
  assert.equal(/补充说明/u.test(text), false);
});
