import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildShowcaseContent } from "../../lib/showcase-content.js";

function assertVideoPeriodDeliveryShape(item) {
  assert.ok(["segments", "video"].includes(item.playerMode));
  assert.equal(Array.isArray(item.segments), true);

  if (item.playerMode === "segments") {
    assert.equal(item.segments.length > 0, true);
    assert.equal(item.sourceHref, null);
    return;
  }

  assert.equal(item.segments.length, 0);
  assert.match(item.sourceHref, /vod-qcloud\.com|^https?:\/\//u);
}

test("homepage content exposes distinct platform metrics", () => {
  const content = buildShowcaseContent();

  assert.equal(content.site.title, "裁判文书研习平台");
  assert.ok(content.metrics);

  const entries = Object.values(content.metrics);
  assert.equal(entries.length >= 4, true);

  // 每个指标标签与数值组合都应当唯一（不允许两个并排的重复数值+标签）
  const labels = entries.map((item) => item.label);
  assert.equal(new Set(labels).size, labels.length);

  assert.ok(content.metrics.caseCount);
  assert.ok(content.metrics.coursePeriods);
  assert.ok(content.metrics.totalVideoPlays);
});

test("homepage page layout keeps the hero board and start grid structure", () => {
  const source = readFileSync(new URL("../../app/page.js", import.meta.url), "utf8");

  assert.match(source, /homepage-console-main/u);
  assert.match(source, /homepage-console-kpis/u);
  assert.match(source, /homepage-results-grid/u);
  assert.match(source, /homepage-video-block/u);
  assert.match(source, /homepage-video-stage-grid/u);
  assert.match(source, /homepage-start-grid/u);
  assert.match(source, /homepage-quick-links/u);
  assert.match(source, /homepage-featured-cases/u);
  assert.match(source, /HomeContinueCard/u);
  assert.match(source, /精选案例/u);
  // 旧的运营台结构不应回归
  assert.equal(source.includes("homepage-review-console"), false);
  assert.equal(source.includes("homepage-audit-entry-grid"), false);
});

test("homepage styles cover hero board, pillars and start grid", () => {
  const source = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.homepage-console-main/u);
  assert.match(source, /\.homepage-console-kpis/u);
  assert.match(source, /\.homepage-video-block/u);
  assert.match(source, /\.homepage-video-stage-grid/u);
  assert.match(source, /\.homepage-start-grid/u);
  assert.match(source, /\.homepage-featured-case/u);
  assert.match(source, /\.home-continue-card/u);
});

test("homepage copy avoids backstage or explanatory design language", () => {
  const text = JSON.stringify(buildShowcaseContent());

  assert.equal(/真实模块预览/u.test(text), false);
  assert.equal(/展示站/u.test(text), false);
  assert.equal(/直接接上真实平台链路/u.test(text), false);
  assert.equal(/公开展示模式/u.test(text), false);
  assert.equal(/首屏首先呈现|平台首页说明|围绕案例研习组织平台首屏/u.test(text), false);
});

test("homepage content exposes an eight-period video preview block", () => {
  const content = buildShowcaseContent();

  assert.ok(content.homeVideoBlock);
  assert.equal(content.homeVideoBlock.periods.length, 8);
  assert.equal(content.homeVideoBlock.phaseGuide.length, 2);
  assert.equal(content.homeVideoBlock.periods[0].slug, "course-period-01");
  assert.equal(content.homeVideoBlock.periods[7].slug, "course-period-08");
});

test("homepage video copy stays visitor-facing and avoids internal wording", () => {
  const text = JSON.stringify(buildShowcaseContent().homeVideoBlock);

  assert.match(text, /第八期 生成式AI的作品认定与责任边界/u);
  assert.match(text, /第三期 多元纠纷解决机制与商事仲裁实务/u);
  assert.equal(/演示|执行|任务|评审/u.test(text), false);
});

test("homepage video preview routes all eight periods to site-local player pages", () => {
  const items = buildShowcaseContent().homeVideoBlock.periods;

  assert.equal(items.length, 8);
  assert.ok(items.every((item) => /^\/resources\/videos\/course-period-/u.test(item.href)));
  items.forEach(assertVideoPeriodDeliveryShape);
});
