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

test("homepage dashboard content keeps operations metrics and trend snapshot", () => {
  const content = buildShowcaseContent();
  const text = JSON.stringify(content.homeDashboard);

  assert.equal(content.site.title, "裁判文书研习平台");
  assert.ok(content.homeDashboard);
  assert.match(content.homeDashboard.hero.title, /平台|首页/u);
  assert.match(content.homeDashboard.hero.summary, /案例检索|课程视频|成效展示/u);
  assert.ok(Array.isArray(content.homeDashboard.kpis));
  const highlightKpis = content.homeDashboard.kpiHighlights ?? content.homeDashboard.kpis;
  assert.ok(Array.isArray(highlightKpis));
  assert.equal(highlightKpis.length, 5);
  assert.ok(
    highlightKpis.some((item) => item.label === "累计访问量" && item.value === "5万+")
  );
  assert.ok(Array.isArray(content.homeDashboard.trendSnapshot.points));
  assert.equal(content.homeDashboard.trendSnapshot.points.length >= 3, true);
  assert.ok(Array.isArray(content.homeResultTracks));
  assert.equal(content.homeResultTracks.length, 3);
  assert.ok(content.homeEntries.some((item) => item.label === "案例检索库"));
  assert.ok(content.homeEntries.some((item) => item.label === "研习工作台"));
  const courseOverview = content.homeOverview?.find((item) => item.href === "/courses");
  assert.ok(courseOverview);
  assert.match(courseOverview.description, /课程主题|视频|资料|内容/u);
  assert.equal(/档案/u.test(courseOverview.description), false);
  assert.equal(/看板/u.test(text), false);
});

test("homepage page layout is operations-first with required structure classes", () => {
  const source = readFileSync(new URL("../../app/page.js", import.meta.url), "utf8");

  assert.match(source, /homepage-review-console/u);
  assert.match(source, /homepage-validation-rail/u);
  assert.match(source, /homepage-results-grid/u);
  assert.match(source, /homepage-video-block/u);
  assert.match(source, /homepage-video-stage-grid/u);
  assert.match(source, /homepage-video-period-grid/u);
  assert.match(source, /homepage-audit-entry-grid/u);
  assert.equal(source.includes("homepage-review-ledger"), false);
  assert.equal(source.includes("homepage-evidence-ledger"), false);
});

test("homepage content keeps platform entry links after the operations overview", () => {
  const content = buildShowcaseContent();

  assert.ok(Array.isArray(content.homeEntries));
  assert.equal(content.homeEntries.length >= 3, true);
  assert.ok(content.homeEntries.some((item) => item.label === "案例检索库"));
  assert.ok(content.homeEntries.some((item) => item.label === "研习工作台"));
  assert.ok(content.impactDashboard);
  assert.ok(Array.isArray(content.impactDashboard.coverageCards));
  assert.equal(content.impactDashboard.coverageCards.length >= 2, true);
});

test("homepage operations styles include review-console and video layout classes", () => {
  const source = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.homepage-review-console/u);
  assert.match(source, /\.homepage-validation-rail/u);
  assert.match(source, /\.homepage-evidence-ledger/u);
  assert.match(source, /\.homepage-review-ledger/u);
  assert.match(source, /\.homepage-video-block/u);
  assert.match(source, /\.homepage-video-stage-grid/u);
  assert.match(source, /\.homepage-video-period-grid/u);
  assert.match(source, /\.homepage-audit-entry-grid/u);
  assert.match(source, /\.homepage-console-ledger/u);
  assert.match(source, /\.homepage-console-inline-evidence/u);
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

test("homepage video block styles support stage and period grids", () => {
  const source = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.homepage-video-block/u);
  assert.match(source, /\.homepage-video-stage-grid/u);
  assert.match(source, /\.homepage-video-period-grid/u);
  assert.match(source, /\.homepage-video-period-card/u);
});
