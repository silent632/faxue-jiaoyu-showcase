# Homepage Video Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首页新增一个“主视频 + 辅助视频”的视频展示板块，通过外链跳转承接课程视频成果展示。

**Architecture:** 保持现有首页结构，只在“课程与资源总览”和“建设成效收束”之间插入一个首页专属视频区块。视频数据集中放在首页内容配置里，页面层只负责渲染主视频与辅助视频，样式层通过统一封面卡和响应式网格保证成品感。

**Tech Stack:** Next.js App Router, React Server Components, local content builder, global CSS, Node test runner

---

### Task 1: Add Homepage Video Data

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/showcase-content.js`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

- [ ] **Step 1: Write the failing content test**

```js
test("homepage content exposes a featured video and supporting video list", () => {
  const content = buildShowcaseContent();

  assert.ok(content.homeVideoBlock);
  assert.equal(content.homeVideoBlock.featured.slug, "course-01-part-1");
  assert.equal(content.homeVideoBlock.supporting.length, 6);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

Expected: FAIL because the homepage video block data does not exist yet.

- [ ] **Step 3: Add the video block data**

```js
homeVideoBlock: {
  title: "课程视频展示",
  description: "通过课程视频回看双师课堂组织、案例进入方式与研习引导过程。",
  featured: {
    slug: "course-01-part-1",
    label: "主视频",
    title: "第一期上（一） 类案检索与法律适用",
    summary: "围绕第一期课程的进入部分，展示如何从案例检索进入法理学习。",
    purpose: "适用于课程展示与教学观摩。",
    href: "https://llm2x7.58u.cn/a/OkJ17Qn/",
  },
  supporting: [
    { slug: "course-01-part-2", title: "...", summary: "...", purpose: "...", href: "..." },
  ],
}
```

- [ ] **Step 4: Use stable metadata for all seven links**

```js
[
  "https://llm2x7.58u.cn/a/OkJ17Qn/",
  "https://llm2x7.58u.cn/a/b1PMnBj/",
  "https://llm2x7.58u.cn/a/AQy9W5M/",
  "https://llm2x7.58u.cn/a/bwX3kJQ/",
  "https://llm2x7.58u.cn/a/Rn83yvz/",
  "https://llm2x7.58u.cn/a/Rj3Z7jX/",
  "https://llm2x7.58u.cn/a/OzdXyrQ/",
]
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add lib/showcase-content.js tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: add homepage video block content"
```

Expected: test PASS, commit created.

### Task 2: Render The Homepage Video Block

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/page.js`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

- [ ] **Step 1: Write the failing homepage structure test**

```js
test("homepage renders a dedicated video block between overview and impact", () => {
  const source = readFileSync(new URL("../../app/page.js", import.meta.url), "utf8");

  assert.match(source, /homepage-video-block/u);
  assert.match(source, /homepage-video-featured/u);
  assert.match(source, /homepage-video-grid/u);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

Expected: FAIL because homepage does not yet render the video section.

- [ ] **Step 3: Insert the video block in the approved location**

```jsx
<section className="homepage-video-block showcase-card" aria-label="课程视频展示">
  <div className="homepage-video-featured">...</div>
  <div className="homepage-video-grid">...</div>
</section>
```

- [ ] **Step 4: Render video links with safe external-link behavior**

```jsx
<a href={item.href} target="_blank" rel="noreferrer" className="homepage-video-link">
  点击观看
</a>
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/page.js tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: render homepage video showcase block"
```

Expected: test PASS, commit created.

### Task 3: Add Unified Video Cover Cards And Layout Styles

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

- [ ] **Step 1: Write the failing style guard test**

```js
test("homepage video block styles support featured and supporting card layouts", () => {
  const source = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.homepage-video-block/u);
  assert.match(source, /\.homepage-video-featured/u);
  assert.match(source, /\.homepage-video-grid/u);
  assert.match(source, /\.homepage-video-cover/u);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

Expected: FAIL because video block styles are not defined yet.

- [ ] **Step 3: Add homepage video block layout and cover styles**

```css
.homepage-video-block {
  margin-top: 24px;
  padding: 28px;
  border-radius: 28px;
}

.homepage-video-featured {
  display: grid;
  grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.2fr);
  gap: 18px;
}

.homepage-video-cover {
  display: grid;
  align-content: end;
  min-height: 240px;
}
```

- [ ] **Step 4: Add responsive rules**

```css
@media (max-width: 920px) {
  .homepage-video-featured,
  .homepage-video-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/globals.css tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: style homepage video showcase block"
```

Expected: test PASS, commit created.

### Task 4: Polish Video Copy And Final Verification

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/showcase-content.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`
- Output: `/Users/silent/Projects/faxue-jiaoyu-showcase/output/playwright/`

- [ ] **Step 1: Add a copy guard test**

```js
test("homepage video copy stays visitor-facing and avoids internal wording", () => {
  const text = JSON.stringify(buildShowcaseContent().homeVideoBlock);

  assert.equal(/演示|执行|任务|评审/u.test(text), false);
});
```

- [ ] **Step 2: Run test to verify it passes after copy polish**

Run: `node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`

Expected: PASS once copy is visitor-facing.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run test:core
npm run build
curl -I http://127.0.0.1:3011
```

Expected:

```text
- 全部核心测试通过
- 生产构建通过
- 本地站点返回 200 OK
```

- [ ] **Step 4: Capture the refreshed homepage**

Run:

```bash
npx playwright screenshot --browser=chromium --device="Desktop Chrome HiDPI" http://127.0.0.1:3011 /Users/silent/Projects/faxue-jiaoyu-showcase/output/playwright/home-video-block-desktop.png
npx playwright screenshot --browser=chromium --viewport-size=390,844 http://127.0.0.1:3011 /Users/silent/Projects/faxue-jiaoyu-showcase/output/playwright/home-video-block-mobile.png
```

- [ ] **Step 5: Commit**

Run:

```bash
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/page.js app/globals.css lib/showcase-content.js tests/core/homepage-content.test.mjs output/playwright/home-video-block-desktop.png output/playwright/home-video-block-mobile.png
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: add homepage video showcase section"
```

Expected: verification complete, screenshots updated, commit created.

---

## Self-Review

- Spec coverage: 覆盖了首页单独视频板块、主视频+辅助视频结构、7 个外链接入、统一封面卡、首页位置要求和桌面/窄屏验证。
- Placeholder scan: 已去掉空泛描述，保留了明确文件、测试、命令与预期结果。
- Type consistency: 统一使用 `homeVideoBlock`、`featured`、`supporting`、`homepage-video-*` 命名，避免和其他首页模块混淆。
