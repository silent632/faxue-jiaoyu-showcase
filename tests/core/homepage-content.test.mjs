import test from "node:test";
import assert from "node:assert/strict";

import { buildShowcaseContent } from "../../lib/showcase-content.js";

test("homepage content includes real module preview structure", () => {
  const content = buildShowcaseContent();

  assert.equal(content.site.title, "裁判文书研习平台");
  assert.ok(content.homePreview);
  assert.ok(Array.isArray(content.homePreview.featuredCases));
  assert.ok(Array.isArray(content.homePreview.studyHighlights));
  assert.ok(content.homePreview.featuredCases.length >= 3);
  assert.ok(content.homePreview.studyHighlights.length >= 3);
  assert.ok(content.homeEntries.some((item) => item.label === "案例检索库"));
  assert.ok(content.homeEntries.some((item) => item.label === "研习工作台"));
});

test("homepage content exposes a real browse flow summary", () => {
  const content = buildShowcaseContent();

  assert.ok(Array.isArray(content.homeFlow));
  assert.equal(content.homeFlow.length, 3);
  assert.match(content.homeFlow[0].title, /检索/u);
  assert.match(content.homeFlow[1].title, /详情|导读/u);
  assert.match(content.homeFlow[2].title, /研习/u);
});
