import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildShowcaseContent } from "../../lib/showcase-content.js";

test("homepage content keeps public module structure without backstage wording", () => {
  const content = buildShowcaseContent();
  const text = JSON.stringify({
    site: content.site,
    hero: content.homeHero,
    flow: content.homeFlow,
    highlights: content.platformHighlights,
    preview: content.homePreview,
  });

  assert.equal(content.site.title, "裁判文书研习平台");
  assert.ok(content.homeHero);
  assert.equal(content.homeHero.kicker, "平台首页");
  assert.ok(Array.isArray(content.homeHero.primaryModules));
  assert.equal(content.homeHero.primaryModules.length, 3);
  assert.equal(content.homeHero.primaryModules[0].label, "案例检索库");
  assert.equal(content.homeHero.primaryModules[1].label, "研习工作台");
  assert.equal(content.homeHero.primaryModules[2].label, "课程体系");
  assert.match(content.homeHero.primaryModules[0].description, /检索/u);
  assert.match(content.homeHero.primaryModules[1].description, /研习/u);
  assert.ok(content.homeHero.metricsIntro);
  assert.ok(Array.isArray(content.homeHero.supportingFacts));
  assert.equal(content.homeHero.supportingFacts.length, 3);
  assert.ok(content.homePreview);
  assert.ok(Array.isArray(content.homePreview.featuredCases));
  assert.ok(Array.isArray(content.homePreview.studyHighlights));
  assert.ok(content.homePreview.featuredCases.length >= 3);
  assert.ok(content.homePreview.studyHighlights.length >= 3);
  assert.ok(content.homeEntries.some((item) => item.label === "案例检索库"));
  assert.ok(content.homeEntries.some((item) => item.label === "研习工作台"));
  assert.ok(Array.isArray(content.homeCasePreview));
  assert.equal(content.homeCasePreview.length >= 3, true);
  assert.ok(Array.isArray(content.homeOverview));
  assert.equal(content.homeOverview.length, 2);
  assert.ok(content.homeImpactClosing);
  assert.equal(/真实模块预览/u.test(text), false);
  assert.equal(/展示站/u.test(text), false);
  assert.equal(/直接接上真实平台链路/u.test(text), false);
  assert.equal(/公开展示模式下/u.test(text), false);
});

test("homepage content exposes a concise public browse flow", () => {
  const content = buildShowcaseContent();

  assert.ok(Array.isArray(content.homeFlow));
  assert.equal(content.homeFlow.length, 3);
  assert.equal(content.homeFlow.every((item) => item.description.length <= 30), true);
  assert.match(content.homeFlow[0].title, /检索/u);
  assert.match(content.homeFlow[1].title, /详情|导读/u);
  assert.match(content.homeFlow[2].title, /研习/u);
  assert.equal(/首页/u.test(content.homeFlow[0].description), false);
});

test("homepage hero exposes left narrative and right module hall", () => {
  const source = readFileSync(new URL("../../components/showcase-home-hero.js", import.meta.url), "utf8");

  assert.match(source, /showcase-home-hall/u);
  assert.match(source, /showcase-home-hall-main/u);
  assert.match(source, /showcase-home-hall-aside/u);
  assert.equal(source.includes("核心入口一"), false);
});

test("homepage uses homepage-specific sections instead of repeating generic cards", () => {
  const source = readFileSync(new URL("../../app/page.js", import.meta.url), "utf8");

  assert.match(source, /homepage-path-band/u);
  assert.match(source, /homepage-case-preview/u);
  assert.match(source, /homepage-overview-grid/u);
  assert.match(source, /homepage-impact-closing/u);
});

test("homepage copy avoids backstage or explanatory design language", () => {
  const text = [
    readFileSync(new URL("../../app/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/showcase-home-hero.js", import.meta.url), "utf8"),
  ].join("\n");

  assert.equal(/首屏首先呈现|平台首页说明|围绕案例研习组织平台首屏/u.test(text), false);
});
