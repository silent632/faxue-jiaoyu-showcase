# Course System Multi-Page Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将课程体系从“八期总览 + 单期单页”升级为“八期总览 + 单期主页 + 六个子页面”的多页面结构，并先完成第一期、第五期样板。

**Architecture:** 保留 `/courses` 作为八期总览页，把 `/courses/[slug]` 改为单期主页，再新增六个固定子路由承载 `本期导读 / 重点问题 / 内容展开 / 材料与案例 / 学习成果 / 教学安排`。课程内容继续集中收口到 `lib/` 层，第一期和第五期用手工整理的样板内容驱动页面，其余期次保留兼容性字段，为后续批量扩展预留统一接口。

**Tech Stack:** Next.js App Router, React Server Components, local content builders in `lib/`, shared UI in `components/`, global CSS, Node test runner

---

## File Structure

### New Files

- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-system-pages.js`
  - 负责定义六个固定子页面、单期主页卡片摘要、第一期与第五期样板正文
  - 输出 `periodHome`、`sectionNavItems`、`sectionPages`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/course-period-subnav.js`
  - 负责单期子页面顶部横向切换导航
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/course-period-shell.js`
  - 负责单期主页与子页面共享的头部、标签、返回入口、说明区
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/introduction/page.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/questions/page.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/content/page.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/materials/page.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/outcomes/page.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/teaching/page.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs`

### Modified Files

- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-package.js`
  - 合并多页面课程数据，暴露 `periodHome`、`sectionNavItems`、`sectionPages`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/page.js`
  - 总览页卡片调整为“进入单期主页”的导览入口
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/page.js`
  - 从“单期全文页”改为“单期主页”
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
  - 新增单期主页卡片、六页切换导航、材料栏目页、成果页样式
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

---

### Task 1: Add Failing Tests For Multi-Page Course Routes

**Files:**
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

- [ ] **Step 1: Write the failing data-model test**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { getCoursePackagePeriodBySlug } from "../../lib/course-package.js";

test("course package exposes period home and six fixed section pages", () => {
  const period01 = getCoursePackagePeriodBySlug("course-period-01");
  const period05 = getCoursePackagePeriodBySlug("course-period-05");

  for (const period of [period01, period05]) {
    assert.ok(period.periodHome);
    assert.equal(period.periodHome.cards.length, 6);
    assert.ok(Array.isArray(period.sectionNavItems));
    assert.equal(period.sectionNavItems.length, 6);
    assert.ok(period.sectionPages);
    assert.ok(period.sectionPages.introduction);
    assert.ok(period.sectionPages.questions);
    assert.ok(period.sectionPages.content);
    assert.ok(period.sectionPages.materials);
    assert.ok(period.sectionPages.outcomes);
    assert.ok(period.sectionPages.teaching);
  }
});
```

- [ ] **Step 2: Write the failing route-source tests**

```js
test("course system source includes period home and six child routes", () => {
  const homeSource = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");
  const introSource = readFileSync(new URL("../../app/courses/[slug]/introduction/page.js", import.meta.url), "utf8");
  const materialsSource = readFileSync(new URL("../../app/courses/[slug]/materials/page.js", import.meta.url), "utf8");

  assert.match(homeSource, /periodHome\.cards/u);
  assert.match(homeSource, /本期导读|重点问题|内容展开|材料与案例|学习成果|教学安排/u);
  assert.match(introSource, /course-period-subnav|本期导读/u);
  assert.match(materialsSource, /材料与案例/u);
});
```

```js
test("public course copy avoids explainer wording after the multi-page split", () => {
  const homeSource = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");
  const contentSource = readFileSync(new URL("../../app/courses/[slug]/content/page.js", import.meta.url), "utf8");

  for (const source of [homeSource, contentSource]) {
    assert.equal(/本页|在这里可以|继续进入|对应查看|系统梳理/u.test(source), false);
  }
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
```

