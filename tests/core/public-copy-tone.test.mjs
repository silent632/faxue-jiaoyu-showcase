import test from "node:test";
import assert from "node:assert/strict";

import { buildShowcaseContent } from "../../lib/showcase-content.js";

const FORBIDDEN_PATTERNS = [
  /本页用于/u,
  /这里保留/u,
  /展示站/u,
  /公开展示模式/u,
  /页面保留/u,
  /不再停留在/u,
  /真实模块预览/u,
  /真实平台链路/u,
  /公开化展示/u,
  /设计者/u,
];

test("showcase content avoids task-execution and backstage language", () => {
  const content = buildShowcaseContent();
  const text = JSON.stringify(content);

  for (const pattern of FORBIDDEN_PATTERNS) {
    assert.equal(pattern.test(text), false, `found forbidden pattern: ${pattern}`);
  }
});

test("showcase content reads like an operations-results homepage", () => {
  const content = buildShowcaseContent();

  assert.equal(content.site.title, "裁判文书研习平台");
  assert.match(content.site.subtitle, /法理学教学改革/u);
  assert.ok(content.homeEntries.length >= 3);
  assert.ok(content.platformHighlights.length >= 3);
  assert.ok(content.homeDashboard);
  assert.match(content.homeDashboard.hero.title, /成效|成果/u);
  assert.match(content.homeDashboard.hero.summary, /已形成/u);
  assert.match(content.homeDashboard.hero.summary, /推广影响/u);
  assert.equal(Array.isArray(content.homeDashboard.kpis), true);
  assert.equal(content.homeDashboard.kpis.length >= 4, true);
  assert.equal(Array.isArray(content.homeDashboard.trendSnapshot.points), true);
  assert.equal(content.homeDashboard.trendSnapshot.points.length >= 3, true);
});
