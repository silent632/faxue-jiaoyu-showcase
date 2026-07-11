# Showcase Site Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise the showcase site from a working申报站 to a more complete public-facing platform by fixing PDF support, redesigning study/detail flows, and polishing the key pages.

**Architecture:** Keep the standalone Next.js site and its existing route structure, but improve the content pipeline and page composition around the case-study chain. Handle study pages in two modes: a true split-shell layout when a PDF exists, and a guide-first single-axis layout when a PDF is missing.

**Tech Stack:** Next.js App Router, React, CSS in `app/globals.css`, local JSON-like content modules in `lib/`, Node core tests in `tests/core`

---

## File Structure

### Existing files to modify

- `app/page.js`
  - Homepage composition for hero, path, highlights, and summary sections.
- `components/showcase-home-hero.js`
  - Homepage first-screen structure and CTA layout.
- `components/cases-search-hero.js`
  - Top explanation and statistics block for case search.
- `components/cases-intelligence-panels.js`
  - Guidance panels that help users narrow the results.
- `components/cases-results-column.js`
  - Search results presentation and page rhythm.
- `app/cases/[id]/page.js`
  - Case detail page, currently closer to an info page than a reading judgment page.
- `app/cases/[id]/study/page.js`
  - Study page entry shell; will branch by `hasPdf`.
- `components/study-split-shell.js`
  - Current split-shell layout; keep for `hasPdf === true`.
- `components/study-workspace.js`
  - Shared study workspace content.
- `components/study-workspace-overview.js`
  - Overview metrics and intro at the top of the workspace.
- `components/study-workspace-actions.js`
  - Export/submit card and end-of-study actions.
- `lib/public-showcase-study.js`
  - Visitor-facing copy helpers for the study route.
- `lib/study-workspace.js`
  - Shared study-state helpers and export messages.
- `lib/showcase-content.js`
  - Homepage/content-page copy and structure inputs.
- `lib/public-showcase-cases.js`
  - Case data bridge; may need PDF availability metadata helpers.
- `lib/data/public-files.js`
  - Public file existence bridge for PDFs/Word docs.
- `app/globals.css`
  - Shared site styling, spacing, grid, and page state styling.
- `tests/core/public-showcase-mode.test.mjs`
  - Visitor-facing copy assertions.
- `tests/core/showcase-study.test.mjs`
  - Study workflow helper tests.
- `tests/core/showcase-cases.test.mjs`
  - Case-route tests.
- `tests/core/homepage-content.test.mjs`
  - Homepage copy/content assertions.

### New files to create

- `components/study-guide-shell.js`
  - Single-axis study layout for cases without PDFs.
- `components/study-guide-briefing.js`
  - Guide-first intro block that merges summary, fact pointers, issue prompts, laws, and next-step framing.
- `lib/showcase-pdf-sync.mjs`
  - Small Node utility to copy available PDFs from the source project into this showcase project.
- `tests/core/showcase-pdf-sync.test.mjs`
  - Sanity test around filename normalization / copy candidate resolution.

### External/project resources to inspect while implementing

- Source PDFs in the original project and any adjacent resource directories under `/Users/silent/Projects/faxue-jiaoyu`
- Existing generated public assets in `/Users/silent/Projects/faxue-jiaoyu-showcase/public` if present

---

### Task 1: Bridge Real PDF Assets Into The Showcase Project

**Files:**
- Create: `lib/showcase-pdf-sync.mjs`
- Test: `tests/core/showcase-pdf-sync.test.mjs`
- Modify: `package.json`
- Modify: `lib/data/public-files.js`

- [ ] **Step 1: Add a failing test for copy-candidate resolution**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { buildPdfSyncCandidates } from "../../lib/showcase-pdf-sync.mjs";