Expected: FAIL because `periodHome` / `sectionPages` and six child routes do not exist yet.

- [ ] **Step 4: Commit the red test baseline**

```bash
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add tests/core/course-system-pages.test.mjs tests/core/course-package.test.mjs tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "test: cover multi-page course system routes"
```

Expected: commit created with failing tests.

---

### Task 2: Build Shared Course System Page Data

**Files:**
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-system-pages.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-package.js`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs`

- [ ] **Step 1: Add the fixed six-page definitions**

```js
export const COURSE_PERIOD_SECTIONS = [
  { key: "introduction", label: "本期导读", hrefSegment: "introduction" },
  { key: "questions", label: "重点问题", hrefSegment: "questions" },
  { key: "content", label: "内容展开", hrefSegment: "content" },
  { key: "materials", label: "材料与案例", hrefSegment: "materials" },
  { key: "outcomes", label: "学习成果", hrefSegment: "outcomes" },
  { key: "teaching", label: "教学安排", hrefSegment: "teaching" },
];
```

- [ ] **Step 2: Add explicit sample-page content for period 01 and period 05**

```js
const SAMPLE_PERIOD_PAGES = {
  "course-period-01": {
    periodHome: {
      summary: "第一期围绕类案检索如何进入裁判文书阅读展开，重点建立案例筛选、争点识别和课堂表达的起点。",
      highlights: [
        "借名买房与优先承租权构成类案检索的第一组训练样本。",
        "课程重点不在检索技巧本身，而在检索如何服务导读判断。",
      ],
      cards: [
        {
          key: "introduction",
          label: "本期导读",
          summary: "解释第一期为什么从类案检索切入。",
          detail: "交代课程位置、检索起点和这一期要建立的阅读方法。",
        },
        {
          key: "questions",
          label: "重点问题",
          summary: "集中提出同类案件为何出现不同裁判路径。",
          detail: "围绕检索范围、事实比较和裁判理由识别组织问题。",
        },
      ],
    },
    sectionPages: {
      introduction: {
        title: "本期导读",
        intro: [
          "第一期不是单纯教数据库操作，而是把类案检索放回裁判文书阅读的起点位置。",
          "这一期建立的是后续八期课程都会反复使用的基本方法：先检索，再比较，再进入争点判断。"
        ]
      }
    }
  },
  "course-period-05": {
    periodHome: {
      summary: "第五期围绕非法证据排除规则展开，核心不是讲证据技术，而是让学生理解程序正义如何约束国家取证权力。",
      highlights: [
        "以疲劳审讯、搜查扣押、电子数据三类争议场景组织课程主线。",
        "课程从法理辨析进入裁判分析路径，再回到课堂讨论与学生表达。",
      ],
      cards: [
        {
          key: "content",
          label: "内容展开",
          summary: "从程序正义、正当程序到证据能力与证明力。",
          detail: "以三类取证争议场景串起第五期的课程正文。",
        },
        {
          key: "materials",
          label: "材料与案例",
          summary: "课件、导学、任务单和重点案例分栏呈现。",
          detail: "不再展示制作清单、时长表和审核结论这类过程文件。",
        },
      ],
    },
    sectionPages: {
      content: {
        title: "内容展开",
        blocks: [
          {
            title: "问题与法理基础",
            paragraphs: [
              "第五期先回答一个基础问题：为什么一项已经接近真实的证据仍可能被排除。",
              "课程用程序正义、正当程序、证据能力与证明力四组概念把非法证据排除放回刑事法治秩序中理解。"
            ]
          }
        ]
      }
    }
  }
};
```

- [ ] **Step 3: Add a shared builder with fallback mapping**

