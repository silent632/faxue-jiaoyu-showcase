import test from "node:test";
import assert from "node:assert/strict";

import { buildShowcaseContent } from "../../lib/showcase-content.js";
import { isShowcaseNavItemActive } from "../../lib/showcase-nav-match.js";

test("showcase nav matcher treats case and study routes as section-aware", () => {
  assert.equal(isShowcaseNavItemActive("/cases", { matchKind: "cases" }), true);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001", { matchKind: "cases" }), true);
  // 研习工作台归属案例研习板块
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", { matchKind: "cases" }), true);
  // 视频播放页归属课程认知板块
  assert.equal(isShowcaseNavItemActive("/resources/videos/course-period-01", { matchPrefix: "/courses" }), true);
  assert.equal(isShowcaseNavItemActive("/experiments/exp-reasoning", { matchPrefix: "/experiments" }), true);
  assert.equal(isShowcaseNavItemActive("/impact", { matchPrefix: "/cases" }), false);
});

test("showcase nav matcher keeps five-section boundaries with content nav items", () => {
  const navItems = buildShowcaseContent().nav;
  const casesItem = navItems.find((item) => item.matchKind === "cases");
  const coursesItem = navItems.find((item) => item.matchPrefix === "/courses");
  const homeItem = navItems.find((item) => item.href === "/");

  assert.equal(navItems.length, 4);
  assert.equal(casesItem?.label, "案例研习");
  assert.equal(coursesItem?.label, "课程认知");

  assert.equal(isShowcaseNavItemActive("/cases/case-0001", casesItem), true);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", casesItem), true);
  assert.equal(isShowcaseNavItemActive("/courses/course-period-01", coursesItem), true);
  assert.equal(isShowcaseNavItemActive("/cases", homeItem), false);
  assert.equal(isShowcaseNavItemActive("/", homeItem), true);
});