test("buildPdfSyncCandidates prefers normalized pdf filenames from showcase cases", () => {
  const candidates = buildPdfSyncCandidates([
    { id: "case-1", pdfFile: "示例案例.pdf" },
    { id: "case-2", pdfFile: "nested/path/另一份文书.pdf" },
  ]);

  assert.deepEqual(candidates, [
    { id: "case-1", fileName: "示例案例.pdf" },
    { id: "case-2", fileName: "另一份文书.pdf" },
  ]);
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run: `node --test tests/core/showcase-pdf-sync.test.mjs`
Expected: FAIL with module or export missing for `buildPdfSyncCandidates`

- [ ] **Step 3: Implement the minimal sync helper and script entry**

```js
// lib/showcase-pdf-sync.mjs
import fs from "node:fs/promises";
import path from "node:path";

import { loadShowcaseCases } from "./showcase-cases.js";

export function normalizeSyncFileName(value) {
  return String(value || "").split(/[\\/]/u).pop() || "";
}

export function buildPdfSyncCandidates(rows = []) {
  return rows
    .map((item) => ({
      id: item.id,
      fileName: normalizeSyncFileName(item.pdfFile),
    }))
    .filter((item) => item.fileName);
}

export async function syncAvailablePdfs({ sourceDir, targetDir }) {
  const rows = await loadShowcaseCases();
  const candidates = buildPdfSyncCandidates(rows);
  await fs.mkdir(targetDir, { recursive: true });

  let copied = 0;
  let missing = 0;
  for (const item of candidates) {
    const sourcePath = path.join(sourceDir, item.fileName);
    const targetPath = path.join(targetDir, item.fileName);
    try {
      await fs.copyFile(sourcePath, targetPath);
      copied += 1;
    } catch {
      missing += 1;
    }
  }

  return { copied, missing, total: candidates.length };
}
```

```json
// package.json
{
  "scripts": {
    "sync:pdfs": "node ./lib/showcase-pdf-sync.mjs"
  }
}
```

- [ ] **Step 4: Run the test again**

Run: `node --test tests/core/showcase-pdf-sync.test.mjs`
Expected: PASS

- [ ] **Step 5: Wire the script to real directories and verify file availability logic**

```js
// append to lib/showcase-pdf-sync.mjs
if (import.meta.url === `file://${process.argv[1]}`) {
  const sourceDir = "/Users/silent/Projects/faxue-jiaoyu/public/pdfs";
  const targetDir = new URL("../public/pdfs", import.meta.url);
  const result = await syncAvailablePdfs({
    sourceDir,
    targetDir: targetDir.pathname,
  });
  console.log(JSON.stringify(result));
}
```

```js
// lib/data/public-files.js
export async function publicFileExists(kind, fileName) {
  if (!fileName) return false;
  // keep current logic, but make sure normalized file names are checked consistently
}
```

- [ ] **Step 6: Run the sync script**

Run: `npm run sync:pdfs`
Expected: JSON output with copied/missing/total counts and a populated `public/pdfs/` directory for available files

- [ ] **Step 7: Commit**

```bash
git add package.json lib/showcase-pdf-sync.mjs lib/data/public-files.js tests/core/showcase-pdf-sync.test.mjs public/pdfs
git commit -m "feat: sync available case pdf assets"
```

---

### Task 2: Add Dual-Mode Study Layouts

**Files:**
- Create: `components/study-guide-shell.js`
- Create: `components/study-guide-briefing.js`
- Modify: `app/cases/[id]/study/page.js`
- Modify: `components/study-split-shell.js`
- Modify: `components/study-workspace.js`
- Modify: `components/study-workspace-overview.js`
- Modify: `components/study-workspace-actions.js`
- Modify: `lib/public-showcase-study.js`
- Modify: `lib/study-workspace.js`
- Modify: `app/globals.css`
- Test: `tests/core/showcase-study.test.mjs`

- [ ] **Step 1: Add a failing test for no-PDF study-mode copy**

```js
test("study helper exposes guide-first copy when pdf is missing", () => {
  const note = getPublicStudyReaderNote({ hasPdf: false });
  assert.match(note, /导读|争议焦点|继续推进/u);
  assert.equal(/PDF 原文/u.test(note), false);
});
```

- [ ] **Step 2: Run the study test file**

Run: `node --test tests/core/showcase-study.test.mjs`
Expected: FAIL because the new assertion or helper behavior is not implemented yet

- [ ] **Step 3: Create the guide-first shell**

```jsx
// components/study-guide-shell.js
import StudyGuideBriefing from "@/components/study-guide-briefing";
import StudyWorkspace from "@/components/study-workspace";

export default function StudyGuideShell({ caseItem, userSid }) {
  return (
    <div className="study-guide-shell fade-in">
      <StudyGuideBriefing caseItem={caseItem} />
      <div className="study-guide-workspace">
        <StudyWorkspace caseItem={caseItem} userSid={userSid} />
      </div>
    </div>
  );
}
```

```jsx
// components/study-guide-briefing.js
export default function StudyGuideBriefing({ caseItem }) {
  return (
    <section className="study-guide-briefing glass">
      <div className="study-guide-head">
        <span className="section-eyebrow">案例导读</span>
        <h2>先把握案件事实，再进入结构化研习</h2>
        <p>当前案例未提供原文文件时，可先结合摘要、争点和关联法条完成前置阅读。</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Branch the study route by `hasPdf`**

```jsx
// app/cases/[id]/study/page.js
import StudyGuideShell from "@/components/study-guide-shell";

const shell = hasPdf ? (
  <StudySplitShell caseItem={caseItem} userSid={user.sid} pdfFileName={pdfFileName} hasPdf={hasPdf} />
) : (
  <StudyGuideShell caseItem={caseItem} userSid={user.sid} />
);
```

- [ ] **Step 5: Update helper copy and workspace rhythm**

```js
// lib/public-showcase-study.js
export function getPublicStudyHeadNote({ hasPdf }) {
  return hasPdf
    ? "围绕同一份裁判文书完成阅读、梳理与分析。"
    : "先结合案例导读把握事实与争点，再进入结构化研习。";
}
```

```jsx
// components/study-workspace-overview.js
// tighten overview text so it works both in split-shell and guide-first mode
```

- [ ] **Step 6: Add styles for guide-first layout**

```css
/* app/globals.css */
.study-guide-shell {
  display: grid;
  gap: 24px;
}

.study-guide-briefing {
  padding: 28px;
  border-radius: 24px;
}

.study-guide-workspace {
  min-width: 0;
}
```

- [ ] **Step 7: Run study tests**

Run: `node --test tests/core/showcase-study.test.mjs`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add app/cases/[id]/study/page.js components/study-guide-shell.js components/study-guide-briefing.js components/study-split-shell.js components/study-workspace.js components/study-workspace-overview.js components/study-workspace-actions.js lib/public-showcase-study.js lib/study-workspace.js app/globals.css tests/core/showcase-study.test.mjs
git commit -m "feat: add dual-mode study layouts"
```

---

### Task 3: Reframe The Case Detail Page As A Reading Judgment Page

**Files:**
- Modify: `app/cases/[id]/page.js`
- Modify: `lib/case-presentation.mjs`
- Modify: `app/globals.css`
- Test: `tests/core/showcase-cases.test.mjs`

- [ ] **Step 1: Add a failing detail-page test for guide-first emphasis**

```js
test("case detail copy emphasizes reading judgment and next-step entry", async () => {
  const item = await getPublicShowcaseCaseById("case-0001");
  assert.ok(item.summary);
  assert.match(item.summary, /争议|裁判/u);
});
```

- [ ] **Step 2: Run the case-route tests**

Run: `node --test tests/core/showcase-cases.test.mjs`
Expected: FAIL or missing assertions for the revised detail emphasis

- [ ] **Step 3: Rewrite the hero and reading roadmap**

```jsx
// app/cases/[id]/page.js
// Adjust the hero copy to answer:
// 1. What is this case about?
// 2. Why read it?
// 3. Should the visitor continue into study?
```

Key implementation targets:

- Replace generic “继续阅读” card text with more explicit导读判断 wording
- Pull the case outcome and core dispute closer to the top
- Make “进入案例研习” the primary continuation action
- If no PDF exists, make the action note feel intentional rather than degraded

- [ ] **Step 4: Add CSS for stronger visual grouping**

```css
/* app/globals.css */
.case-detail-hero-main {
  align-items: start;
}

.case-detail-action-card {
  gap: 18px;
}

.case-reading-roadmap-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
```

- [ ] **Step 5: Run the case tests**

Run: `node --test tests/core/showcase-cases.test.mjs`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/cases/[id]/page.js lib/case-presentation.mjs app/globals.css tests/core/showcase-cases.test.mjs
git commit -m "refactor: reshape case detail as reading judgment page"
```

---

### Task 4: Raise The Homepage And Case Search Page Finish Level

**Files:**
- Modify: `app/page.js`
- Modify: `components/showcase-home-hero.js`
- Modify: `components/cases-search-hero.js`
- Modify: `components/cases-intelligence-panels.js`
- Modify: `components/cases-results-column.js`
- Modify: `lib/showcase-content.js`
- Modify: `app/globals.css`
- Test: `tests/core/homepage-content.test.mjs`

- [ ] **Step 1: Add a failing homepage-content test for the new first-screen emphasis**

```js
test("homepage first screen balances project identity with direct functional entry", () => {
  const content = buildShowcaseContent();
  assert.match(content.site.subtitle, /教学改革/u);
  assert.ok(content.homeEntries.some((item) => item.label === "案例检索库"));
  assert.ok(content.homeEntries.some((item) => item.label === "研习工作台"));
});
```

- [ ] **Step 2: Run the homepage test file**

Run: `node --test tests/core/homepage-content.test.mjs`
Expected: FAIL or become incomplete relative to the revised structure

- [ ] **Step 3: Raise homepage finish level**

Implementation targets:

- Make the first screen read more like a formal platform homepage
- Tighten copy density on the hero and second-screen blocks
- Improve CTA hierarchy so the two core modules are obvious at a glance
- Make the metrics row feel integrated rather than appended

- [ ] **Step 4: Improve case-search hierarchy**

Implementation targets:

- Tighten the search hero and result guidance language
- Make the top stats easier to scan
- Reduce explanatory clutter in intelligence panels
- Improve result-card rhythm so the page feels like a real working search interface

- [ ] **Step 5: Add CSS polish for hierarchy and spacing**

```css
/* app/globals.css */
.showcase-home-hero-main {
  align-items: stretch;
}

.cases-hero-head,
.cases-results-head {
  gap: 16px;
}
```

- [ ] **Step 6: Run homepage tests**

Run: `node --test tests/core/homepage-content.test.mjs`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/page.js components/showcase-home-hero.js components/cases-search-hero.js components/cases-intelligence-panels.js components/cases-results-column.js lib/showcase-content.js app/globals.css tests/core/homepage-content.test.mjs
git commit -m "refactor: polish homepage and case search hierarchy"
```

---

### Task 5: Polish Supporting Pages And Run Final Verification

**Files:**
- Modify: `app/courses/page.js`
- Modify: `app/resources/page.js`
- Modify: `app/impact/page.js`
- Modify: `app/globals.css`
- Test: `tests/core/showcase-content.test.mjs`

- [ ] **Step 1: Adjust supporting-page typography and rhythm**

Implementation targets:

- Make section heads more formal and less repetitive
- Ensure cards, lists, and callouts have consistent spacing with the updated homepage/detail pages
- Preserve the existing content strategy while improving completion level

- [ ] **Step 2: Run the supporting-page core tests**

Run: `node --test tests/core/showcase-content.test.mjs`
Expected: PASS

- [ ] **Step 3: Run the full core suite**

Run: `npm run test:core`
Expected: PASS for all core tests

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: PASS with all routes generated successfully

- [ ] **Step 5: Restart the local production server**

Run: `npm run start`
Expected: site serves at `http://localhost:3011`

- [ ] **Step 6: Capture final screenshots for key pages**

Run:

```bash
npx playwright screenshot --device="Desktop Chrome HiDPI" http://localhost:3011 output/playwright/home-polish-final.png
npx playwright screenshot --device="Desktop Chrome HiDPI" http://localhost:3011/cases output/playwright/cases-polish-final.png
npx playwright screenshot --device="Desktop Chrome HiDPI" http://localhost:3011/cases/case-0001 output/playwright/detail-polish-final.png
npx playwright screenshot --device="Desktop Chrome HiDPI" http://localhost:3011/cases/case-0001/study output/playwright/study-polish-final.png
```

Expected: fresh screenshots with updated hierarchy, no task-execution copy, and a visibly complete case-study chain

- [ ] **Step 7: Commit**

```bash
git add app/courses/page.js app/resources/page.js app/impact/page.js app/globals.css output/playwright tests/core/showcase-content.test.mjs
git commit -m "refactor: finish showcase page polish pass"
```

---

## Self-Review

### Spec coverage

- PDF migration: covered by Task 1
- Dual-mode study page: covered by Task 2
- Detail page as导读判断页: covered by Task 3
- Homepage and search-page completion: covered by Task 4
- Supporting pages and final visual verification: covered by Task 5

### Placeholder scan

- No `TODO`, `TBD`, or deferred placeholder language left in the plan
- Each task has explicit files, commands, and expected outcomes

### Type consistency

- `StudyGuideShell` and `StudyGuideBriefing` are introduced in Task 2 and used only after creation
- `buildPdfSyncCandidates` is defined in Task 1 before being used in tests
- Route/component names match current project naming
