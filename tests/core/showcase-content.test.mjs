import test from "node:test";
import assert from "node:assert/strict";

import { buildShowcaseContent } from "../../lib/showcase-content.js";

test("showcase content exposes approved title, nav, metrics, and page sections", () => {
  const content = buildShowcaseContent();

  assert.equal(content.site.title, "裁判文书研习平台");
  assert.equal(content.metrics.caseCount, "210+");
  assert.equal(content.metrics.coursePeriods, "8期");
  assert.equal(content.metrics.registeredUsers, "800+");
  assert.equal(content.metrics.totalVisits, "2万+");
  assert.deepEqual(content.nav.map((item) => item.href), [
    "/",
    "/courses",
    "/resources",
    "/cases",
    "/cases/demo/study",
    "/impact",
  ]);
  assert.equal(content.courses.timeline.length, 8);
  assert.ok(content.resources.categories.length >= 6);
  assert.equal(content.impact.sections.length, 4);
});
