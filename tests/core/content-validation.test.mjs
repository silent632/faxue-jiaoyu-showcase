import { existsSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import { loadCopyPolicy, listForbiddenCopyMatches } from "../../lib/content/copy-policy.js";
import { validateContent } from "../../lib/content/validate-content.js";

test("copy policy loads centralized public wording rules", () => {
  const policy = loadCopyPolicy();

  assert.ok(policy.forbiddenPatterns.includes("公开展示模式"));
  assert.ok(policy.forbiddenPublicReviewPatterns.includes("专家可"));
  assert.ok(policy.forbiddenIncompleteStatePhrases.includes("PDF 预览待补充"));
  assert.ok(policy.forbiddenProductionPhrases.includes("制作层文件"));
  assert.equal(policy.preferredTerms["注册用户"], "平台使用者");
  assert.equal(policy.pageRoleRules.courses, "课程页呈现八期课程档案和标准材料入口。");
});

test("copy policy matcher reports forbidden public copy terms", () => {
  const matches = listForbiddenCopyMatches("本页用于公开展示模式，专家可继续核验。");

  assert.deepEqual(matches, ["本页用于", "公开展示模式", "专家可", "继续核验"]);
});

test("content validation passes for committed content sources", () => {
  const result = validateContent();

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("content maintenance scripts exist", () => {
  assert.equal(existsSync(new URL("../../scripts/validate-content.mjs", import.meta.url)), true);
  assert.equal(existsSync(new URL("../../scripts/audit-assets.mjs", import.meta.url)), true);
});
