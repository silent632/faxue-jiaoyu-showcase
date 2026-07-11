import test from "node:test";
import assert from "node:assert/strict";

import { getShowcaseCanonicalDemoCaseId, getShowcaseCaseById } from "../../lib/showcase-cases.js";
import {
  STUDY_STEP_DEFINITIONS,
  createEmptyStudyDraft,
  getPublicStudyActionState,
  getStudyWorkspaceMetrics,
  submitStudyWorkspace,
} from "../../lib/study-workspace.js";

test("study workspace exposes three writing steps backed by reference fields", async () => {
  const canonicalId = getShowcaseCanonicalDemoCaseId();
  const caseItem = await getShowcaseCaseById(canonicalId);

  assert.ok(caseItem);
  assert.equal(STUDY_STEP_DEFINITIONS.length, 3);
  assert.deepEqual(
    STUDY_STEP_DEFINITIONS.map((step) => step.field),
    ["fact", "issue", "analysis"]
  );
  // 每一步的参考字段都应当真实存在于案例数据上
  for (const step of STUDY_STEP_DEFINITIONS) {
    assert.equal(typeof caseItem[step.refKey], "string");
  }
});

test("public study workspace exposes disabled submit state", () => {
  const state = getPublicStudyActionState();

  assert.equal(state.canSubmit, false);
  assert.equal(state.canAutosave, true);
  assert.match(state.submitMessage, /浏览器|导出|整理/u);
  assert.equal(/暂未开放/u.test(state.submitMessage), false);
  assert.equal(/公开展示模式/u.test(state.submitMessage), false);
  assert.equal(/页面保留/u.test(state.autosaveMessage), false);
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

  assert.equal(result.ok, true);
  assert.equal(result.tone, "soft");
  assert.match(result.message, /浏览器|导出|整理/u);
  assert.equal(/提交入口/u.test(result.message), false);
  assert.equal(/暂未开放/u.test(result.message), false);
  assert.equal(/公开展示模式/u.test(result.message), false);
});
