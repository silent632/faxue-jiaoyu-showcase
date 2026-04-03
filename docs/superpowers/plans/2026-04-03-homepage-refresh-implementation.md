# Homepage Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重做展示站首页，使其更像一个完成度高、真实可用的高校法学项目平台首页，同时不影响其他页面结构。

**Architecture:** 保留现有内容数据源与路由结构，只重组首页的组件层次、文案编排与样式表现。实现上以首页专属 hero、链路区、案例预览区、概览区和成效收束区为主，通过组件调整和首页定向样式提升首屏辨识度与截图质量。

**Tech Stack:** Next.js App Router, React Server Components, existing local content builders, global CSS, Node test runner

---

### Task 1: Reshape Homepage Content Hierarchy

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/showcase-content.js`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

- [ ] **Step 1: Write the failing content test**

```js
test("homepage content supports hero hall and compact overview sections", () => {
  const content = buildShowcaseContent();

  assert.equal(content.homeHero.primaryModules.length, 3);
  assert.ok(content.homeHero.metricsIntro);
  assert.equal(content.homeCasePreview.length >= 3, true);
  assert.equal(content.homeOverview.length, 2);
  assert.ok(content.homeImpactClosing);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

Expected: FAIL because the new homepage content groups do not exist yet.

- [ ] **Step 3: Add the minimal content structure**

```js
homeHero: {
  ...existingHero,
  metricsIntro: "从案例、课程与平台运行三条线索快速进入平台。",
  primaryModules: [
    { href: "/cases", label: "案例检索库", description: "围绕真实案例建立稳定的检索起点。" },
    { href: canonicalStudyHref, label: "研习工作台", description: "围绕文书完成结构化研习。" },
    { href: "/courses", label: "课程体系", description: "查看八期双师课程的连续编排。" },
  ],
},
homeCasePreview: featuredCases.slice(0, 3).map((item) => ({
  id: item.id,
  href: `/cases/${item.id}`,
  title: item.title,
  meta: item.caseNumber || "典型案例",
})),
homeOverview: [
  { href: "/courses", title: "课程体系", description: "八期课程形成连续推进的双师教学结构。" },
  { href: "/resources", title: "教学资源", description: "标准化材料支撑课程实施与研习过程。" },
],
homeImpactClosing: {
  href: "/impact",
  title: "建设成效",
  description: "平台、课程与资源建设已形成可展示、可引用的整体成果。",
},
```

- [ ] **Step 4: Rebuild homepage assembly with the new sections**

```jsx
<ShowcaseHomeHero ... />
<section className="homepage-path-band">...</section>
<section className="homepage-case-preview">...</section>
<section className="homepage-overview">...</section>
<section className="homepage-impact-closing">...</section>
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/page.js lib/showcase-content.js tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "refactor: restructure homepage content hierarchy"
```

Expected: test PASS, commit created.

### Task 2: Rebuild the Hero Hall

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-home-hero.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

- [ ] **Step 1: Write the failing hero structure test**

```js
test("homepage hero exposes left narrative and right module hall", () => {
  const source = readFileSync(new URL("../../components/showcase-home-hero.js", import.meta.url), "utf8");

  assert.match(source, /showcase-home-hall/u);
  assert.match(source, /showcase-home-hall-main/u);
  assert.match(source, /showcase-home-hall-aside/u);
  assert.equal(source.includes("核心入口一"), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

Expected: FAIL because the current hero still uses the older structure and labels.

- [ ] **Step 3: Replace the hero markup**

```jsx
<section className="showcase-home-hall">
  <div className="showcase-home-hall-main">
    <div className="showcase-home-hall-copy">...</div>
    <aside className="showcase-home-hall-aside">
      {heroContent.primaryModules.map((item) => (
        <Link key={item.href} href={item.href} className="showcase-home-module-card">...</Link>
      ))}
    </aside>
  </div>
</section>
```

- [ ] **Step 4: Add homepage-specific hero styling**

```css
.showcase-home-hall {
  display: grid;
  gap: 20px;
  padding: 18px 0 12px;
}

.showcase-home-hall-main {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.9fr);
  gap: 24px;
  align-items: stretch;
}

.showcase-home-module-card {
  display: grid;
  gap: 10px;
  padding: 22px;
  border-radius: 22px;
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add components/showcase-home-hero.js app/globals.css tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: rebuild homepage hero hall"
```

Expected: test PASS, commit created.

### Task 3: Replace Repetitive Sections With Homepage-Specific Blocks

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

- [ ] **Step 1: Write the failing homepage structure test**

```js
test("homepage uses homepage-specific sections instead of repeating generic cards", () => {
  const source = readFileSync(new URL("../../app/page.js", import.meta.url), "utf8");

  assert.match(source, /homepage-path-band/u);
  assert.match(source, /homepage-case-preview/u);
  assert.match(source, /homepage-overview-grid/u);
  assert.match(source, /homepage-impact-closing/u);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

Expected: FAIL because the current homepage still relies heavily on generic `ShowcaseSection`.

- [ ] **Step 3: Rebuild the homepage body**

```jsx
<section className="homepage-path-band">...</section>
<section className="homepage-case-preview">...</section>
<section className="homepage-overview-grid">...</section>
<section className="homepage-impact-closing">...</section>
```

- [ ] **Step 4: Add focused layout styles for the four homepage bands**

```css
.homepage-path-band,
.homepage-case-preview,
.homepage-overview-grid,
.homepage-impact-closing {
  margin-top: 24px;
}

.homepage-case-preview-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/page.js app/globals.css tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "refactor: tailor homepage sections for platform entry"
```

Expected: test PASS, commit created.

### Task 4: Polish Homepage Copy And Responsive Rhythm

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-home-hero.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

- [ ] **Step 1: Write the failing copy guard test**

```js
test("homepage copy avoids backstage or explanatory design language", () => {
  const text = [
    readFileSync(new URL("../../app/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../components/showcase-home-hero.js", import.meta.url), "utf8"),
  ].join("\n");

  assert.equal(/首屏首先呈现|平台首页说明|围绕案例研习组织平台首屏/u.test(text), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

Expected: FAIL because the current homepage still contains explanatory phrases about the homepage itself.

- [ ] **Step 3: Replace explanatory copy with visitor-facing homepage copy**

```jsx
<p className="showcase-home-brief">
  平台围绕真实裁判文书组织案例检索、导读阅读与结构化研习，形成面向法理学教学改革的持续学习入口。
</p>
```

- [ ] **Step 4: Tighten mobile layout**

```css
@media (max-width: 920px) {
  .showcase-home-hall-main,
  .homepage-case-preview-list,
  .homepage-overview-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Run tests, full verification, and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs
npm run test:core
npm run build
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/page.js components/showcase-home-hero.js app/globals.css tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "refactor: polish homepage presentation and copy"
```

Expected: homepage-specific tests PASS, full core test suite PASS, production build PASS, commit created.

### Task 5: Browser Verification And Screenshot Readiness

**Files:**
- Verify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/page.js`
- Verify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-home-hero.js`
- Verify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Output: `/Users/silent/Projects/faxue-jiaoyu-showcase/output/playwright/`

- [ ] **Step 1: Start or confirm the local site**

Run:

```bash
curl -I http://127.0.0.1:3011
```

Expected: `HTTP/1.1 200 OK`

- [ ] **Step 2: Capture desktop and mobile homepage states**

Run:

```bash
node /Users/silent/Projects/faxue-jiaoyu-showcase/scripts/capture-homepage.mjs
```

Expected: screenshots for desktop and mobile homepage are written to `output/playwright/` or the existing screenshot target used by this repo.

- [ ] **Step 3: Review for the required outcomes**

Check:

```text
- 首屏焦点是否明确
- 左文右入口面板是否成立
- 首页是否明显区别于普通内容页
- 文案是否仍有内部解释语气
- 截图是否可直接用于项目材料
```

- [ ] **Step 4: If screenshots are acceptable, leave the site running and summarize**

```text
Deliver the refreshed homepage, verification status, and screenshot location.
```

---

## Self-Review

- Spec coverage: 覆盖了首屏门厅、学习链路、真实案例预览、课程资源概览、成效收束、文案约束、响应式验证。
- Placeholder scan: 已避免 TODO/TBD 和空泛步骤；每个任务都给了明确文件、测试与命令。
- Type consistency: 统一使用 `homeCasePreview`、`homeOverview`、`homeImpactClosing`、`showcase-home-hall-*` 等命名，不与现有 cases/study 页面混用。
