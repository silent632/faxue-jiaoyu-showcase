import test from "node:test";
import assert from "node:assert/strict";

import { getShowcaseCanonicalStudyHref } from "../../lib/showcase-cases.js";
import { buildShowcaseContent } from "../../lib/showcase-content.js";
import {
  buildImpactSummary,
  buildImpactSectionMeta,
  buildResourceNote,
  buildResourceSectionMeta,
  getCourseTimelineDetail,
} from "../../lib/showcase-supporting-page-meta.js";

test("showcase content exposes approved title, nav, metrics, and page sections", () => {
  const content = buildShowcaseContent();
  const canonicalStudyHref = getShowcaseCanonicalStudyHref();
  const canonicalDetailHref = canonicalStudyHref.replace(/\/study\/?$/u, "");

  assert.equal(content.site.title, "裁判文书研习平台");
  assert.equal(content.metrics.caseCount.label, "典型案例");
  assert.equal(content.metrics.caseCount.value, "210+");
  assert.equal(content.metrics.caseCount.raw, 210);
  assert.equal(content.metrics.coursePeriods.label, "双师课程");
  assert.equal(content.metrics.coursePeriods.value, "8期");
  assert.equal(content.metrics.coursePeriods.raw, 8);
  assert.equal(content.metrics.registeredUsers.label, "注册用户");
  assert.equal(content.metrics.registeredUsers.value, "800+");
  assert.equal(content.metrics.registeredUsers.raw, 800);
  assert.equal(content.metrics.totalVisits.label, "累计访问");
  assert.equal(content.metrics.totalVisits.value, "2万+");
  assert.equal(content.metrics.totalVisits.raw, 20000);
  assert.deepEqual(content.nav.map((item) => item.label), [
    "首页",
    "案例检索",
    "研习工作台",
    "成效展示",
    "课程视频",
    "课程体系",
  ]);
  assert.deepEqual(content.nav.map((item) => item.href), [
    "/",
    "/cases",
    getShowcaseCanonicalStudyHref(),
    "/impact",
    "/resources",
    "/courses",
  ]);
  assert.deepEqual(content.nav.map((item) => item.matchKind || item.matchPrefix), [
    "/",
    "cases",
    "study",
    "/impact",
    "/resources",
    "/courses",
  ]);
  assert.ok(content.homeDashboard);
  assert.ok(content.homeDashboard.hero);
  assert.ok(Array.isArray(content.homeDashboard.kpis));
  assert.equal(content.homeDashboard.kpis.length >= 3, true);
  assert.ok(content.homeDashboard.trendSnapshot);
  assert.ok(content.impactDashboard);
  assert.ok(Array.isArray(content.impactDashboard.trendPanels));
  assert.equal(content.impactDashboard.trendPanels.length >= 2, true);
  assert.ok(Array.isArray(content.impactDashboard.coverageCards));
  assert.equal(content.impactDashboard.coverageCards.length >= 2, true);
  assert.ok(content.videoHub);
  assert.ok(content.videoHub.featured);
  assert.ok(Array.isArray(content.videoHub.playlist));
  assert.equal(content.videoHub.playlist.length >= 1, true);
  assert.deepEqual(content.homeEntries.map((item) => item.href), ["/cases", canonicalDetailHref, canonicalStudyHref]);
  assert.equal(content.homeFlow.length, 3);
  assert.ok(content.homePreview);
  assert.equal(content.homePreview.featuredCases.length, 3);
  assert.equal(content.homePreview.studyHighlights.length, 3);
  assert.equal(content.platformHighlights.length, 3);
  assert.equal(content.courses.timeline.length, 8);
  assert.deepEqual(content.courses.timeline.map((item) => item.period), [
    "第一期",
    "第二期",
    "第三期",
    "第四期",
    "第五期",
    "第六期",
    "第七期",
    "第八期",
  ]);
  assert.equal(content.resources.groups.length, 2);
  assert.deepEqual(content.resources.groups.map((group) => group.title), [
    "教学资源与资源体系",
    "标准材料与标准化支撑",
  ]);
  assert.equal(content.resources.groups[0].items.length, 4);
  assert.equal(content.resources.groups[1].items.length, 5);
  assert.equal(content.impact.sections.length, 4);
  assert.deepEqual(content.impact.sections.map((item) => item.title), [
    "教学建设成效",
    "学生发展成效",
    "平台运行成效",
    "推广示范成效",
  ]);
  assert.equal(content.impact.sections[0].points.length, 3);
});

test("showcase content avoids label-board wording in content pages", () => {
  const content = buildShowcaseContent();
  const text = JSON.stringify({
    courses: content.courses,
    resources: content.resources,
    impact: content.impact,
  });

  assert.equal(/资源单元/u.test(text), false);
  assert.equal(/价值维度/u.test(text), false);
  assert.equal(/补充说明/u.test(text), false);
});

