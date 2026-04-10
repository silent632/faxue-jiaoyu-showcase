import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildShowcaseContent } from "../../lib/showcase-content.js";

test("homepage dashboard content keeps operations metrics and trend snapshot", () => {
  const content = buildShowcaseContent();
  const text = JSON.stringify(content.homeDashboard);

  assert.equal(content.site.title, "裁判文书研习平台");
  assert.ok(content.homeDashboard);
  assert.equal(content.homeDashboard.hero.title, "平台成效与应用成果看板");
  assert.match(content.homeDashboard.hero.summary, /应用成果与推广影响/u);
  assert.ok(Array.isArray(content.homeDashboard.kpis));
  assert.equal(content.homeDashboard.kpis.length >= 5, true);
  assert.ok(Array.isArray(content.homeDashboard.trendSnapshot.points));
  assert.equal(content.homeDashboard.trendSnapshot.points.length >= 3, true);
  assert.ok(content.homeEntries.some((item) => item.label === "案例检索库"));
  assert.ok(content.homeEntries.some((item) => item.label === "研习工作台"));
  assert.equal(/推广影响/u.test(text), true);
  assert.equal(/看板/u.test(text), true);
});

test("homepage page layout is operations-first with required structure classes", () => {
  const source = readFileSync(new URL("../../app/page.js", import.meta.url), "utf8");

  assert.match(source, /homepage-review-console/u);
  assert.match(source, /homepage-validation-rail/u);
  assert.match(source, /homepage-evidence-ledger/u);
  assert.match(source, /homepage-review-ledger/u);
  assert.match(source, /homepage-video-block/u);
  assert.match(source, /homepage-video-featured/u);
  assert.match(source, /homepage-video-grid/u);
  assert.match(source, /homepage-video-subgroup/u);
  assert.match(source, /homepage-audit-entry-grid/u);
  assert.match(source, /homepage-console-ledger/u);
  assert.match(source, /homepage-console-inline-evidence/u);
  assert.equal(source.includes("homepage-review-strip"), false);
  assert.equal(source.includes("homepage-platform-entry-grid"), false);
  assert.equal(source.includes("homepage-evidence-grid"), false);
  assert.equal(source.includes("homepage-console-note"), false);
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
  assert.match(source, /\.homepage-video-featured/u);
  assert.match(source, /\.homepage-video-grid/u);
  assert.match(source, /\.homepage-video-subgroup/u);
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

test("homepage content exposes a featured video and supporting video list", () => {
  const content = buildShowcaseContent();

  assert.ok(content.homeVideoBlock);
  assert.equal(content.homeVideoBlock.featured.slug, "course-period-08");
  assert.equal(content.homeVideoBlock.featured.label, "主视频");
  assert.equal(content.homeVideoBlock.supporting.length, 5);
  assert.equal(content.homeVideoBlock.supporting[0].slug, "course-period-07");
  assert.equal(content.homeVideoBlock.supporting[4].slug, "course-period-03");
});

test("homepage video copy stays visitor-facing and avoids internal wording", () => {
  const text = JSON.stringify(buildShowcaseContent().homeVideoBlock);

  assert.match(text, /第八期 生成式AI的作品认定与责任边界/u);
  assert.match(text, /第三期 多元纠纷解决机制与商事仲裁实务/u);
  assert.equal(/演示|执行|任务|评审/u.test(text), false);
});

test("homepage period videos can point at direct Tencent VOD mp4 links", () => {
  const { featured, supporting } = buildShowcaseContent().homeVideoBlock;
  const items = [featured, ...supporting];

  assert.equal(items.length, 6);

  for (const item of items) {
    assert.match(item.href, /vod-qcloud\.com/u);
    assert.match(item.href, /\.mp4$/u);
    assert.equal(/58u\.cn/u.test(item.href), false);
  }
});

test("homepage content can expose segmented early-period videos separately", () => {
  const segmented = buildShowcaseContent().homeVideoBlock.segmented;
  const text = JSON.stringify(segmented);

  assert.ok(segmented);
  assert.equal(segmented.items.length, 7);
  assert.equal(segmented.items[0].slug, "course-period-01-part-1");
  assert.equal(segmented.items[6].slug, "course-period-02-part-2");
  assert.match(text, /llm2x7\.58u\.cn/u);
});

test("homepage video block styles support featured and supporting card layouts", () => {
  const source = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.homepage-video-block/u);
  assert.match(source, /\.homepage-video-featured/u);
  assert.match(source, /\.homepage-video-grid/u);
  assert.match(source, /\.homepage-video-subgroup/u);
  assert.match(source, /\.homepage-video-cover/u);
});
