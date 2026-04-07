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

const FORBIDDEN_PUBLIC_REVIEW_PATTERNS = [
  /专家可/u,
  /服务专家/u,
  /本页聚焦专家/u,
  /建议核验/u,
  /继续核验/u,
  /便于继续核验/u,
  /进入下层页面前/u,
  /支持从总览继续进入/u,
  /供专家/u,
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
  assert.match(coursesSource, /阶段安排|课程主题/u);
  assert.match(coursesSource, /主题脉络|课程时间轴/u);
  assert.equal(/课程编排以“进入案例、展开讨论、形成表达”/u.test(coursesSource), false);
});

test("cases page reads like a working retrieval desk instead of a generic entry splash", () => {
  const source = readFileSync(new URL("../../app/cases/page.js", import.meta.url), "utf8");
  const heroSource = readFileSync(new URL("../../components/cases-search-hero.js", import.meta.url), "utf8");

  assert.match(source, /cases-audit-desk/u);
  assert.match(source, /cases-audit-metrics/u);
  assert.match(source, /案例检索与原文入口|检索起点/u);
  assert.match(heroSource, /检索入口|案例检索工作面/u);
  assert.match(heroSource, /<h2 className="section-title cases-hero-title">/u);
  assert.equal(/<h1 className="section-title cases-hero-title">/u.test(heroSource), false);
  assert.equal(/平台案例检索入口/u.test(source), false);
  assert.equal(/先检索，再导读，再进入研习/u.test(source), false);
  assert.equal(/页面重心回到/u.test(source), false);
  assert.equal(/宣传型入口说明/u.test(source), false);
});

test("homepage and impact pages avoid meta design commentary in review copy", () => {
  const homeSource = readFileSync(new URL("../../app/page.js", import.meta.url), "utf8");
  const impactSource = readFileSync(new URL("../../app/impact/page.js", import.meta.url), "utf8");

  for (const text of [
    "右侧保留最短核验轨道",
    "结果之外，还要交代专家应从哪里继续核验",
    "首页后段只保留最关键的进入路径",
    "不再分散展示",
    "作为专家需要时再展开",
    "不再抢占主叙事位置",
  ]) {
    assert.equal(homeSource.includes(text) || impactSource.includes(text), false, `found meta copy: ${text}`);
  }
});

test("public pages avoid exposed reviewer-facing guidance and analyst narration", () => {
  const sources = [
    readFileSync(new URL("../../app/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/impact/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/cases/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/cases-search-hero.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/cases-intelligence-panels.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/cases-results-column.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/pdf-viewer-inner.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/case-pdf-disclosure.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/study-workspace-overview.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/study-workspace-step-card.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/study-workspace-actions.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/resources/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../lib/public-showcase-study.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../lib/study-workspace.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../lib/case-presentation.mjs", import.meta.url), "utf8"),
  ].join("\n");

  for (const pattern of FORBIDDEN_PUBLIC_REVIEW_PATTERNS) {
    assert.equal(pattern.test(sources), false, `found exposed review guidance: ${pattern}`);
  }

  assert.equal(/适用于/u.test(sources), false);
  assert.equal(/便于/u.test(sources), false);
  assert.equal(/当前页面/u.test(sources), false);
});