test("operations-first dashboards present formed impact and platform metrics semantics", () => {
  const content = buildShowcaseContent();
  const heroText = JSON.stringify(content.homeDashboard?.hero || {});
  const kpiLabels = (content.homeDashboard?.kpis || []).map((item) => item.label);

  assert.match(heroText, /应用成果|平台成效/u);
  assert.match(heroText, /推广影响|推广应用/u);
  assert.match(heroText, /已形成/u);
  assert.equal(/先完成|再进入|最后/u.test(heroText), false);

  assert.ok(kpiLabels.includes("注册用户"));
  assert.ok(kpiLabels.includes("累计访问"));
  assert.ok(kpiLabels.includes("活跃用户"));
  assert.ok(kpiLabels.includes("工作台回访率"));
  assert.ok(kpiLabels.includes("案例检索使用占比"));
  assert.equal(kpiLabels.includes("典型案例"), false);
  assert.equal(kpiLabels.includes("双师课程"), false);

  assert.ok(Array.isArray(content.impactDashboard?.trendPanels));
  assert.ok(content.impactDashboard.trendPanels.length >= 2);
  assert.ok(content.impactDashboard.trendPanels.every((panel) => typeof panel.metricLabel === "string" && panel.metricLabel.length > 0));
  assert.ok(content.impactDashboard.trendPanels.every((panel) => typeof panel.metricValue === "string" && /\d/.test(panel.metricValue)));
  assert.ok(content.impactDashboard.trendPanels.some((panel) => /活跃用户|回访率|访问/u.test(panel.metricLabel)));

  assert.ok(Array.isArray(content.impactDashboard?.coverageCards));
  assert.ok(content.impactDashboard.coverageCards.length >= 2);
  assert.ok(content.impactDashboard.coverageCards.every((card) => typeof card.coverageValue === "string" && /\d/.test(card.coverageValue)));
  assert.ok(content.impactDashboard.coverageCards.some((card) => /覆盖/u.test(card.title)));
});

test("impact dashboard source data is ready for trend-coverage-video composition", () => {
  const content = buildShowcaseContent();
  const trendPanels = content.impactDashboard?.trendPanels ?? [];
  const coverageCards = content.impactDashboard?.coverageCards ?? [];
  const featuredVideo = content.videoHub?.featured;
  const playlist = content.videoHub?.playlist ?? [];

  assert.ok(Array.isArray(trendPanels));
  assert.equal(trendPanels.length >= 3, true);
  assert.ok(trendPanels.every((panel) => typeof panel.title === "string" && panel.title.length > 0));
  assert.ok(trendPanels.every((panel) => typeof panel.value === "string" && panel.value.length > 0));
  assert.ok(trendPanels.every((panel) => typeof panel.detail === "string" && panel.detail.length > 0));

  assert.ok(Array.isArray(coverageCards));
  assert.equal(coverageCards.length >= 2, true);
  assert.ok(coverageCards.every((card) => typeof card.title === "string" && card.title.length > 0));
  assert.ok(coverageCards.every((card) => typeof card.description === "string" && card.description.length > 0));
  assert.ok(coverageCards.every((card) => typeof card.coverageValue === "string" && /\d/u.test(card.coverageValue)));

  assert.ok(featuredVideo && typeof featuredVideo.title === "string" && featuredVideo.title.length > 0);
  assert.ok(featuredVideo && typeof featuredVideo.href === "string" && /^https?:\/\//u.test(featuredVideo.href));
  assert.ok(Array.isArray(playlist));
  assert.equal(playlist.length >= 1, true);
  assert.ok(playlist.every((item) => typeof item.title === "string" && item.title.length > 0));
  assert.ok(playlist.every((item) => typeof item.href === "string" && /^https?:\/\//u.test(item.href)));
});

test("supporting pages use resilient metadata lookups with fallbacks", () => {
  assert.deepEqual(getCourseTimelineDetail({ period: "第九期" }), {
    phase: "课程推进",
    focus: "围绕案例研习、规范适用与课堂讨论组织连续推进的法理学习。",
  });
  assert.deepEqual(getCourseTimelineDetail({ period: "第一期" }), {
    phase: "案例进入",
    focus: "从类案检索与法律适用切入，建立课程起点。",
  });

  assert.deepEqual(buildResourceSectionMeta({ title: "未知资源组", intro: "自定义说明" }), {
    eyebrow: "资源配置",
    title: "未知资源组",
    description: "自定义说明",
  });
  assert.equal(
    buildResourceNote({ title: "未知资源组" }, "未知材料"),
    "未知资源组中的材料围绕课程实施、研习支持与成果回收提供稳定支撑。"
  );
  assert.deepEqual(buildResourceSectionMeta({ title: "教学资源与资源体系" }), {
    eyebrow: "实施材料",
    title: "课堂实施与研习材料",
    description: "围绕课堂组织、文书导读与研习流程配置基础材料，确保每次课程都能按统一逻辑进入案例学习。",
  });

  assert.deepEqual(buildImpactSectionMeta({ title: "未知成效", intro: "自定义成效说明" }), {
    eyebrow: "项目成效",
    title: "未知成效",
    description: "自定义成效说明",
  });
  assert.deepEqual(buildImpactSummary({ title: "未知成效", intro: "自定义成效说明", points: ["A", "B", "C", "D"] }), {
    lead: "自定义成效说明",
    points: ["A", "B", "C"],
  });
  assert.deepEqual(buildImpactSummary({ title: "平台运行成效" }), {
    lead: "平台将课程、案例与资源组织为统一入口，支撑持续运行与集中展示。",
    points: ["案例、课程与资源形成统一归档", "支持教学记录与学习成果沉淀", "平台结构具备持续扩展能力"],
  });
});
