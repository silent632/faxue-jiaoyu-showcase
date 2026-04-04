import test from "node:test";
import assert from "node:assert/strict";

import { buildShowcaseContent } from "../../lib/showcase-content.js";
import { isShowcaseNavItemActive } from "../../lib/showcase-nav-match.js";

test("showcase nav matcher treats case and study routes as section-aware", () => {
  assert.equal(isShowcaseNavItemActive("/cases", { matchKind: "cases" }), true);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001", { matchKind: "cases" }), true);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", { matchKind: "cases" }), false);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", { matchKind: "study" }), true);
  assert.equal(isShowcaseNavItemActive("/cases/case-0002/study", { matchKind: "study" }), true);
});

test("showcase nav matcher keeps case-detail and study-route boundaries with content nav items", () => {
  const navItems = buildShowcaseContent().nav;
  const casesItem = navItems.find((item) => item.matchKind === "cases");
  const studyItem = navItems.find((item) => item.matchKind === "study");

  assert.equal(casesItem?.label, "案例检索");
  assert.equal(studyItem?.label, "研习工作台");

  assert.equal(isShowcaseNavItemActive("/cases/case-0001", casesItem), true);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", casesItem), false);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", studyItem), true);
});
