import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildShowcaseContent, buildShowcaseNavItems } from "../../lib/showcase-content.js";
import { isShowcaseNavItemActive } from "../../lib/showcase-nav-match.js";

test("shared nav builder aligns content nav and route matching semantics", () => {
  const navItems = buildShowcaseNavItems();
  const content = buildShowcaseContent();

  assert.deepEqual(content.nav, navItems);
  assert.deepEqual(navItems.map((item) => item.href), ["/", "/courses", "/cases", "/experiments"]);
  assert.deepEqual(navItems.map((item) => item.label), ["首页", "课程认知", "案例研习", "仿真实验"]);

  const casesItem = navItems.find((item) => item.matchKind === "cases");
  assert.equal(isShowcaseNavItemActive("/cases/case-0001", casesItem), true);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", casesItem), true);
});

test("top nav fallback uses shared showcase nav content instead of local duplicated nav literals", () => {
  const topNavSource = readFileSync(new URL("../../components/top-nav.js", import.meta.url), "utf8");
  const showcaseNavSource = readFileSync(new URL("../../components/showcase-nav.js", import.meta.url), "utf8");

  // TopNav 只消费 items，不自带导航字面量
  assert.equal(topNavSource.includes('label: "案例研习"'), false);
  assert.equal(topNavSource.includes('label: "课程认知"'), false);
  assert.equal(showcaseNavSource.includes("buildShowcaseNavItems"), true);
});

test("showcase content stays client-safe by avoiding direct case-source imports", () => {
  const source = readFileSync(new URL("../../lib/showcase-content.js", import.meta.url), "utf8");

  assert.equal(source.includes("./showcase-cases.js"), false);
});

test("homepage includes impact proof section and nav", () => {
  const source = readFileSync(new URL("../../app/page.js", import.meta.url), "utf8");

  assert.match(source, /impact-proof/u);
  assert.match(source, /ShowcaseNav/u);
  assert.match(source, /content\.impact/u);
});

test("showcase nav fallback uses shared nav builder to keep task-1 semantics", () => {
  const source = readFileSync(new URL("../../components/showcase-nav.js", import.meta.url), "utf8");

  assert.equal(source.includes("TopNav"), true);
  assert.equal(source.includes("buildShowcaseNavItems"), true);
  assert.equal(source.includes("showcase-nav-link"), false);
  assert.equal(source.includes("showcase-brand"), false);
});

test("case detail and study routes export the full case set instead of truncating to 24 items", () => {
  const detailSource = readFileSync(new URL("../../app/cases/[id]/page.js", import.meta.url), "utf8");
  const studySource = readFileSync(new URL("../../app/cases/[id]/study/page.js", import.meta.url), "utf8");

  assert.equal(detailSource.includes("getShowcaseCaseStaticParams(24)"), false);
  assert.equal(studySource.includes("getShowcaseCaseStaticParams(24)"), false);
  assert.equal(detailSource.includes("getShowcaseCaseStaticParams()"), true);
  assert.equal(studySource.includes("getShowcaseCaseStaticParams()"), true);
});

test("detail and study pages avoid incomplete public placeholders in core actions and headers", () => {
  const detailSource = readFileSync(new URL("../../app/cases/[id]/page.js", import.meta.url), "utf8");
  const studySource = readFileSync(new URL("../../app/cases/[id]/study/page.js", import.meta.url), "utf8");
  const resultsSource = readFileSync(new URL("../../components/cases-results-column.js", import.meta.url), "utf8");
  const actionsSource = readFileSync(new URL("../../components/study-workspace-actions.js", import.meta.url), "utf8");

  assert.equal(detailSource.includes("Word 原文待补充"), false);
  assert.equal(detailSource.includes("PDF 预览待补充"), false);
  assert.equal(detailSource.includes("案号待补充"), false);
  assert.equal(detailSource.includes("法院待补充"), false);
  assert.equal(detailSource.includes("日期待补充"), false);
  assert.equal(studySource.includes("案号待补充"), false);
  assert.equal(studySource.includes("法院待补充"), false);
  assert.equal(studySource.includes("日期待补充"), false);
  assert.equal(resultsSource.includes("案号待补充"), false);
  assert.equal(resultsSource.includes("法院待补充"), false);
  assert.equal(resultsSource.includes("日期待补充"), false);
  assert.equal(actionsSource.includes("提交研习"), false);
});

test("detail page opens public pdf files with plain anchors instead of next/link navigation", () => {
  const detailSource = readFileSync(new URL("../../app/cases/[id]/page.js", import.meta.url), "utf8");

  assert.match(detailSource, /<a className="btn btn-primary case-detail-secondary-action" href=\{`\/pdfs\/\$\{encodeURIComponent\(pdfFileName\)\}`\}/u);
  assert.equal(/<Link className="btn btn-primary case-detail-secondary-action" href=\{`\/pdfs\//u.test(detailSource), false);
});
