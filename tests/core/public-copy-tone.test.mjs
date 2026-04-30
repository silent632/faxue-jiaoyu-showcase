import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import { loadCopyPolicy } from "../../lib/content/copy-policy.js";
import { buildShowcaseContent } from "../../lib/showcase-content.js";
import { getCoursePackagePeriods } from "../../lib/course-package.js";

const COPY_POLICY = loadCopyPolicy();
const escapeRegExp = (term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const FORBIDDEN_PATTERNS = COPY_POLICY.forbiddenPatterns.map((term) => new RegExp(escapeRegExp(term), "u"));
const FORBIDDEN_PUBLIC_REVIEW_PATTERNS = COPY_POLICY.forbiddenPublicReviewPatterns.map((term) => new RegExp(escapeRegExp(term), "u"));

test("showcase content avoids task-execution and backstage language", () => {
  const content = buildShowcaseContent();
  const text = JSON.stringify(content);

  for (const pattern of FORBIDDEN_PATTERNS) {
    assert.equal(pattern.test(text), false, `found forbidden pattern: ${pattern}`);
  }
});

test("showcase content reads like a concise public-facing homepage", () => {
  const content = buildShowcaseContent();

  assert.equal(content.site.title, "裁判文书研习平台");
  assert.match(content.site.subtitle, /法理学教学改革/u);
  assert.ok(content.homeEntries.length >= 3);
  assert.ok(content.platformHighlights.length >= 3);
  assert.ok(content.homeDashboard);
  assert.match(content.homeDashboard.hero.title, /平台|首页/u);
  assert.match(content.homeDashboard.hero.summary, /案例检索/u);
  assert.match(content.homeDashboard.hero.summary, /课程体系/u);
  assert.equal(/已形成|推广影响/u.test(content.homeDashboard.hero.summary), false);
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
  assert.match(resourcesSource, /课程视频成果|八期课程视频成果/u);
  assert.equal(/示范性教学视频/u.test(resourcesSource), false);
  assert.equal(/主视频|辅助视频/u.test(resourcesSource), false);
  assert.equal(/教学资源配置/u.test(resourcesSource), false);
  assert.equal(/content\.resources\.groups/u.test(resourcesSource), false);

  assert.match(coursesSource, /data-page-role="courses-support"/u);
  assert.match(coursesSource, /课程档案/u);
  assert.match(coursesSource, /archiveCard\.lead|course-guide-card/u);
  assert.match(coursesSource, /进入本期课程|查看本期视频/u);
  assert.equal(/课程编排以“进入案例、展开讨论、形成表达”/u.test(coursesSource), false);
  assert.equal(/本页|在这里可以|集中呈现/u.test(coursesSource), false);
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

  assert.equal(/注册用户/u.test(homeSource), false);
  assert.equal(/注册用户/u.test(impactSource), false);
  assert.equal(/主视频|辅助视频/u.test(homeSource), false);
  assert.equal(/主视频|辅助视频/u.test(impactSource), false);
  assert.equal(/本页集中呈现|本页按/u.test(homeSource), false);
  assert.equal(/本页集中呈现|本页按/u.test(impactSource), false);
  assert.equal(/首要轴线|结果线索|梳理/u.test(impactSource), false);
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
    readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8"),
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

test("public material-page copy avoids 便于-style explainer wording", () => {
  const text = JSON.stringify(
    getCoursePackagePeriods().flatMap((period) => period.materialPages)
  );

  assert.equal(/便于/u.test(text), false);
});

test("homepage and course pages avoid AI-tone, report-tone, and execution-tone wording", () => {
  const homepageSource = readFileSync(new URL("../../app/page.js", import.meta.url), "utf8");
  const coursesSource = readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8");
  const courseDetailSource = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");

  for (const source of [homepageSource, coursesSource, courseDetailSource]) {
    assert.equal(/本页|在这里可以|系统梳理|阶段性成果|多维呈现|对应查看/u.test(source), false);
  }
});

test("course system route copy avoids explainer wording after the split", () => {
  const dynamicRouteUrl = new URL("../../app/courses/[slug]/[materialSlug]/page.js", import.meta.url);
  const sources = [
    readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8"),
    existsSync(dynamicRouteUrl) ? readFileSync(dynamicRouteUrl, "utf8") : "",
  ];

  assert.equal(existsSync(dynamicRouteUrl), true);
  for (const source of sources) {
    assert.equal(/本页|在这里可以|继续进入|对应查看|系统梳理|页面说明/u.test(source), false);
  }
});

test("course system public copy avoids raw material-name placeholders", () => {
  const dynamicRouteUrl = new URL("../../app/courses/[slug]/[materialSlug]/page.js", import.meta.url);
  const text = [
    readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8"),
    existsSync(dynamicRouteUrl) ? readFileSync(dynamicRouteUrl, "utf8") : "",
  ].join("\n");

  assert.equal(existsSync(dynamicRouteUrl), true);
  assert.equal(/学生课后反馈（一）|学生课后反馈（二）|学生研习报告（二）|资料包制作清单/u.test(text), false);
});

test("public course-system source avoids production-process wording in visible flows", () => {
  const sources = [
    readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/course-period-shell.js", import.meta.url), "utf8"),
    JSON.stringify(getCoursePackagePeriods().map((period) => period.periodHome)),
    JSON.stringify(buildShowcaseContent().courses.periods),
  ].join("\n");

  for (const text of COPY_POLICY.forbiddenProductionPhrases) {
    assert.equal(sources.includes(text), false, `found production-process wording: ${text}`);
  }
  assert.equal(/配音稿|\.pptx/u.test(sources), false);
});

test("public-facing source copy avoids incomplete-state wording in expert-visible flows", () => {
  const sources = [
    readFileSync(new URL("../../app/cases/[id]/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/cases/[id]/study/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/cases-results-column.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/study-workspace-actions.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../lib/public-showcase-study.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../lib/study-workspace.js", import.meta.url), "utf8"),
  ].join("\n");

  for (const text of COPY_POLICY.forbiddenIncompleteStatePhrases) {
    assert.equal(sources.includes(text), false, `found incomplete public wording: ${text}`);
  }
});

test("public app ships an explicit favicon or app icon asset", () => {
  const appIconUrl = new URL("../../app/icon.svg", import.meta.url);
  const publicFaviconUrl = new URL("../../public/favicon.ico", import.meta.url);

  assert.equal(existsSync(appIconUrl) || existsSync(publicFaviconUrl), true);
});