```js
export function buildCourseSystemPages(period) {
  const sample = SAMPLE_PERIOD_PAGES[period.slug];
  const navItems = COURSE_PERIOD_SECTIONS.map((item) => ({
    ...item,
    href: `/courses/${period.slug}/${item.hrefSegment}`,
  }));

  if (sample) {
    return {
      periodHome: {
        summary: sample.periodHome.summary,
        highlights: sample.periodHome.highlights,
        cards: COURSE_PERIOD_SECTIONS.map((section) => {
          const existing = sample.periodHome.cards.find((item) => item.key === section.key);
          return existing ?? {
            key: section.key,
            label: section.label,
            summary: `${section.label}页将本期已有资料整理为可读内容。`,
            detail: `围绕${period.title.replace(/^第[一二三四五六七八]期\s*/u, "")}继续展开。`,
            href: `/courses/${period.slug}/${section.hrefSegment}`,
          };
        }).map((item) => ({ ...item, href: `/courses/${period.slug}/${item.key}`.replace(/\/(introduction|questions|content|materials|outcomes|teaching)$/u, (segment) => segment) })),
      },
      sectionNavItems: navItems,
      sectionPages: mergeSampleSections(period, sample.sectionPages),
    };
  }

  return buildFallbackCourseSystemPages(period, navItems);
}
```

- [ ] **Step 4: Merge the new fields into `course-package.js`**

```js
import { buildCourseSystemPages } from "./course-system-pages.js";

const { archiveCard, detailContent } = buildCourseArchiveContent(video.period, basePeriod);
const { periodHome, sectionNavItems, sectionPages } = buildCourseSystemPages({
  ...basePeriod,
  archiveCard,
  detailContent,
});

return {
  ...basePeriod,
  archiveCard,
  detailContent,
  periodHome,
  sectionNavItems,
  sectionPages,
};
```

- [ ] **Step 5: Run tests to verify the model passes**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs
```

Expected: PASS with the new `periodHome` and `sectionPages` fields present.

- [ ] **Step 6: Commit**

```bash
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add lib/course-system-pages.js lib/course-package.js tests/core/course-system-pages.test.mjs tests/core/course-package.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: add multi-page course system data builder"
```

---

### Task 3: Convert `/courses/[slug]` Into A Real Period Home

**Files:**
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/course-period-shell.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs`

- [ ] **Step 1: Write the shared single-period shell**

```jsx
import Link from "next/link";

export default function CoursePeriodShell({ period, title, eyebrow, children, actions }) {
  return (
    <div className="course-period-shell">
      <div className="course-detail-back-row">
        <Link href="/courses" className="btn btn-ghost">返回课程体系</Link>
      </div>

      <section className="showcase-card course-detail-hero">
        <div className="course-detail-hero-copy">
          <p className="showcase-page-kicker">{eyebrow ?? period.period}</p>
          <h1>{title ?? period.title}</h1>
          <p className="course-detail-lead">{period.periodHome.summary}</p>
        </div>
        <div className="course-detail-hero-side">{actions}</div>
      </section>

      {children}
    </div>
  );
}
```

- [ ] **Step 2: Replace the current period detail page with the period home**

```jsx
<ShowcaseSection title="本期概览" eyebrow={period.period} className="showcase-section-compact">
  <ul className="course-detail-list">
    {period.periodHome.highlights.map((item) => <li key={item}>{item}</li>)}
  </ul>
</ShowcaseSection>

<ShowcaseSection title="页面入口" eyebrow="课程结构" className="showcase-section-compact">
  <div className="course-period-home-grid">
    {period.periodHome.cards.map((item, index) => (
      <Link key={item.key} href={item.href} className="course-period-home-card">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{item.label}</strong>
        <p>{item.summary}</p>
        <small>{item.detail}</small>
      </Link>
    ))}
  </div>
</ShowcaseSection>
```

- [ ] **Step 3: Update the courses index CTA to point to the new period home**

```jsx
<Link href={item.detailHref} className="showcase-home-panel-link">
  进入本期主页
</Link>
```

- [ ] **Step 4: Add styles for the period home grid**

```css
.course-period-home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.course-period-home-card {
  display: grid;
  gap: 10px;
  padding: 20px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,241,232,0.98));
  border: 1px solid rgba(35, 67, 93, 0.1);
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
```

