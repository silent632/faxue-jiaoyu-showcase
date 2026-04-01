import test from "node:test";
import assert from "node:assert/strict";

import { buildShowcaseContent } from "../../lib/showcase-content.js";

test("showcase content exposes approved title, nav, metrics, and page sections", () => {
  const content = buildShowcaseContent();

  assert.equal(content.site.title, "裁判文书研习平台");
  assert.equal(content.metrics.caseCount.label, "典型案例");
  assert.equal(content.metrics.caseCount.value, "210+");
  assert.equal(content.metrics.caseCount.raw, 210);
  assert.equal(content.metrics.coursePeriods.label, "课程期数");
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
    "/cases#study-demo",
    "/impact",
  ]);
  assert.equal(content.courses.timeline.length, 8);
  assert.ok(content.resources.categories.length >= 6);
  assert.equal(content.impact.sections.length, 4);
});
