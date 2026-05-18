import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import { loadCourseContentProfileSource } from "../../lib/content/course-content-source.js";
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

test("period 01 course content loads from migrated content source", () => {
  const profile = loadCourseContentProfileSource("course-period-01");

  assert.ok(profile);
  assert.equal(profile.periodSummary.theme, "类案检索与法律适用");
  assert.ok(profile.coreQuestions.length >= 3);
  assert.ok(profile.contentFlow.length >= 3);
});

test("all public course content loads from migrated content sources", () => {
  for (let index = 1; index <= 8; index += 1) {
    const slug = `course-period-${String(index).padStart(2, "0")}`;
    const profile = loadCourseContentProfileSource(slug);

    assert.ok(profile, `${slug} should load from content source`);
    assert.ok(profile.periodSummary.theme);
    assert.ok(profile.coreQuestions.length >= 3);
    assert.ok(profile.contentFlow.length >= 3);
  }
});

test("core public content is not hardcoded in legacy lib modules", () => {
  const profileSource = readFileSync(new URL("../../lib/course-content-profiles.js", import.meta.url), "utf8");
  const videoSource = readFileSync(new URL("../../lib/showcase-home-videos.js", import.meta.url), "utf8");
  const showcaseSource = readFileSync(new URL("../../lib/showcase-content.js", import.meta.url), "utf8");

  assert.equal(/function buildPeriod0[2-8]Profile/u.test(profileSource), false);
  assert.equal(videoSource.includes("vod-qcloud.com"), false);
  assert.equal(showcaseSource.includes("homeDashboard:"), false);
  assert.equal(showcaseSource.includes("COURSE_MATERIALS_BY_PERIOD"), false);
});
