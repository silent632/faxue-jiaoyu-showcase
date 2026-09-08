import test from "node:test";
import assert from "node:assert/strict";

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
  assert.match(item.sourceHref, /^https?:\/\//u);
}

test("showcase content exposes approved title, nav, metrics, and page sections", () => {
  const content = buildShowcaseContent();

  assert.equal(content.site.title, "裁判文书研习平台");

  // 五项主导航（成效展示已合并到首页，研习档案独立成页）
  assert.deepEqual(content.nav.map((item) => item.label), [
    "首页",
    "课程认知",
    "案例研习",
    "仿真实验",
    "研习档案",
  ]);
  assert.deepEqual(content.nav.map((item) => item.href), [
    "/",
    "/courses",
    "/cases",
    "/experiments",
    "/archive",
  ]);

  // 平台指标：标签唯一、无重复数值口径
  assert.equal(content.metrics.caseCount.label, "典型案例");
  assert.equal(content.metrics.caseCount.value, "210+");
  assert.equal(content.metrics.coursePeriods.value, "8期");
  assert.equal(content.metrics.registeredUsers.status, "unverified");
  assert.equal(content.metrics.registeredUsers.raw, null);
  assert.equal(content.metrics.totalVideoPlays.label, "视频播放");
  assert.ok(content.metrics.workspaceReturnRate);
  const labels = Object.values(content.metrics).map((item) => item.label);
  assert.equal(new Set(labels).size, labels.length);
  assert.equal(labels.includes("累计访问"), false);

  // 成效板块
  assert.ok(content.impactDashboard);
  assert.equal(content.impactDashboard.trendPanels.length >= 3, true);
  assert.equal(content.impactDashboard.coverageCards.length >= 2, true);
  assert.equal(content.impact.sections.length, 4);
  assert.deepEqual(content.impact.sections.map((item) => item.title), [
    "教学建设成效",
    "学生发展成效",
    "平台运行成效",
    "推广示范成效",
  ]);

  // 视频与课程数据
  assert.equal(content.videoHub.phaseGuide.length, 2);
  assert.equal(content.videoHub.periods.length, 8);
  assert.equal(content.courses.timeline.length, 8);
  assert.equal(content.courses.periods.length, 8);
  assert.ok(content.learningLoop.archive);
  assert.match(content.learningLoop.archive.title, /研习|判断/u);
});

test("showcase content avoids label-board wording in content pages", () => {
  const content = buildShowcaseContent();
  const text = JSON.stringify({
    courses: content.courses,
    impact: content.impact,
  });

  assert.equal(/资源单元/u.test(text), false);
  assert.equal(/价值维度/u.test(text), false);
  assert.equal(/补充说明/u.test(text), false);
});

test("impact dashboard source data is ready for unverified metrics without unsupported numbers", () => {
  const content = buildShowcaseContent();
  const trendPanels = content.impactDashboard?.trendPanels ?? [];
  const coverageCards = content.impactDashboard?.coverageCards ?? [];

  // 无原始统计依据时不得恢复示例数字
  assert.ok(trendPanels.every((panel) => typeof panel.title === "string" && panel.title.length > 0));
  assert.ok(trendPanels.every((panel) => typeof panel.metricLabel === "string" && panel.metricLabel.length > 0));
  assert.ok(trendPanels.every((panel) => panel.status === "unverified" && panel.metricValue === "待核验"));

  // 未核验覆盖率不生成虚构比例
  assert.ok(coverageCards.every((card) => card.status === "unverified" && card.coverageValue === "待核验"));
  assert.ok(coverageCards.some((card) => /覆盖/u.test(card.title)));

  const impactSections = content.impact?.sections ?? [];
  assert.equal(impactSections.length, 4);
  assert.ok(impactSections.every((item) => Array.isArray(item.points) && item.points.length >= 3));
});

test("video hub dataset supports eight-period video results with per-period delivery modes", () => {
  const content = buildShowcaseContent();
  const hub = content.videoHub ?? {};
  const phaseGuide = Array.isArray(hub.phaseGuide) ? hub.phaseGuide : [];
  const periods = Array.isArray(hub.periods) ? hub.periods : [];
  const period01 = periods.find((item) => item.slug === "course-period-01");

  assert.equal(typeof hub.title, "string");
  assert.match(hub.title, /课程视频/u);
  assert.equal(phaseGuide.length, 2);
  assert.equal(periods.length, 8);
  assert.equal(periods[0].slug, "course-period-01");
  assert.equal(periods[7].slug, "course-period-08");
  assert.ok(periods.every((item) => typeof item.href === "string" && /^\/resources\/videos\//u.test(item.href)));
  periods.forEach(assertVideoPeriodDeliveryShape);

  assert.equal(period01?.playerMode, "video");
  assert.match(period01?.sourceHref || "", /^https?:\/\//u);

  const slugs = periods.map((item) => item.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("course archive data exposes period summaries, materials, and video links", () => {
  const periods = buildShowcaseContent().courses.periods;

  assert.equal(periods.length, 8);
  assert.equal(periods[0].period, "第一期");
  assert.equal(periods[7].period, "第八期");
  assert.ok(periods.every((item) => typeof item.module === "string" && item.module.length > 0));
  assert.ok(periods.every((item) => typeof item.stageTag === "string" && item.stageTag.length > 0));
  assert.ok(periods.every((item) => typeof item.description === "string" && item.description.length > 0));
  assert.ok(periods.every((item) => Array.isArray(item.materials) && item.materials.length >= 2));
  assert.ok(periods.every((item) => typeof item.detailHref === "string" && /^\/courses\/course-period-/u.test(item.detailHref)));
  assert.ok(periods.every((item) => typeof item.videoHref === "string" && /^\/resources\/videos\//u.test(item.videoHref)));
  assert.equal(periods.some((item) => item.materials.some((material) => /本期资料整理中|\.pptx|课件：.+\.pptx/u.test(material))), false);
});
