import test from "node:test";
import assert from "node:assert/strict";

import { getPublicShowcaseUser, isPublicShowcaseMode } from "../../lib/public-showcase-user.js";
import { getPublicShowcaseCaseById, listPublicShowcaseCases } from "../../lib/public-showcase-cases.js";
import { getPublicStudyActionState } from "../../lib/public-showcase-study.js";

test("public showcase mode exposes a stable anonymous visitor", () => {
  assert.equal(isPublicShowcaseMode(), true);
  assert.deepEqual(getPublicShowcaseUser(), {
    sid: "public-showcase",
    name: "公开展示访客",
    roleLabel: "公开展示模式",
  });
});

test("public showcase cases bridge to the real showcase data", async () => {
  const rows = await listPublicShowcaseCases();

  assert.ok(rows.length > 0);
  assert.ok(rows[0].id);
  assert.ok(rows[0].title);

  const found = await getPublicShowcaseCaseById(rows[0].id);
  assert.equal(found?.id, rows[0].id);
  assert.equal(found?.title, rows[0].title);
});

test("public study actions are read-safe and non-submitting", () => {
  const state = getPublicStudyActionState();

  assert.equal(state.canSubmit, false);
  assert.equal(state.canAutosave, false);
  assert.match(state.submitMessage, /公开展示|不开放真实提交/u);
  assert.match(state.autosaveMessage, /公开展示|不启用自动保存/u);
});
