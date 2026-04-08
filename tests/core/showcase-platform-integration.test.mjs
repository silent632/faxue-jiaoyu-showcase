import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getShowcaseCanonicalStudyHref } from "../../lib/showcase-cases.js";
import { buildShowcaseContent, buildShowcaseNavItems } from "../../lib/showcase-content.js";
import { isShowcaseNavItemActive } from "../../lib/showcase-nav-match.js";

test("shared nav builder aligns content nav and route matching semantics", () => {
  const navItems = buildShowcaseNavItems();
  const content = buildShowcaseContent();
  const studyHref = getShowcaseCanonicalStudyHref();

  assert.deepEqual(content.nav, navItems);
  assert.deepEqual(navItems.map((item) => item.href), ["/", "/cases", studyHref, "/impact", "/resources", "/courses"]);
  assert.deepEqual(navItems.map((item) => item.label), ["首页", "案例检索", "研习工作台", "成效展示", "课程视频", "课程体系"]);

  const casesItem = navItems.find((item) => item.matchKind === "cases");
  const studyItem = navItems.find((item) => item.matchKind === "study");
  assert.equal(isShowcaseNavItemActive("/cases/case-0001", casesItem), true);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", casesItem), false);
  assert.equal(isShowcaseNavItemActive("/cases/case-0001/study", studyItem), true);
});

test("top nav fallback uses shared showcase nav content instead of local duplicated nav literals", () => {
  const source = readFileSync(new URL("../../components/top-nav.js", import.meta.url), "utf8");

  assert.equal(source.includes("buildShowcaseContent"), true);
  assert.equal(source.includes("buildShowcaseContent().nav"), true);
  assert.equal(source.includes("getShowcaseCanonicalStudyHref"), false);
  assert.equal(source.includes('label: "案例检索"'), false);
  assert.equal(source.includes('label: "课程视频"'), false);
});

test("showcase content stays client-safe by avoiding direct case-source imports", () => {
  const source = readFileSync(new URL("../../lib/showcase-content.js", import.meta.url), "utf8");

  assert.equal(source.includes("./showcase-cases.js"), false);
});

test("impact page uses summary-first dashboard sections in the required priority order", () => {
  const source = readFileSync(new URL("../../app/impact/page.js", import.meta.url), "utf8");
  const summaryIndex = source.indexOf("impact-summary-deck");
  const trendIndex = source.indexOf("impact-trend-section");
  const coverageIndex = source.indexOf("impact-coverage-section");
  const evidenceIndex = source.indexOf("impact-proof-ledger");
  const videoIndex = source.indexOf("impact-support-appendix");

  assert.match(source, /impact-summary-deck/u);
  assert.match(source, /impact-trend-section/u);
  assert.match(source, /impact-coverage-section/u);
  assert.match(source, /impact-proof-ledger/u);
  assert.match(source, /impact-support-appendix/u);
  assert.match(source, /impact-summary-inline/u);
  assert.match(source, /impact-summary-ledger/u);
  assert.match(source, /TopNav/u);
  assert.match(source, /getPublicShowcaseUser/u);
  assert.match(source, /content\.impactDashboard/u);
  assert.match(source, /content\.videoHub/u);
  assert.equal(source.includes("ShowcaseNav"), false);
  assert.equal(source.includes("impact-review-band"), false);
  assert.equal(source.includes("impact-evidence-section"), false);
  assert.equal(source.includes("impact-video-support"), false);
  assert.equal(/这里不是传统成果条目页/u.test(source), false);
  assert.equal(source.includes("impact-summary-notes"), false);
  assert.equal(source.includes("impact-summary-side"), false);
  assert.equal(source.includes("content.impact.sections.map"), false);
  assert.equal(/content\.impact\??\.sections/u.test(source), false);
  assert.equal(/content\.impact(?!Dashboard)/u.test(source), false);
  assert.equal(source.includes("buildImpactSectionMeta"), false);
  assert.equal(source.includes("buildImpactSummary"), false);
  assert.equal(source.includes("教学建设成效"), false);
  assert.equal(source.includes("学生发展成效"), false);
  assert.equal(source.includes("推广示范成效"), false);
  assert.equal(summaryIndex > -1, true);
  assert.equal(trendIndex > summaryIndex, true);
  assert.equal(coverageIndex > trendIndex, true);
  assert.equal(evidenceIndex > coverageIndex, true);
  assert.equal(videoIndex > evidenceIndex, true);
});

test("showcase nav fallback uses shared nav builder to keep task-1 semantics", () => {
  const source = readFileSync(new URL("../../components/showcase-nav.js", import.meta.url), "utf8");

  assert.equal(source.includes("buildShowcaseNavItems"), true);
  assert.equal(source.includes("items ?? buildShowcaseNavItems()"), true);
  assert.equal(source.includes("isShowcaseNavItemActive"), true);
  assert.equal(source.includes("aria-label=\"主导航\""), true);
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
