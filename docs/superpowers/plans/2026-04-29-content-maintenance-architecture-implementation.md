# Codex Content Maintenance Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first maintainable content layer so future Codex-driven updates happen through structured content files, validation scripts, and a documented workflow rather than ad hoc edits inside large JS content modules.

**Architecture:** Add a `content/` source layer, a small `lib/content/` validation/loading layer, and scripts/tests that verify content structure, public-copy policy, and asset consistency. Keep the existing static Next.js rendering model intact; migrate only one course period as a safe sample and make the current external course-package dependency testable in environments without the local package folder.

**Tech Stack:** Next.js 15 static export, React 19, Node ESM, `node:test`, JSON content files, no new runtime dependency in the first pass.

---

## File Structure

Create:

- `CONTENT_MAINTENANCE.md`  
  User-facing and Codex-facing workflow manual for content updates.
- `content/README.md`  
  Explains the content source layout and ownership boundaries.
- `content/copy-policy.json`  
  Central source for forbidden public-copy patterns and preferred public terms.
- `content/courses/course-period-01.json`  
  Sample structured course content migrated from the current period 01 profile.
- `lib/content/content-paths.js`  
  Resolves content paths relative to the repository root.
- `lib/content/load-json.js`  
  Reads and parses JSON content files with actionable error messages.
- `lib/content/copy-policy.js`  
  Loads copy policy and exposes pattern matching helpers.
- `lib/content/course-content-source.js`  
  Loads migrated course JSON by slug and returns `null` for non-migrated periods.
- `lib/content/validate-content.js`  
  Validates copy policy and migrated course content.
- `scripts/validate-content.mjs`  
  CLI wrapper for content validation.
- `scripts/audit-assets.mjs`  
  CLI wrapper for lightweight asset checks.
- `tests/core/content-validation.test.mjs`  
  Unit tests for content validation and policy loading.

Modify:

- `package.json`  
  Add `validate:content`, `audit:assets`, and `check` scripts.
- `lib/course-content-profiles.js`  
  Load migrated period 01 content from `content/courses/course-period-01.json`; keep existing builders as fallback.
- `lib/course-package.js`  
  Make course package material-group expectations deterministic when external package folders are absent.
- `tests/core/course-package.test.mjs`  
  Adjust material group assertions so the test distinguishes “external package present” from “fallback-only environment”.
- `tests/core/public-copy-tone.test.mjs`  
  Read centralized copy policy for forbidden public-copy patterns.
- `.gitignore`  
  Ignore local/generated artifacts that are already polluting the worktree: `.DS_Store`, `.artifacts/`, `.playwright-cli/`, `out/`, `output/`.

---

## Task 1: Add Content Maintenance Manual

**Files:**

- Create: `CONTENT_MAINTENANCE.md`
- Create: `content/README.md`
- Modify: `.gitignore`

- [ ] **Step 1: Create the maintenance manual**

Create `CONTENT_MAINTENANCE.md` with this content:

```markdown
# Content Maintenance Guide

## Purpose

This project is maintained through Codex-assisted content updates. The user does not need to edit source files directly. Codex should update structured content files, run validation, run tests, build the static site, and report the affected pages.

## Content Update Workflow

When asked to update public content:

1. Identify the content source file under `content/`.
2. Read the related rendering and validation files before editing.
3. Edit the smallest content file that owns the requested text or data.
4. Run `npm run validate:content`.
5. Run the smallest relevant `node --test` command.
6. Run `npm run build` when the change affects routes, links, assets, or generated pages.
7. Report changed files, affected pages, commands run, and remaining risks.

## Standard User Prompts

Use prompts like:

```text
更新第七期课程内容，保持公开展示口径，跑内容校验、核心测试和构建，最后汇报影响页面。
```

```text
更新首页指标文案，不改页面结构，检查公开文案规则并构建。
```

```text
检查所有 PDF 和视频链接是否仍然有效，给出失败清单。
```

## Public Copy Rules

Public pages must not expose backstage wording, reviewer-facing instructions, production-process wording, incomplete-state wording, or implementation commentary. The central rule file is `content/copy-policy.json`.

## Validation Commands

```bash
npm run validate:content
npm run audit:assets
npm run test:core
npm run build
```

Use `npm run check` when a change should pass the full local verification chain.

## Content Ownership

- Course period content belongs in `content/courses/`.
- Public-copy policy belongs in `content/copy-policy.json`.
- Video data will move to `content/videos.json` in a later migration.
- Homepage and impact data will move to `content/homepage.json` and `content/impact.json` in a later migration.
- Case extraction data remains in `data/generated/cases-extracted.json`.

## Reporting Format

Codex should end content maintenance work with:

- Changed content files.
- Affected public pages.
- Validation commands and results.
- Any source data that could not be verified.
```

