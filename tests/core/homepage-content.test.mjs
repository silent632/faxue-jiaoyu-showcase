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

  assert.match(source, /homepage-operations-kpis/u);
  assert.match(source, /homepage-trend-summary/u);
  assert.match(source, /homepage-coverage-band/u);
  assert.match(source, /homepage-platform-entry-grid/u);
  assert.equal(source.includes("homepage-path-band"), false);
  assert.equal(source.includes("homepage-case-preview"), false);
  assert.equal(source.includes("homepage-overview-grid"), false);
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

test("homepage operations styles include new operations-first layout classes", () => {
  const source = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.homepage-operations-kpis/u);
  assert.match(source, /\.homepage-trend-summary/u);
  assert.match(source, /\.homepage-coverage-band/u);
  assert.match(source, /\.homepage-platform-entry-grid/u);
});

test("homepage copy avoids backstage or explanatory design language", () => {
  const text = JSON.stringify(buildShowcaseContent());

  assert.equal(/真实模块预览/u.test(text), false);
  assert.equal(/展示站/u.test(text), false);
  assert.equal(/直接接上真实平台链路/u.test(text), false);
  assert.equal(/公开展示模式/u.test(text), false);
});
