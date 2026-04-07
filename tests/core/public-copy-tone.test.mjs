import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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

test("resources and courses pages keep stable role markers with support-oriented tone", () => {
  const resourcesSource = readFileSync(new URL("../../app/resources/page.js", import.meta.url), "utf8");
  const coursesSource = readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8");

  assert.match(resourcesSource, /data-page-role="video-hub"/u);
  assert.match(resourcesSource, /hub=\{content\.videoHub\}/u);
  assert.match(resourcesSource, /示范性教学视频/u);
  assert.equal(/教学资源配置/u.test(resourcesSource), false);
  assert.equal(/content\.resources\.groups/u.test(resourcesSource), false);

  assert.match(coursesSource, /data-page-role="courses-support"/u);
  assert.match(coursesSource, /双师课程体系/u);
  assert.match(coursesSource, /支持平台应用成果/u);
  assert.match(coursesSource, /教学组织/u);
  assert.equal(/课程编排以“进入案例、展开讨论、形成表达”/u.test(coursesSource), false);
});

test("cases page reads like a working retrieval desk instead of a generic entry splash", () => {
  const source = readFileSync(new URL("../../app/cases/page.js", import.meta.url), "utf8");

  assert.match(source, /cases-route-briefing/u);
  assert.match(source, /cases-route-review-grid/u);
  assert.match(source, /审阅提示|检索简报|使用建议/u);
  assert.equal(/平台案例检索入口/u.test(source), false);
  assert.equal(/先检索，再导读，再进入研习/u.test(source), false);
});