- [ ] **Step 2: Create content directory README**

Create `content/README.md` with this content:

```markdown
# Content Sources

This directory stores maintainable public content for Codex-assisted updates.

The goal is to keep long-lived content out of large JS modules. Rendering code should load validated content through `lib/content/` helpers and expose stable view models to `app/` and `components/`.

## Current Files

- `copy-policy.json`: public-copy guardrails used by validation and tests.
- `courses/course-period-01.json`: first migrated course period sample.

## Rules

1. Keep route slugs stable.
2. Keep public copy concise and visitor-facing.
3. Do not write backstage, reviewer-facing, or production-process wording.
4. Run `npm run validate:content` after editing content files.
5. Run `npm run build` when content changes affect generated routes or visible pages.
```

- [ ] **Step 3: Update `.gitignore`**

Modify `.gitignore` so its full content is:

```gitignore
.DS_Store
.next
node_modules
.worktrees
.artifacts
.playwright-cli
out
output
```

- [ ] **Step 4: Verify docs and ignore file**

Run:

```bash
test -f CONTENT_MAINTENANCE.md && test -f content/README.md && git diff --check
```

Expected: command exits with code `0`.

- [ ] **Step 5: Commit**

Run:

```bash
git add CONTENT_MAINTENANCE.md content/README.md .gitignore
git commit -m "docs: add content maintenance workflow"
```

---

## Task 2: Centralize Public Copy Policy

**Files:**

- Create: `content/copy-policy.json`
- Create: `lib/content/content-paths.js`
- Create: `lib/content/load-json.js`
- Create: `lib/content/copy-policy.js`
- Create: `tests/core/content-validation.test.mjs`

- [ ] **Step 1: Write the copy policy JSON**

Create `content/copy-policy.json` with this content:

```json
{
  "forbiddenPatterns": [
    "本页用于",
    "本页按",
    "本页集中呈现",
    "这里保留",
    "展示站",
    "公开展示模式",
    "页面保留",
    "不再停留在",
    "真实模块预览",
    "真实平台链路",
    "公开化展示",
    "设计者"
  ],
  "forbiddenPublicReviewPatterns": [
    "专家可",
    "服务专家",
    "本页聚焦专家",
    "建议核验",
    "继续核验",
    "便于继续核验",
    "进入下层页面前",
    "支持从总览继续进入",
    "供专家"
  ],
  "forbiddenIncompleteStatePhrases": [
    "Word 原文待补充",
    "PDF 预览待补充",
    "案号待补充",
    "法院待补充",
    "日期待补充",
    "线上提交入口暂未开放",
    "提交研习"
  ],
  "forbiddenProductionPhrases": [
    "章节配音稿与内容导图",
    "内容展开页",
    "材料页",
    "制作层文件",
    "资料包制作清单"
  ],
  "preferredTerms": {
    "注册用户": "平台使用者",
    "主视频": "课程视频",
    "辅助视频": "课程视频"
  },
  "pageRoleRules": {
    "homepage": "首页只呈现平台入口、核心指标和最短访问路径。",
    "courses": "课程页呈现八期课程档案和标准材料入口。",
    "cases": "案例页呈现检索、导读和原文入口。",
    "impact": "成效页呈现平台运行、课程建设和推广结果。"
  }
}
```

- [ ] **Step 2: Create path helper**

Create `lib/content/content-paths.js`:

