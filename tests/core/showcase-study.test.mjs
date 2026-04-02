import test from "node:test";
import assert from "node:assert/strict";

import { getShowcaseCanonicalDemoCaseId, getShowcaseCaseStudyById } from "../../lib/showcase-cases.js";
import {
  getPublicStudyActionState as getPublicStudyActionStateForCopy,
  normalizePublicStudyFeedback,
} from "../../lib/public-showcase-study.js";
import { getPublicStudyActionState, submitStudyWorkspace } from "../../lib/study-workspace.js";

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
  assert.match(state.submitMessage, /浏览器|提交/u);
  assert.equal(/公开展示模式下/u.test(publicCopy.submitMessage), false);
  assert.equal(/页面保留/u.test(publicCopy.autosaveMessage), false);
});

test("submitStudyWorkspace returns public showcase guidance instead of network submission", async () => {
  const result = await submitStudyWorkspace();
  const normalized = normalizePublicStudyFeedback(result);

  assert.equal(result.ok, false);
  assert.equal(normalized.tone, "warning");
  assert.match(normalized.message, /提交入口|浏览器/u);
  assert.equal(/公开展示模式/u.test(normalized.message), false);
  assert.equal(/不执行真实提交/u.test(normalized.message), false);
});
