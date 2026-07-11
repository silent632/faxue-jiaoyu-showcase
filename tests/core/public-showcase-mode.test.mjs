import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getPublicStudyActionState } from "../../lib/study-workspace.js";

test("public showcase nav exposes a stable anonymous visitor", () => {
  const source = readFileSync(new URL("../../components/showcase-nav.js", import.meta.url), "utf8");

  assert.match(source, /sid: "public-showcase"/u);
  assert.match(source, /name: "开放浏览"/u);
  assert.match(source, /roleLabel: "案例研习平台"/u);
});

test("public study actions are read-safe and non-submitting", () => {
  const state = getPublicStudyActionState();

  assert.equal(state.canSubmit, false);
  assert.equal(state.canAutosave, true);
  assert.match(state.submitMessage, /浏览器|导出|整理/u);
  assert.equal(/公开展示模式/u.test(state.submitMessage), false);
  assert.equal(/不执行真实提交/u.test(state.submitMessage), false);
});
