# Course Archive Content Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将课程体系从“入口索引 + 空壳档案页”重建为“首页轻联动 + 八期课程导览页 + 八期可阅读单期课程页”的完整内容链路。

**Architecture:** 首页只做轻量联动，课程体系页承担导览职责，单期课程页承担内容阅读职责。课程内容模型集中收口到课程数据层，先把资料包转写成统一的课程结构，再由 `/courses` 和 `/courses/[slug]` 两层页面分别消费，避免页面层直接拼接原始材料。

**Tech Stack:** Next.js App Router, React Server Components, local content builders in `lib/`, global CSS, Node test runner

---

## File Structure

### New Files

- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-archive-content.js`
  - 负责把八期资料转写为统一课程内容结构
  - 输出总览页卡片导读字段和单期页 6 段结构字段

### Modified Files

- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-package.js`
  - 将原始资料扫描结果与新的课程内容结构合并
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/showcase-content.js`
  - 首页 KPI、课程体系入口文案、课程总览页卡片文案来源
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/page.js`
  - 首页 KPI 展示数量与课程体系入口联动文案
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/page.js`
  - 重写为课程导览页
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/page.js`
  - 重写为 6 段结构的内容优先单期页
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
  - 补课程导览卡片和单期页内容区的样式

### Tests

- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

---

### Task 1: Add Homepage KPI And Course Entry Content Guards

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/showcase-content.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/page.js`

- [ ] **Step 1: Write the failing homepage KPI/content tests**

```js
test("homepage dashboard includes cumulative visits and renders all five KPIs", () => {
  const content = buildShowcaseContent();

  assert.ok(content.homeDashboard.kpis.some((item) => item.label === "累计访问量"));
  assert.ok(content.homeDashboard.kpis.some((item) => item.label === "视频播放"));
  assert.equal(content.homeDashboard.kpis.length, 5);
});