```js
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CONTENT_ROOT = path.join(REPO_ROOT, "content");

export function resolveContentPath(...segments) {
  return path.join(CONTENT_ROOT, ...segments);
}
```

- [ ] **Step 3: Create JSON loader**

Create `lib/content/load-json.js`:

```js
import { readFileSync } from "node:fs";

export function loadJsonFile(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    const message = error instanceof SyntaxError
      ? `Invalid JSON in ${filePath}: ${error.message}`
      : `Unable to read JSON file ${filePath}: ${error.message}`;
    throw new Error(message);
  }
}
```

- [ ] **Step 4: Create copy policy helper**

Create `lib/content/copy-policy.js`:

```js
import { resolveContentPath } from "./content-paths.js";
import { loadJsonFile } from "./load-json.js";

const POLICY_PATH = resolveContentPath("copy-policy.json");

function asStringArray(value, fieldName) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error(`copy-policy.json field "${fieldName}" must be a non-empty string array`);
  }
  return value.map((item) => item.trim());
}

export function loadCopyPolicy() {
  const policy = loadJsonFile(POLICY_PATH);
  return {
    forbiddenPatterns: asStringArray(policy.forbiddenPatterns, "forbiddenPatterns"),
    forbiddenPublicReviewPatterns: asStringArray(policy.forbiddenPublicReviewPatterns, "forbiddenPublicReviewPatterns"),
    forbiddenIncompleteStatePhrases: asStringArray(policy.forbiddenIncompleteStatePhrases, "forbiddenIncompleteStatePhrases"),
    forbiddenProductionPhrases: asStringArray(policy.forbiddenProductionPhrases, "forbiddenProductionPhrases"),
    preferredTerms: policy.preferredTerms && typeof policy.preferredTerms === "object" ? policy.preferredTerms : {},
    pageRoleRules: policy.pageRoleRules && typeof policy.pageRoleRules === "object" ? policy.pageRoleRules : {},
  };
}

export function listForbiddenCopyMatches(text, policy = loadCopyPolicy()) {
  const source = String(text || "");
  const terms = [
    ...policy.forbiddenPatterns,
    ...policy.forbiddenPublicReviewPatterns,
    ...policy.forbiddenIncompleteStatePhrases,
    ...policy.forbiddenProductionPhrases,
  ];
  return terms.filter((term) => source.includes(term));
}
```

- [ ] **Step 5: Write tests for policy loading**

Create `tests/core/content-validation.test.mjs` with this initial content:

```js
import test from "node:test";
import assert from "node:assert/strict";

import { loadCopyPolicy, listForbiddenCopyMatches } from "../../lib/content/copy-policy.js";

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

  assert.deepEqual(matches, ["本页用于", "公开展示模式", "专家可"]);
});
```

- [ ] **Step 6: Run policy tests**

Run:

```bash
node --test tests/core/content-validation.test.mjs
```

Expected: both tests pass.

- [ ] **Step 7: Commit**

Run:

```bash
git add content/copy-policy.json lib/content/content-paths.js lib/content/load-json.js lib/content/copy-policy.js tests/core/content-validation.test.mjs
git commit -m "feat: centralize public copy policy"
```

---

## Task 3: Add Content Validation CLI

**Files:**

- Create: `lib/content/validate-content.js`
- Create: `scripts/validate-content.mjs`
- Modify: `tests/core/content-validation.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add validation module**

Create `lib/content/validate-content.js`:

```js
import { readdirSync } from "node:fs";
import path from "node:path";

import { CONTENT_ROOT, resolveContentPath } from "./content-paths.js";
import { loadCopyPolicy, listForbiddenCopyMatches } from "./copy-policy.js";
import { loadJsonFile } from "./load-json.js";

function collectStrings(value, result = []) {
  if (typeof value === "string") {
    result.push(value);
    return result;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, result);
    return result;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, result);
  }
  return result;
}

function validateCopyPolicy(errors) {
  try {
    loadCopyPolicy();
  } catch (error) {
    errors.push(error.message);
  }
}

function validateJsonFiles(errors) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        files.push(fullPath);
      }
    }
  };

  walk(CONTENT_ROOT);
  for (const filePath of files) {
    try {
      loadJsonFile(filePath);
    } catch (error) {
      errors.push(error.message);
    }
  }
}

