import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getShowcaseCanonicalStudyHref } from "../../lib/showcase-cases.js";
import { buildShowcaseContent, buildShowcaseNavItems } from "../../lib/showcase-content.js";
import { isShowcaseNavItemActive } from "../../lib/showcase-nav-match.js";

test("shared nav builder aligns content nav and route matching semantics", () => {
  const navItems = buildShowcaseNavItems();
  const content = buildShowcaseContent();
  const studyHref = getShowcaseCanonicalStudyHref();

  assert.deepEqual(content.nav, navItems);
  assert.deepEqual(navItems.map((item) => item.href), ["/", "/cases", studyHref, "/impact", "/resources", "/courses"]);
  assert.deepEqual(navItems.map((item) => item.label), ["首页", "案例检索", "研习工作台", "成效展示", "课程视频", "课程体系"]);

  const casesItem = navItems.find((item) => item.matchKind === "cases");
  const studyItem = navItems.find((item) => item.matchKind === "study");
  assert.equal(isShowcaseNavItemActive("/cases/case-0001", casesItem), true);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", casesItem), false);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", studyItem), true);
});

test("top nav fallback uses shared nav builder instead of local duplicated nav literals", () => {
  const source = readFileSync(new URL("../../components/top-nav.js", import.meta.url), "utf8");

  assert.equal(source.includes("buildShowcaseNavItems"), true);
  assert.equal(source.includes("getShowcaseCanonicalStudyHref"), false);
  assert.equal(source.includes('label: "案例检索"'), false);
  assert.equal(source.includes('label: "课程视频"'), false);
});

test("impact page uses trend-first dashboard sections in the required priority order", () => {
  const source = readFileSync(new URL("../../app/impact/page.js", import.meta.url), "utf8");
  const trendIndex = source.indexOf("impact-trend-section");
  const coverageIndex = source.indexOf("impact-coverage-section");
  const activityIndex = source.indexOf("impact-activity-section");
  const videoIndex = source.indexOf("impact-video-support");

  assert.match(source, /impact-trend-section/u);
  assert.match(source, /impact-coverage-section/u);
  assert.match(source, /impact-activity-section/u);
  assert.match(source, /impact-video-support/u);
  assert.match(source, /content\.impactDashboard/u);
  assert.match(source, /content\.videoHub/u);
  assert.equal(source.includes("content.impact.sections.map"), false);
  assert.equal(/content\.impact\??\.sections/u.test(source), false);
  assert.equal(/content\.impact(?!Dashboard)/u.test(source), false);
  assert.equal(source.includes("buildImpactSectionMeta"), false);
  assert.equal(source.includes("buildImpactSummary"), false);
  assert.equal(source.includes("教学建设成效"), false);
  assert.equal(source.includes("学生发展成效"), false);
  assert.equal(source.includes("推广示范成效"), false);
  assert.equal(trendIndex > -1, true);
  assert.equal(coverageIndex > trendIndex, true);
  assert.equal(activityIndex > coverageIndex, true);
  assert.equal(videoIndex > activityIndex, true);
});

test("showcase nav fallback uses shared nav builder to keep task-1 semantics", () => {
  const source = readFileSync(new URL("../../components/showcase-nav.js", import.meta.url), "utf8");

  assert.equal(source.includes("buildShowcaseNavItems"), true);
  assert.equal(source.includes("items ?? buildShowcaseNavItems()"), true);
  assert.equal(source.includes("isShowcaseNavItemActive"), true);
  assert.equal(source.includes("aria-label=\"主导航\""), true);
});