test("homepage course entry copy hints at readable course content instead of generic archive wording", () => {
  const content = buildShowcaseContent();
  const source = readFileSync(new URL("../../app/page.js", import.meta.url), "utf8");

  assert.match(JSON.stringify(content.homeResultTracks), /课程内容|课程导览/u);
  assert.match(source, /homepage-console-kpis/u);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs
```

Expected: FAIL because homepage data still uses `平台使用者 / 视频播放 / 活跃用户 / 工作台回访率 / 案例检索使用占比` and the page currently slices KPIs down to 4.

- [ ] **Step 3: Update homepage content data**

```js
homeDashboard: {
  hero: {
    title: "裁判文书研习平台",
    summary: "进入案例检索、课程视频、课程体系和成效展示。",
  },
  kpis: [
    { label: "平台使用者", value: "800+" },
    { label: "累计访问量", value: "5万+" },
    { label: "视频播放", value: "5万+" },
    { label: "活跃用户", value: "320+" },
    { label: "工作台回访率", value: "68%" },
  ],
},
homeResultTracks: [
  {
    title: "课程建设",
    value: "8期课程",
    detail: "进入八期课程导览，查看每期主题、问题和具体内容。",
    href: "/courses",
    actionLabel: "查看课程导览",
  },
]
```

- [ ] **Step 4: Render the full KPI row on the homepage**

```jsx
const quickKpis = content.homeDashboard?.kpis ?? [];
```

```jsx
<div className="homepage-console-kpis" aria-label="首页关键结果">
  {quickKpis.map((item) => (
    <article key={item.label} className="homepage-console-kpi">
      <span>{item.label}</span>
      <strong>{item.value}</strong>
    </article>
  ))}
</div>
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/page.js lib/showcase-content.js tests/core/homepage-content.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: update homepage KPI and course entry copy"
```

Expected: homepage content test PASS, commit created.

---

### Task 2: Create A Unified Course Archive Content Builder

**Files:**
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-archive-content.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs`

- [ ] **Step 1: Write the failing course content model tests**

```js
test("course package exposes readable archive content for overview and detail pages", () => {
  const period01 = getCoursePackagePeriodBySlug("course-period-01");
  const period07 = getCoursePackagePeriodBySlug("course-period-07");

  assert.ok(period01.archiveCard);
  assert.ok(period01.archiveCard.lead);
  assert.equal(period01.archiveCard.keyPoints.length >= 2, true);

  assert.ok(period07.detailContent);
  assert.ok(period07.detailContent.intro);
  assert.equal(period07.detailContent.keyQuestions.length >= 3, true);
  assert.equal(period07.detailContent.sections.length >= 3, true);
  assert.equal(period07.detailContent.materialHighlights.length >= 2, true);
  assert.equal(period07.detailContent.learningTakeaways.length >= 2, true);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs
```

Expected: FAIL because `archiveCard` and `detailContent` do not exist yet.

- [ ] **Step 3: Add the new content builder file**

```js
export function buildCourseArchiveContent(period, raw) {
  return {
    archiveCard: {
      lead: "以类案检索为起点，进入裁判文书阅读、争点识别与表达训练。",
      keyPoints: ["类案检索", "争点识别", "导读训练"],
      contentType: "课堂问题推进",
    },
    detailContent: {
      intro: [
        "第一期把抽象法律方法落到可操作的检索路径上。",
        "课程从真实争议切入，逐步进入案例导读与表达训练。",
      ],
      keyQuestions: [
        "为什么同类案件会出现不同裁判路径？",
        "类案检索如何帮助进入法律适用判断？",
        "导读判断应当抓住哪些争点？",
      ],
      sections: [
        { title: "从检索进入案例", body: "先通过真实争议搭建检索范围，再从类案结果中挑出具有比较价值的裁判文书。" },
        { title: "从阅读识别争点", body: "围绕事实认定、法律关系和裁判理由展开导读，训练学生在阅读中识别争点。" },
        { title: "从讨论转向表达", body: "把讨论结果转成课堂表达任务，让学生尝试用检索材料支撑自己的判断。" },
      ],
      materialHighlights: [
        { title: "课件内容", summary: "课件负责搭建类案检索、阅读路径和争点提炼的课堂主线。" },
        { title: "专题阅读", summary: "专题阅读补充了同案不同判背后的裁量空间与技术辅助问题。" },
      ],
      teachingDesign: {
        summary: "双师围绕案例进入、问题追问和表达训练分工推进。",
        bullets: ["理论教师负责方法框架和争点提炼。", "实务教师负责结合裁判经验补充检索与判断路径。"],
      },
      learningTakeaways: ["能够建立类案检索到文书导读的基本路径。", "能够围绕具体争点组织初步的法理表达。"],
    },
  };
}
```

- [ ] **Step 4: Cover both early-period and late-period material shapes**

```js
const PERIOD_CONTENT_FALLBACKS = {
  第一期: {
    archiveCard: {
      lead: "从类案检索进入裁判文书阅读，逐步建立争点识别与导读判断。",
      keyPoints: ["类案检索", "争点识别", "导读训练"],
      contentType: "课堂问题推进",
    },
  },
  第五期: {
    archiveCard: {
      lead: "围绕非法证据排除规则，重建程序正义与权利保障的课程主线。",
      keyPoints: ["非法证据排除", "程序正义", "权利保障"],
      contentType: "示范课程内容重构",
    },
  },
  第八期: {
    archiveCard: {
      lead: "从生成式 AI 作品认定争议切入，讨论作品边界、作者资格与责任分配。",
      keyPoints: ["生成式AI", "作品认定", "责任边界"],
      contentType: "专题问题导览",
    },
  },
};
```

For `第五期` to `第八期`, derive readable content from:

```js
["章节配音稿", "资料包制作清单", "逐页时长表", "时长审核结论"]
```

The builder must output normal course content, not file-process descriptions.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add lib/course-archive-content.js tests/core/course-package.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: add course archive content builder"
```

Expected: course package test PASS, commit created.

---

### Task 3: Attach Archive Content To The Course Package Data Layer

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-package.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs`

- [ ] **Step 1: Extend the failing tests with exact package shape checks**

```js
test("course package period data exposes archive card and detail content together", () => {
  const period = getCoursePackagePeriodBySlug("course-period-04");

  assert.equal(typeof period.archiveCard.lead, "string");
  assert.equal(Array.isArray(period.archiveCard.keyPoints), true);
  assert.equal(Array.isArray(period.detailContent.sections), true);
  assert.equal(Array.isArray(period.detailContent.materialHighlights), true);
  assert.equal(Array.isArray(period.detailContent.teachingDesign.bullets), true);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs
```

Expected: FAIL because the package period object still only exposes `guide`, `outline`, `materialGroups`, and summary fields.

- [ ] **Step 3: Import the new builder and add archive fields to each period**

```js
import { buildCourseArchiveContent } from "./course-archive-content.js";
```

```js
const archiveContent = buildCourseArchiveContent(video.period, {
  guide,
  outline,
  materialGroups,
  summary: video.summary,
  theme: video.theme,
  title: video.title,
});

return {
  slug: video.slug,
  period: video.period,
  title: video.title,
  theme: video.theme,
  module: video.module,
  stageTag: video.stageTag,
  phaseLabel: video.phaseLabel,
  summary: video.summary,
  description: video.purpose,
  videoHref: video.href,
  playerMode: video.playerMode,
  detailHref: `/courses/${video.slug}`,
  guide,
  outline,
  materialGroups,
  archiveCard: archiveContent.archiveCard,
  detailContent: archiveContent.detailContent,
  stats: {
    materialCount: materialGroups.find((group) => group.title === "课程资料")?.items.length ?? 0,
    evidenceCount: materialGroups.find((group) => group.title === "佐证材料")?.items.length ?? 0,
    productionCount: materialGroups.find((group) => group.title === "视频制作材料")?.items.length ?? 0,
    outlineCount: outline.length,
  },
};
```

- [ ] **Step 4: Keep existing package behavior intact**

Do not remove:

```js
guide,
outline,
materialGroups,
stats,
videoHref,
detailHref,
```

The new content model is additive. Existing tests around static params, normalized material names, and material groups must keep passing.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add lib/course-package.js tests/core/course-package.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: attach structured archive content to course package"
```

Expected: course package tests PASS, commit created.

---

### Task 4: Rebuild The Courses Index As A Real Guide Page

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

- [ ] **Step 1: Write the failing guide-page tests**

```js
test("courses page presents each period as a guide card instead of a metadata-only archive card", () => {
  const source = readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8");

  assert.match(source, /archiveCard\.lead/u);
  assert.match(source, /archiveCard\.keyPoints/u);
  assert.match(source, /contentType/u);
  assert.equal(/每一期都保留主题、阶段定位和双入口/u.test(source), false);
});
```

```js
test("courses page copy avoids generic page-explainer wording", () => {
  const source = readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8");

  assert.equal(/本页|在这里可以|集中呈现/u.test(source), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
```

Expected: FAIL because `/courses` still renders metadata cards and old summary copy.

- [ ] **Step 3: Rewrite the courses page card body around guide content**

```jsx
<article key={item.slug} className="showcase-card course-guide-card">
  <div className="course-guide-card-head">
    <span className="showcase-card-eyebrow">{item.period}</span>
    <strong>{item.title}</strong>
    <small>{item.archiveCard.contentType}</small>
  </div>

  <p className="course-guide-lead">{item.archiveCard.lead}</p>

  <ul className="course-guide-key-list">
    {item.archiveCard.keyPoints.map((point) => (
      <li key={point}>{point}</li>
    ))}
  </ul>

  <div className="course-archive-actions">
    <Link href={item.detailHref} className="showcase-home-panel-link">进入本期课程</Link>
    <Link href={item.videoHref} className="btn btn-ghost">查看本期视频</Link>
  </div>
</article>
```

- [ ] **Step 4: Add styles for the new guide-card layout**

```css
.course-guide-card {
  display: grid;
  gap: 14px;
}

.course-guide-lead {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.75;
}

.course-guide-key-list {
  margin: 0;
  padding-left: 1.1rem;
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/courses/page.js app/globals.css tests/core/course-package.test.mjs tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: rebuild courses index as guide page"
```

Expected: guide-page tests PASS, commit created.

---

### Task 5: Rebuild The Single Course Page Around The Six-Section Reading Model

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

- [ ] **Step 1: Write the failing detail-page tests**

```js
test("course detail page follows the six-section reading model", () => {
  const source = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");

  assert.match(source, /本期导读/u);
  assert.match(source, /核心问题/u);
  assert.match(source, /内容展开/u);
  assert.match(source, /课程材料/u);
  assert.match(source, /教学设计/u);
  assert.match(source, /学习收获/u);
  assert.equal(/本期成果|课程信息|问题线索|课前准备/u.test(source), false);
});
```

```js
test("course detail page copy avoids explainer and execution-tone wording", () => {
  const source = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");

  assert.equal(/本页|在这里可以|按顺序|对应查看|系统梳理/u.test(source), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
```

Expected: FAIL because the detail page still uses `本期成果 / 课程信息 / 教学设计 / 学习目标 / 问题线索 / 课前准备`.

- [ ] **Step 3: Replace the detail page body with the new six-section content structure**

```jsx
<ShowcaseSection title="本期导读" eyebrow={period.period} className="showcase-section-compact">
  {period.detailContent.intro.map((paragraph) => (
    <p key={paragraph} className="course-reading-paragraph">{paragraph}</p>
  ))}
</ShowcaseSection>

<ShowcaseSection title="核心问题" eyebrow="问题进入" className="showcase-section-compact">
  <ul className="course-detail-list">
    {period.detailContent.keyQuestions.map((item) => <li key={item}>{item}</li>)}
  </ul>
</ShowcaseSection>

<ShowcaseSection title="内容展开" eyebrow="课程主线" className="showcase-section-compact">
  <div className="course-reading-section-grid">
    {period.detailContent.sections.map((section) => (
      <article key={section.title} className="course-reading-section-card">
        <strong>{section.title}</strong>
        <p>{section.body}</p>
      </article>
    ))}
  </div>
</ShowcaseSection>

<ShowcaseSection title="课程材料" eyebrow="材料摘要" className="showcase-section-compact">
  <div className="course-material-highlight-grid">
    {period.detailContent.materialHighlights.map((item) => (
      <article key={item.title} className="course-material-highlight-card">
        <strong>{item.title}</strong>
        <p>{item.summary}</p>
      </article>
    ))}
  </div>
</ShowcaseSection>

<ShowcaseSection title="教学设计" eyebrow="课堂组织" className="showcase-section-compact">
  <p className="course-reading-paragraph">{period.detailContent.teachingDesign.summary}</p>
  <ul className="course-detail-list">
    {period.detailContent.teachingDesign.bullets.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
</ShowcaseSection>

<ShowcaseSection title="学习收获" eyebrow="阅读收束" className="showcase-section-compact">
  <ul className="course-detail-list">
    {period.detailContent.learningTakeaways.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
</ShowcaseSection>
```

- [ ] **Step 4: Add styles for long-form reading blocks**

```css
.course-reading-paragraph {
  margin: 0;
  line-height: 1.85;
  color: var(--text-primary);
}

.course-reading-section-grid,
.course-material-highlight-grid {
  display: grid;
  gap: 16px;
}

.course-reading-section-card,
.course-material-highlight-card {
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.7);
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/courses/[slug]/page.js app/globals.css tests/core/course-package.test.mjs tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: rebuild single course pages around readable content"
```

Expected: detail-page tests PASS, commit created.

---

### Task 6: Final Tone Sweep And Full Verification

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/showcase-content.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

- [ ] **Step 1: Add final tone-guard coverage**

```js
test("homepage and course pages avoid AI-tone, report-tone, and execution-tone wording", () => {
  const homepageSource = readFileSync(new URL("../../app/page.js", import.meta.url), "utf8");
  const coursesSource = readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8");
  const courseDetailSource = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");

  for (const source of [homepageSource, coursesSource, courseDetailSource]) {
    assert.equal(/本页|在这里可以|系统梳理|阶段性成果|多维呈现|对应查看/u.test(source), false);
  }
});
```

- [ ] **Step 2: Run the tone tests to verify they fail first**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
```

Expected: FAIL if any old wording remains in homepage or course pages.

- [ ] **Step 3: Remove remaining generic or report-style copy**

Replace patterns like:

```js
"查看课程体系"
"阶段性成果"
"课程档案形成连续推进的主题序列。"
"对应查看"
```

with direct content-facing copy like:

```js
"查看课程导览"
"进入八期课程内容"
"八期课程按主题推进"
"查看本期视频"
```

- [ ] **Step 4: Run the full verification suite**

Run:

```bash
npm run test:core
npm run build
```

Expected:

```text
ℹ pass 68
ℹ fail 0
✓ Compiled successfully
✓ Exporting (2/2)
```

- [ ] **Step 5: Commit the final integration**

Run:

```bash
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/page.js app/courses/page.js app/courses/[slug]/page.js app/globals.css lib/showcase-content.js tests/core/public-copy-tone.test.mjs tests/core/homepage-content.test.mjs tests/core/course-package.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: rebuild course archive content flow"
```

Expected: full verification passes, integration commit created.

---

## Self-Review

### Spec Coverage

- 首页新增 `累计访问量 5万+`：Task 1
- 首页课程体系入口改为内容型入口：Task 1, Task 6
- `/courses` 改为导览页：Task 4
- `/courses/[slug]` 改为 6 段内容页：Task 5
- 前四期直接吸收教学资料：Task 2, Task 3
- 后四期将制作资料转写为正常课程内容：Task 2, Task 3
- 全站去 AI 味、去执行说明腔：Task 4, Task 5, Task 6

### Placeholder Scan

- 本计划不包含 `TODO`、`TBD`、`implement later`、`similar to Task N`
- 每个任务包含明确文件路径、测试命令、预期结果和提交命令

### Type Consistency

- 数据层新增字段统一命名为 `archiveCard` 和 `detailContent`
- 单期页 6 段结构统一消费 `detailContent.intro / keyQuestions / sections / materialHighlights / teachingDesign / learningTakeaways`
- 总览页统一消费 `archiveCard.lead / keyPoints / contentType`
