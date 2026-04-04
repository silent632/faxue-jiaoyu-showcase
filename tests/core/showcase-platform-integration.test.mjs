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