function validateContentCopy(errors) {
  const policy = loadCopyPolicy();
  const filesToCheck = [
    resolveContentPath("courses", "course-period-01.json"),
  ];

  for (const filePath of filesToCheck) {
    let payload;
    try {
      payload = loadJsonFile(filePath);
    } catch (_error) {
      continue;
    }

    const text = collectStrings(payload).join("\n");
    const matches = listForbiddenCopyMatches(text, policy);
    if (matches.length) {
      errors.push(`${path.relative(CONTENT_ROOT, filePath)} contains forbidden copy: ${matches.join(", ")}`);
    }
  }
}

export function validateContent() {
  const errors = [];
  validateCopyPolicy(errors);
  validateJsonFiles(errors);
  if (!errors.length) validateContentCopy(errors);
  return {
    ok: errors.length === 0,
    errors,
  };
}
```

- [ ] **Step 2: Add CLI wrapper**

Create `scripts/validate-content.mjs`:

```js
#!/usr/bin/env node
import { validateContent } from "../lib/content/validate-content.js";

const result = validateContent();

if (!result.ok) {
  console.error("Content validation failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Content validation passed.");
```

- [ ] **Step 3: Extend validation tests**

Append to `tests/core/content-validation.test.mjs`:

```js
import { validateContent } from "../../lib/content/validate-content.js";

test("content validation passes for committed content sources", () => {
  const result = validateContent();

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});
```

If the file already has imports, keep all imports at the top:

```js
import test from "node:test";
import assert from "node:assert/strict";

import { loadCopyPolicy, listForbiddenCopyMatches } from "../../lib/content/copy-policy.js";
import { validateContent } from "../../lib/content/validate-content.js";
```

- [ ] **Step 4: Add package scripts**

Modify `package.json` scripts to include:

```json
"validate:content": "node ./scripts/validate-content.mjs",
"audit:assets": "node ./scripts/audit-assets.mjs",
"check": "npm run validate:content && npm run audit:assets && npm run test:core && npm run build"
```

The full scripts block should become:

```json
"scripts": {
  "dev": "next dev -p 3011",
  "build": "next build",
  "start": "next start -p 3011",
  "test:core": "node --test tests/core/*.test.mjs",
  "validate:content": "node ./scripts/validate-content.mjs",
  "audit:assets": "node ./scripts/audit-assets.mjs",
  "check": "npm run validate:content && npm run audit:assets && npm run test:core && npm run build",
  "sync:pdfs": "node ./lib/showcase-pdf-sync.mjs"
}
```

- [ ] **Step 5: Run validation tests and CLI**

Run:

```bash
node --test tests/core/content-validation.test.mjs
npm run validate:content
```

Expected:

- `node --test` passes all content-validation tests.
- CLI prints `Content validation passed.`

- [ ] **Step 6: Commit**

Run:

```bash
git add lib/content/validate-content.js scripts/validate-content.mjs tests/core/content-validation.test.mjs package.json
git commit -m "feat: add content validation command"
```

---

## Task 4: Add Asset Audit CLI

**Files:**

- Create: `scripts/audit-assets.mjs`
- Modify: `tests/core/content-validation.test.mjs`

- [ ] **Step 1: Create asset audit script**

Create `scripts/audit-assets.mjs`:

```js
#!/usr/bin/env node
import { existsSync } from "node:fs";

import { loadShowcaseCases } from "../lib/showcase-cases.js";
import { normalizePublicFileName, resolvePublicFilePath } from "../lib/data/public-files.js";
import { getShowcaseVideoPeriods } from "../lib/showcase-home-videos.js";

const errors = [];

const cases = await loadShowcaseCases();
for (const item of cases) {
  const pdfFileName = normalizePublicFileName(item.pdfFile);
  if (!pdfFileName) {
    errors.push(`${item.id} has no pdfFile`);
    continue;
  }
  const pdfPath = resolvePublicFilePath("pdfs", pdfFileName);
  if (!existsSync(pdfPath)) {
    errors.push(`${item.id} references missing PDF: ${pdfFileName}`);
  }
}

for (const video of getShowcaseVideoPeriods()) {
  if (video.playerMode === "video" && !/^https?:\/\//u.test(video.sourceHref || "")) {
    errors.push(`${video.slug} has invalid video source: ${video.sourceHref || ""}`);
  }
  if (video.playerMode === "segments") {
    for (const segment of video.segments || []) {
      if (!/^https?:\/\//u.test(segment.href || "")) {
        errors.push(`${video.slug} segment "${segment.label}" has invalid href: ${segment.href || ""}`);
      }
    }
  }
}

if (errors.length) {
  console.error("Asset audit failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Asset audit passed. Checked ${cases.length} cases and ${getShowcaseVideoPeriods().length} video entries.`);
```

- [ ] **Step 2: Add test for script presence**

Append to `tests/core/content-validation.test.mjs`:

```js
import { existsSync } from "node:fs";

test("content maintenance scripts exist", () => {
  assert.equal(existsSync(new URL("../../scripts/validate-content.mjs", import.meta.url)), true);
  assert.equal(existsSync(new URL("../../scripts/audit-assets.mjs", import.meta.url)), true);
});
```

Keep all imports at the top. The top import block should include:

```js
import { existsSync } from "node:fs";
```

- [ ] **Step 3: Run asset audit**

Run:

```bash
npm run audit:assets
```

Expected: prints `Asset audit passed. Checked 210 cases and 8 video entries.`

- [ ] **Step 4: Run content-validation tests**

Run:

```bash
node --test tests/core/content-validation.test.mjs
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

Run:

```bash
git add scripts/audit-assets.mjs tests/core/content-validation.test.mjs
git commit -m "feat: add asset audit command"
```

---

## Task 5: Migrate Period 01 Course Content Sample

**Files:**

- Create: `content/courses/course-period-01.json`
- Create: `lib/content/course-content-source.js`
- Modify: `lib/course-content-profiles.js`
- Modify: `tests/core/content-validation.test.mjs`
- Modify: `tests/core/course-content-profiles.test.mjs`

- [ ] **Step 1: Extract current period 01 profile**

Run:

```bash
node --input-type=module -e "import { getCoursePackagePeriodBySlug } from './lib/course-package.js'; const p=getCoursePackagePeriodBySlug('course-period-01'); console.log(JSON.stringify(p.courseContentProfile,null,2));" > /tmp/course-period-01-profile.json
```

Expected: `/tmp/course-period-01-profile.json` contains a JSON object with `periodSummary`, `coreQuestions`, `contentFlow`, `caseStudy`, `materialsInterpretation`, `studentOutcomes`, `teachingDesign`, and `sectionSummaries`.

- [ ] **Step 2: Create migrated content file**

Create `content/courses/course-period-01.json` using the exact JSON produced in `/tmp/course-period-01-profile.json`.

After creation, run:

```bash
node -e "JSON.parse(require('node:fs').readFileSync('content/courses/course-period-01.json','utf8')); console.log('valid json')"
```

Expected: prints `valid json`.

- [ ] **Step 3: Create course content source loader**

Create `lib/content/course-content-source.js`:

```js
import { existsSync } from "node:fs";
import path from "node:path";

import { resolveContentPath } from "./content-paths.js";
import { loadJsonFile } from "./load-json.js";

const MIGRATED_COURSE_SLUGS = new Set(["course-period-01"]);

function validateCourseProfileShape(slug, profile) {
  const requiredObjectFields = [
    "periodSummary",
    "caseStudy",
    "materialsInterpretation",
    "studentOutcomes",
    "teachingDesign",
    "sectionSummaries",
  ];
  const requiredArrayFields = ["coreQuestions", "contentFlow"];

  for (const field of requiredObjectFields) {
    if (!profile[field] || typeof profile[field] !== "object" || Array.isArray(profile[field])) {
      throw new Error(`${slug} content field "${field}" must be an object`);
    }
  }

  for (const field of requiredArrayFields) {
    if (!Array.isArray(profile[field])) {
      throw new Error(`${slug} content field "${field}" must be an array`);
    }
  }

  if (typeof profile.periodSummary.theme !== "string" || !profile.periodSummary.theme.trim()) {
    throw new Error(`${slug} content field "periodSummary.theme" is required`);
  }

  return profile;
}

export function loadCourseContentProfileSource(slug) {
  if (!MIGRATED_COURSE_SLUGS.has(slug)) return null;

  const filePath = resolveContentPath("courses", `${slug}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Migrated course content file is missing: ${path.relative(process.cwd(), filePath)}`);
  }

  return validateCourseProfileShape(slug, loadJsonFile(filePath));
}
```

- [ ] **Step 4: Use migrated source in course profile builder**

Modify `lib/course-content-profiles.js`.

Add this import at the top:

```js
import { loadCourseContentProfileSource } from "./content/course-content-source.js";
```

Modify `buildCourseContentProfile(period)` to:

```js
export function buildCourseContentProfile(period) {
  const migratedProfile = loadCourseContentProfileSource(period.slug);
  if (migratedProfile) {
    return migratedProfile;
  }

  const builder = PROFILE_BUILDERS[period.slug];
  if (builder) {
    return builder(period);
  }

  return buildStructuredFallbackProfile(period);
}
```

- [ ] **Step 5: Extend content validation for migrated course**

Modify `lib/content/validate-content.js`.

Add import:

```js
import { loadCourseContentProfileSource } from "./course-content-source.js";
```

Add function:

```js
function validateMigratedCourses(errors) {
  try {
    const period01 = loadCourseContentProfileSource("course-period-01");
    if (!period01) {
      errors.push("course-period-01 migrated content did not load");
      return;
    }
    if (!Array.isArray(period01.coreQuestions) || period01.coreQuestions.length < 3) {
      errors.push("course-period-01 must expose at least three core questions");
    }
    if (!Array.isArray(period01.contentFlow) || period01.contentFlow.length < 3) {
      errors.push("course-period-01 must expose at least three content flow entries");
    }
  } catch (error) {
    errors.push(error.message);
  }
}
```

Call it in `validateContent()` after `validateJsonFiles(errors)`:

```js
validateMigratedCourses(errors);
```

- [ ] **Step 6: Add tests for migrated course source**

Append to `tests/core/content-validation.test.mjs`:

```js
import { loadCourseContentProfileSource } from "../../lib/content/course-content-source.js";

test("period 01 course content loads from migrated content source", () => {
  const profile = loadCourseContentProfileSource("course-period-01");

  assert.ok(profile);
  assert.equal(profile.periodSummary.theme, "类案检索与法律适用");
  assert.ok(profile.coreQuestions.length >= 3);
  assert.ok(profile.contentFlow.length >= 3);
});

test("non-migrated course content returns null from content source", () => {
  assert.equal(loadCourseContentProfileSource("course-period-02"), null);
});
```

Keep imports at the top.

- [ ] **Step 7: Add regression test for course package output**

Append to `tests/core/course-content-profiles.test.mjs`:

```js
test("period 01 profile is served from migrated content source without changing public shape", () => {
  const period01 = getCoursePackagePeriodBySlug("course-period-01");

  assert.equal(period01.courseContentProfile.periodSummary.theme, "类案检索与法律适用");
  assert.ok(period01.courseContentProfile.coreQuestions.length >= 3);
  assert.ok(period01.courseContentProfile.contentFlow.length >= 3);
  assert.ok(period01.courseContentProfile.caseStudy.mainCases.includes("借名买房案"));
});
```

If `getCoursePackagePeriodBySlug` is not imported in that test file, add:

```js
import { getCoursePackagePeriodBySlug } from "../../lib/course-package.js";
```

- [ ] **Step 8: Run focused tests and validation**

Run:

```bash
npm run validate:content
node --test tests/core/content-validation.test.mjs tests/core/course-content-profiles.test.mjs
```

Expected: validation passes; both test files pass.

- [ ] **Step 9: Commit**

Run:

```bash
git add content/courses/course-period-01.json lib/content/course-content-source.js lib/content/validate-content.js lib/course-content-profiles.js tests/core/content-validation.test.mjs tests/core/course-content-profiles.test.mjs
git commit -m "feat: load period one course content from content source"
```

---

## Task 6: Make Course Package Tests Reproducible Without External Folder

**Files:**

- Modify: `lib/course-package.js`
- Modify: `tests/core/course-package.test.mjs`

- [ ] **Step 1: Expose course package source availability**

Modify `lib/course-package.js`.

Change `resolveCoursePackageRoot` and the constant area to expose availability:

```js
function resolveCoursePackageRoot(candidates = COURSE_PACKAGE_ROOT_CANDIDATES) {
  return candidates.find((item) => existsSync(item)) || candidates[0] || path.resolve(process.cwd(), "课程资料包");
}

const COURSE_PACKAGE_ROOT = resolveCoursePackageRoot();
const HAS_COURSE_PACKAGE_ROOT = existsSync(COURSE_PACKAGE_ROOT);
```

Add export near the bottom:

```js
export function hasCoursePackageRoot() {
  return HAS_COURSE_PACKAGE_ROOT;
}
```

- [ ] **Step 2: Make material group assertions environment-aware**

Modify imports in `tests/core/course-package.test.mjs`:

```js
import {
  getCoursePackagePeriodBySlug,
  getCoursePackageStaticParams,
  hasCoursePackageRoot,
  normalizeCourseMaterialDisplayName,
} from "../../lib/course-package.js";
```

In test `"course package metadata exposes eight detail pages with normalized material names"`, replace the material group assertions:

```js
assert.ok(Array.isArray(period01.materialGroups));
assert.ok(period01.materialGroups.some((group) => group.title === "课程资料"));
assert.ok(period01.materialGroups.some((group) => group.items.some((item) => item.displayName === "课程课件：类案检索与法律适用")));
assert.ok(period01.materialGroups.some((group) => group.items.some((item) => item.displayName === "课件讲义版：类案检索与法律适用")));
assert.ok(period01.materialGroups.some((group) => group.items.some((item) => item.displayName === "专题阅读：司法裁判的“同”与“不同”")));
```

with:

```js
assert.ok(Array.isArray(period01.materialGroups));
if (hasCoursePackageRoot()) {
  assert.ok(period01.materialGroups.some((group) => group.title === "课程资料"));
  assert.ok(period01.materialGroups.some((group) => group.items.some((item) => item.displayName === "课程课件：类案检索与法律适用")));
  assert.ok(period01.materialGroups.some((group) => group.items.some((item) => item.displayName === "课件讲义版：类案检索与法律适用")));
  assert.ok(period01.materialGroups.some((group) => group.items.some((item) => item.displayName === "专题阅读：司法裁判的“同”与“不同”")));
} else {
  assert.equal(period01.materialGroups.length, 0);
}
```

Replace:

```js
assert.ok(period06.materialGroups.some((group) => group.title === "佐证材料"));
```

with:

```js
if (hasCoursePackageRoot()) {
  assert.ok(period06.materialGroups.some((group) => group.title === "佐证材料"));
} else {
  assert.equal(period06.materialGroups.length, 0);
}
```

- [ ] **Step 3: Add explicit availability test**

Append to `tests/core/course-package.test.mjs`:

```js
test("course package root availability is explicit for reproducible tests", () => {
  assert.equal(typeof hasCoursePackageRoot(), "boolean");
});
```

- [ ] **Step 4: Run course package tests**

Run:

```bash
node --test tests/core/course-package.test.mjs
```

Expected: passes whether the external course package folder exists or not.

- [ ] **Step 5: Commit**

Run:

```bash
git add lib/course-package.js tests/core/course-package.test.mjs
git commit -m "test: make course package assertions environment-aware"
```

---

## Task 7: Wire Copy Policy Into Existing Public Copy Tests

**Files:**

- Modify: `tests/core/public-copy-tone.test.mjs`

- [ ] **Step 1: Import centralized policy**

Modify `tests/core/public-copy-tone.test.mjs`.

Add import:

```js
import { loadCopyPolicy } from "../../lib/content/copy-policy.js";
```

- [ ] **Step 2: Replace hardcoded forbidden arrays**

Replace the `FORBIDDEN_PATTERNS` definition with:

```js
const COPY_POLICY = loadCopyPolicy();
const FORBIDDEN_PATTERNS = COPY_POLICY.forbiddenPatterns.map((term) => new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"));
```

Replace the `FORBIDDEN_PUBLIC_REVIEW_PATTERNS` definition with:

```js
const FORBIDDEN_PUBLIC_REVIEW_PATTERNS = COPY_POLICY.forbiddenPublicReviewPatterns.map((term) => new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"));
```

- [ ] **Step 3: Use policy for incomplete-state wording**

In the test `"public-facing source copy avoids incomplete-state wording in expert-visible flows"`, replace:

```js
for (const text of ["Word 原文待补充", "PDF 预览待补充", "案号待补充", "法院待补充", "日期待补充", "线上提交入口暂未开放", "提交研习"]) {
  assert.equal(sources.includes(text), false, `found incomplete public wording: ${text}`);
}
```

with:

```js
for (const text of COPY_POLICY.forbiddenIncompleteStatePhrases) {
  assert.equal(sources.includes(text), false, `found incomplete public wording: ${text}`);
}
```

- [ ] **Step 4: Use policy for production wording**

In the test `"public course-system source avoids production-process wording in visible flows"`, replace the hardcoded regex:

```js
assert.equal(/章节配音稿与内容导图|内容展开页|材料页|配音稿|制作层文件|\.pptx/u.test(sources), false);
```

with:

```js
for (const text of COPY_POLICY.forbiddenProductionPhrases) {
  assert.equal(sources.includes(text), false, `found production-process wording: ${text}`);
}
assert.equal(/配音稿|\.pptx/u.test(sources), false);
```

- [ ] **Step 5: Run public copy tests**

Run:

```bash
node --test tests/core/public-copy-tone.test.mjs tests/core/content-validation.test.mjs
```

Expected: both test files pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add tests/core/public-copy-tone.test.mjs
git commit -m "test: read public copy rules from content policy"
```

---

## Task 8: Full Verification and Final Cleanup

**Files:**

- Modify only if previous tasks reveal small consistency issues.

- [ ] **Step 1: Run content validation**

Run:

```bash
npm run validate:content
```

Expected: `Content validation passed.`

- [ ] **Step 2: Run asset audit**

Run:

```bash
npm run audit:assets
```

Expected: `Asset audit passed. Checked 210 cases and 8 video entries.`

- [ ] **Step 3: Run core tests**

Run:

```bash
npm run test:core
```

Expected: all tests pass. The previous failure in `course-package.test.mjs` must be resolved.

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: build completes successfully and generates the static export.

- [ ] **Step 5: Inspect git status**

Run:

```bash
git status --short
```

Expected:

- Only intentional tracked changes remain, or the working tree is clean.
- Existing unrelated untracked files may remain ignored after `.gitignore` update.

- [ ] **Step 6: Final commit if cleanup changes were needed**

If Step 5 shows additional intentional tracked edits, run:

```bash
git add <changed-files>
git commit -m "chore: finalize content maintenance foundation"
```

If there are no additional intentional tracked edits, do not create an empty commit.

---

## Implementation Notes

- Do not migrate periods 02-08 in this plan.
- Do not move homepage, impact, or video content in this plan.
- Do not add `zod` or any other schema dependency in this plan.
- Preserve static export behavior in `next.config.mjs`.
- Keep route outputs unchanged after period 01 migration; this plan changes content ownership, not public page design.

## Self-Review

- Spec coverage: This plan covers maintenance documentation, `content/` creation, centralized copy policy, validation command, asset audit command, one migrated course sample, reproducible external package tests, and the final verification chain.
- Scope control: This plan intentionally does not migrate all content categories. It creates the foundation and one representative course migration.
- Placeholder scan: The plan contains concrete file paths, commands, expected results, and code snippets for implementation steps.
- Type consistency: Content helpers use ESM exports, JSON payloads, and existing Node test conventions already used in the repository.
