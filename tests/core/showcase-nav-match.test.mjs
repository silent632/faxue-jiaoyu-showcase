import test from "node:test";
import assert from "node:assert/strict";

import { isShowcaseNavItemActive } from "../../lib/showcase-nav-match.js";

test("showcase nav matcher treats case and study routes as section-aware", () => {
  assert.equal(isShowcaseNavItemActive("/cases", { matchKind: "cases" }), true);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001", { matchKind: "cases" }), true);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", { matchKind: "cases" }), false);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", { matchKind: "study" }), true);
  assert.equal(isShowcaseNavItemActive("/cases/case-0002/study", { matchKind: "study" }), true);
});
