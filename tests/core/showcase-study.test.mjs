import test from "node:test";
import assert from "node:assert/strict";

import { getShowcaseCanonicalDemoCaseId, getShowcaseCaseStudyById } from "../../lib/showcase-cases.js";
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

  assert.equal(state.canSubmit, false);
  assert.equal(state.canAutosave, true);
  assert.match(state.submitMessage, /公开展示|不开放真实提交/u);
});

test("submitStudyWorkspace returns public showcase guidance instead of network submission", async () => {
  const result = await submitStudyWorkspace();

  assert.equal(result.ok, false);
  assert.equal(result.tone, "warning");
  assert.match(result.message, /公开展示模式/u);
});
