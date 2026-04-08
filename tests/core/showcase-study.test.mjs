import test from "node:test";
import assert from "node:assert/strict";

import { getShowcaseCanonicalDemoCaseId, getShowcaseCaseStudyById } from "../../lib/showcase-cases.js";
import {
  getPublicStudyActionState as getPublicStudyActionStateForCopy,
  getPublicStudyHeadNote,
  getPublicStudyOverviewDescription,
  getPublicStudyReaderNote,
  normalizePublicStudyFeedback,
} from "../../lib/public-showcase-study.js";
import { createEmptyStudyDraft, getPublicStudyActionState, getStudyWorkspaceMetrics, submitStudyWorkspace } from "../../lib/study-workspace.js";

test("showcase study helper returns a real case with structured study steps", async () => {
  const canonicalId = getShowcaseCanonicalDemoCaseId();
  const caseItem = await getShowcaseCaseStudyById(canonicalId);

  assert.ok(caseItem);
  assert.equal(caseItem.id, canonicalId);
  assert.ok(caseItem.title);
  assert.ok(Array.isArray(caseItem.studySteps));
  assert.equal(caseItem.studySteps.length, 4);
});

test("public study workspace exposes disabled submit state", () => {
  const state = getPublicStudyActionState();
  const publicCopy = getPublicStudyActionStateForCopy();

  assert.equal(state.canSubmit, false);
  assert.equal(state.canAutosave, true);
  assert.match(state.submitMessage, /浏览器|导出|整理/u);
  assert.equal(/暂未开放/u.test(state.submitMessage), false);
  assert.equal(/公开展示模式下/u.test(publicCopy.submitMessage), false);
  assert.equal(/页面保留/u.test(publicCopy.autosaveMessage), false);
  assert.equal(/暂未开放/u.test(publicCopy.submitMessage), false);
});

test("study helper exposes guide-first copy when pdf is missing", () => {
  const headNote = getPublicStudyHeadNote({ hasPdf: false });
  const readerNote = getPublicStudyReaderNote({ hasPdf: false });
  const overview = getPublicStudyOverviewDescription({ hasPdf: false });

  assert.match(headNote, /导读|争点|结构化研习/u);
  assert.equal(/裁判文书完成阅读/u.test(headNote), false);
  assert.match(readerNote, /导读|争议焦点|继续推进/u);
  assert.equal(/PDF 原文/u.test(readerNote), false);
  assert.match(overview, /导读|前置阅读|结构化研习/u);
});

test("study workspace metrics use guide-first guidance when pdf is missing", () => {
  const metrics = getStudyWorkspaceMetrics({
    caseItem: { refFact: "a", refIssue: "b", refLegal: "c" },
    draft: createEmptyStudyDraft(),
    hasPdf: false,
  });

  assert.match(metrics.completionText, /导读|事实梳理|争议焦点/u);
  assert.equal(/右侧|版式/u.test(metrics.completionText), false);
});

test("submitStudyWorkspace returns public showcase guidance instead of network submission", async () => {
  const result = await submitStudyWorkspace();
  const normalized = normalizePublicStudyFeedback(result);

  assert.equal(result.ok, true);
  assert.equal(normalized.tone, "soft");
  assert.match(normalized.message, /浏览器|导出|整理/u);
  assert.equal(/提交入口/u.test(normalized.message), false);
  assert.equal(/暂未开放/u.test(normalized.message), false);
  assert.equal(/公开展示模式/u.test(normalized.message), false);
  assert.equal(/不执行真实提交/u.test(normalized.message), false);
});