Expected: PASS, and `/courses/[slug]` source now matches `periodHome.cards`.

- [ ] **Step 6: Commit**

```bash
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/courses/page.js app/courses/[slug]/page.js app/globals.css components/course-period-shell.js tests/core/course-system-pages.test.mjs tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: convert course detail page into period home"
```

---

### Task 4: Add The Shared Six-Page Subnav And Child Route Framework

**Files:**
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/course-period-subnav.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/introduction/page.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/questions/page.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/content/page.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/materials/page.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/outcomes/page.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/teaching/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs`

- [ ] **Step 1: Add the shared top tab navigation**

```jsx
"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export default function CoursePeriodSubnav({ items }) {
  const segment = useSelectedLayoutSegment();

  return (
    <nav className="course-period-subnav" aria-label="单期页面导航">
      {items.map((item) => {
        const active = segment === item.hrefSegment;
        return (
          <Link key={item.key} href={item.href} className={active ? "course-period-subnav-link is-active" : "course-period-subnav-link"}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Add a shared page factory pattern for each child route**

```jsx
import { notFound } from "next/navigation";

import CoursePeriodShell from "@/components/course-period-shell";
import CoursePeriodSubnav from "@/components/course-period-subnav";
import ShowcaseSection from "@/components/showcase-section";
import { getCoursePackagePeriodBySlug, getCoursePackageStaticParams } from "@/lib/course-package";

export function generateStaticParams() {
  return getCoursePackageStaticParams();
}

export default async function CourseQuestionsPage({ params }) {
  const { slug } = await params;
  const period = getCoursePackagePeriodBySlug(slug);
  if (!period) notFound();

  const page = period.sectionPages.questions;

  return (
    <main className="showcase-page" data-page-role="course-section">
      <div className="showcase-page-body">
        <CoursePeriodShell period={period} title={`${period.title} · ${page.title}`}>
          <CoursePeriodSubnav items={period.sectionNavItems} />
          <ShowcaseSection title={page.title} eyebrow={period.period} className="showcase-section-compact">
            <ul className="course-detail-list">
              {page.questions.map((item) => <li key={item.title}><strong>{item.title}</strong>{item.detail}</li>)}
            </ul>
          </ShowcaseSection>
        </CoursePeriodShell>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Add base tab styles**

```css
.course-period-subnav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.course-period-subnav-link {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(35, 67, 93, 0.12);
  background: rgba(255, 255, 255, 0.86);
}

.course-period-subnav-link.is-active {
  background: rgba(35, 67, 93, 0.92);
  color: #f6efe4;
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
```

Expected: PASS, and child route files exist with subnav source.

- [ ] **Step 5: Commit**

```bash
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add components/course-period-subnav.js app/courses/[slug]/introduction/page.js app/courses/[slug]/questions/page.js app/courses/[slug]/content/page.js app/courses/[slug]/materials/page.js app/courses/[slug]/outcomes/page.js app/courses/[slug]/teaching/page.js app/globals.css tests/core/course-system-pages.test.mjs tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: add course section routes and shared subnav"
```

---

### Task 5: Fill First-Period Sample Pages With Real Course Content

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-system-pages.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/introduction/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/questions/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/content/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/materials/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/outcomes/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/teaching/page.js`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs`

- [ ] **Step 1: Replace first-period fallback text with explicit section data**

```js
"course-period-01": {
  sectionPages: {
    introduction: {
      title: "本期导读",
      intro: [
        "第一期把类案检索放在裁判文书研习的最前端，目标不是教学生机械搜索，而是让检索服务后续的案例阅读。",
        "课程从借名买房、优先承租权等典型争议切入，让学生看到同类案件如何因为事实差异和裁判理由差异而走向不同路径。"
      ]
    },
    questions: {
      title: "重点问题",
      questions: [
        { title: "类案检索为什么不是资料搜集？", detail: "重点在于通过检索建立比较对象，而不是把更多判决堆在一起。" },
        { title: "同类案件为何出现不同裁判路径？", detail: "学生需要比较事实认定、争点设置与法官说理。" },
        { title: "检索结果怎样进入课堂表达？", detail: "课程要求把检索材料转成导读判断和讨论观点。" }
      ]
    }
  }
}
```

- [ ] **Step 2: Add explicit materials and outcomes for period 01**

```js
materials: {
  title: "材料与案例",
  groups: [
    {
      title: "课件与讲义",
      items: [
        "课件负责搭起检索起点、阅读路径和争点识别三步结构。",
        "讲义版材料把课堂中的检索方法与案例比较顺序压缩成可复用的导读线索。"
      ]
    },
    {
      title: "专题阅读与案例",
      items: [
        "专题阅读《司法裁判的“同”与“不同”》补足自由裁量与科技赋能的背景讨论。",
        "借名买房与优先承租权构成第一期的两组核心比较案例。"
      ]
    }
  ]
},
outcomes: {
  title: "学习成果",
  groups: [
    {
      title: "学生报告",
      items: [
        "学生报告主要围绕“事实差异是否足以改变裁判路径”展开。",
        "报告中的表达重点已经从摘要复述，转向围绕争点组织观点。"
      ]
    },
    {
      title: "课后反馈",
      items: [
        "反馈集中提到类案比较让抽象法理第一次真正进入具体案件。",
        "学生能感知到检索结果只有进入说理，才算完成课程任务。"
      ]
    }
  ]
}
```

- [ ] **Step 3: Run focused tests**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs
```

Expected: PASS, and first-period sample no longer relies on generic fallback copy.

- [ ] **Step 4: Commit**

```bash
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add lib/course-system-pages.js app/courses/[slug]/introduction/page.js app/courses/[slug]/questions/page.js app/courses/[slug]/content/page.js app/courses/[slug]/materials/page.js app/courses/[slug]/outcomes/page.js app/courses/[slug]/teaching/page.js tests/core/course-system-pages.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: add first period multi-page sample"
```

---

### Task 6: Fill Fifth-Period Sample Pages With Real Course Content

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-system-pages.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/content/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/materials/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/outcomes/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/teaching/page.js`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs`

- [ ] **Step 1: Replace fifth-period process copy with actual course blocks**

```js
"course-period-05": {
  sectionPages: {
    content: {
      title: "内容展开",
      blocks: [
        {
          title: "问题与法理基础",
          paragraphs: [
            "课程先追问：如果一项证据已经接近真实，为什么法律仍可能要求排除它。",
            "这一部分把程序正义、正当程序、证据能力和证明力四组概念重新放回刑事法治的边界问题。"
          ]
        },
        {
          title: "三类争议场景",
          paragraphs: [
            "课程用言词证据、搜查扣押、电子数据三类场景，让学生看到程序违法如何进入真实案件。",
            "重点不是背法条，而是判断哪些程序瑕疵已经足以动摇证据进入裁判的资格。"
          ]
        },
        {
          title: "裁判分析路径",
          paragraphs: [
            "第五期把事实、程序、规范、法理衡量、裁判结论整理成稳定的阅读顺序。",
            "学生最终要把这一顺序转成课堂展示和裁判文书研习报告。"
          ]
        }
      ]
    }
  }
}
```

- [ ] **Step 2: Add real materials/outcomes groups for period 05**

```js
materials: {
  title: "材料与案例",
  groups: [
    {
      title: "规范与法理材料",
      items: [
        "教学材料指南负责明确第五期的主题、案例方向和课堂逻辑。",
        "裁判文书法理导学把程序正义与非法证据排除的论证链条提前搭起来。"
      ]
    },
    {
      title: "案例与任务材料",
      items: [
        "重点案例围绕疲劳审讯供述排除、同步录音录像缺失和电子数据程序瑕疵展开。",
        "研习任务单把问题分配给课堂讨论和课后表达，要求学生明确区分证据能力与证明力。"
      ]
    }
  ]
},
outcomes: {
  title: "学习成果",
  groups: [
    {
      title: "课堂输出",
      items: [
        "学生输出集中在“真实能否覆盖程序违法”以及“何种瑕疵应触发排除”两组争点。",
        "课堂讨论不再停留在立场表态，而是被要求回到规范依据和法理理由。"
      ]
    },
    {
      title: "反馈与报告",
      items: [
        "课后反馈反复提到第五期第一次把程序问题和权力边界真正连在了一起。",
        "学生报告摘要显示，多数人已经能沿着事实、程序、规范、裁判理由四步组织分析。"
      ]
    }
  ]
}
```

- [ ] **Step 3: Run focused tests**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
```

Expected: PASS, and fifth-period sample no longer exposes script/checklist/audit copy in main content.

- [ ] **Step 4: Commit**

```bash
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add lib/course-system-pages.js app/courses/[slug]/content/page.js app/courses/[slug]/materials/page.js app/courses/[slug]/outcomes/page.js app/courses/[slug]/teaching/page.js tests/core/course-system-pages.test.mjs tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: add fifth period multi-page sample"
```

---

### Task 7: Final Tone Sweep And Full Verification

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-system-pages.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/introduction/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/questions/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/content/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/materials/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/outcomes/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/teaching/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

- [ ] **Step 1: Add final tone-guard coverage for all new routes**

```js
test("multi-page course system avoids explainer and execution-tone wording", () => {
  const sources = [
    readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/courses/[slug]/introduction/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/courses/[slug]/questions/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/courses/[slug]/content/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/courses/[slug]/materials/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/courses/[slug]/outcomes/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/courses/[slug]/teaching/page.js", import.meta.url), "utf8"),
  ].join("\\n");

  assert.equal(/本页|在这里可以|继续进入|对应查看|系统梳理|阶段性成果|制作清单|时长审核/u.test(sources), false);
});
```

- [ ] **Step 2: Run the full verification suite**

Run:

```bash
npm run test:core
npm run build
```

Expected:

```text
ℹ pass 0
ℹ fail 0
✓ Compiled successfully
✓ Exporting (2/2)
```

- [ ] **Step 3: Commit the integrated sample**

```bash
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add lib/course-system-pages.js lib/course-package.js components/course-period-shell.js components/course-period-subnav.js app/courses/page.js app/courses/[slug]/page.js app/courses/[slug]/introduction/page.js app/courses/[slug]/questions/page.js app/courses/[slug]/content/page.js app/courses/[slug]/materials/page.js app/courses/[slug]/outcomes/page.js app/courses/[slug]/teaching/page.js app/globals.css tests/core/course-system-pages.test.mjs tests/core/course-package.test.mjs tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: add sample multi-page course system"
```

Expected: tests and build pass, integrated sample commit created.

---

## Self-Review

### Spec Coverage

- 八期结构保留：Task 2, Task 3
- 单期主页 + 六个子页面：Task 2, Task 3, Task 4
- 单期主页采用中等总览页：Task 3
- 六个子页面统一命名与顶部横向切换：Task 2, Task 4
- 六个入口卡片带摘要预览：Task 2, Task 3
- 第一、第五期样板：Task 5, Task 6
- 去 AI 味、去说明腔：Task 1, Task 7

### Placeholder Scan

- 本计划不包含 `TODO`、`TBD`、`implement later`
- 所有任务都给出明确文件路径、测试命令与提交命令
- 样板内容明确写到 `course-period-01` 与 `course-period-05`

### Type Consistency

- 统一字段名为 `periodHome`、`sectionNavItems`、`sectionPages`
- 六个固定 key 保持为 `introduction / questions / content / materials / outcomes / teaching`
- 子路由路径与 key 保持一一对应
