# Course System Round 2 Content Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the course-system public pages so the homepage, single-period pages, and material pages read as concrete course content for reviewers, collapse reports/feedback into single entries, and remove template-like copy and cramped spacing across the public site.

**Architecture:** Keep the existing `/courses` and `/courses/[slug]` route structure, but replace the 14-item material model with a canonical 10-item model plus legacy slug redirects. Move dense single-period entry copy into `periodHome`, rewrite homepage archive/framework copy from course-specific data, and enforce banned-copy/spacing rules with source-level tests plus full-build verification.

**Tech Stack:** Next.js App Router, React server components, plain CSS in `app/globals.css`, Node `node:test` core test suite.

---

## File Structure

### Core data and routing

- Modify: `lib/course-material-pages.js`
  Responsibility: canonical material definitions, legacy slug aliases, merged report/feedback page builders, material lead text rules, previous/next navigation order.
- Modify: `app/courses/[slug]/[materialSlug]/page.js`
  Responsibility: resolve legacy material slugs and redirect them to canonical routes before lookup.
- Modify: `lib/course-system-pages.js`
  Responsibility: expose richer `periodHome` data for single-period entry pages instead of sparse raw `periodSummary` usage.
- Modify: `lib/course-archive-content.js`
  Responsibility: generate concrete archive-card copy for each period, especially periods 05-08.

### Public page rendering

- Modify: `app/courses/page.js`
  Responsibility: redesign the unified material framework block and course archive cards.
- Modify: `app/courses/[slug]/page.js`
  Responsibility: rebuild the period entry page into a denser reviewer-facing entry layout.
- Modify: `components/course-material-directory.js`
  Responsibility: render the 10-item directory and singular report/feedback labels.
- Modify: `components/course-material-article.js`
  Responsibility: render merged report/feedback content without `(一)(二)(三)` page splits.
- Modify: `app/globals.css`
  Responsibility: homepage framework density, period entry density, material directory spacing, shared section/card spacing across public pages.

### Tests

- Create: `tests/core/course-system-round-2.test.mjs`
  Responsibility: new round-2 invariants for banned copy, canonical 10-item structure, concrete period copy, and period-entry layout markers.
- Modify: `tests/core/course-material-pages.test.mjs`
  Responsibility: update material-page expectations from 14 items to 10 items and singular report/feedback pages.
- Modify: `tests/core/course-package.test.mjs`
  Responsibility: update package-level assertions for canonical material pages and richer `periodHome` data.

---

### Task 1: Lock the canonical 10-item material model and legacy slug compatibility

**Files:**
- Create: `tests/core/course-system-round-2.test.mjs`
- Modify: `tests/core/course-material-pages.test.mjs`
- Modify: `tests/core/course-package.test.mjs`
- Modify: `lib/course-material-pages.js`
- Modify: `app/courses/[slug]/[materialSlug]/page.js`

- [ ] **Step 1: Write the failing tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCoursePackagePeriodBySlug } from "../../lib/course-package.js";

test("canonical material pages collapse reports and feedback into singular entries", () => {
  const period05 = getCoursePackagePeriodBySlug("course-period-05");

  assert.deepEqual(
    period05.materialPages.map((item) => item.slug),
    [
      "teaching-guide",
      "jurisprudence-guide",
      "study-task-sheet",
      "mentor-role-plan",
      "classroom-observation",
      "peer-review-theory",
      "peer-review-practice",
      "evaluation-metrics",
      "study-report",
      "feedback",
    ]
  );
  assert.equal(period05.materialPages.some((item) => /（一）|（二）|（三）/u.test(item.label)), false);
});

test("material route redirects legacy split-page slugs to canonical slugs", () => {
  const source = readFileSync(new URL("../../app/courses/[slug]/[materialSlug]/page.js", import.meta.url), "utf8");

  assert.match(source, /redirect/u);
  assert.match(source, /resolveCourseMaterialSlug/u);
});
```

- [ ] **Step 2: Run the targeted tests to verify they fail**

Run:

```bash
node --test tests/core/course-system-round-2.test.mjs tests/core/course-material-pages.test.mjs tests/core/course-package.test.mjs
```

Expected:

- FAIL because `materialPages.length` is still `14`
- FAIL because `study-report-01` / `feedback-01` still exist
- FAIL because the material route does not yet import `redirect` or a slug resolver

- [ ] **Step 3: Implement the canonical material model in `lib/course-material-pages.js`**

```js
const STANDARD_COURSE_MATERIALS = [
  { slug: "teaching-guide", label: "教学材料指南", shortLabel: "教学材料指南", group: "教学设计类", order: 1 },
  { slug: "jurisprudence-guide", label: "裁判文书法理导学", shortLabel: "法理导学", group: "教学设计类", order: 2 },
  { slug: "study-task-sheet", label: "裁判文书研习任务单", shortLabel: "研习任务单", group: "教学设计类", order: 3 },
  { slug: "mentor-role-plan", label: "双师职责分工表", shortLabel: "职责分工表", group: "课堂实施类", order: 4 },
  { slug: "classroom-observation", label: "双师课堂记录观察表", shortLabel: "课堂观察表", group: "课堂实施类", order: 5 },
  { slug: "peer-review-theory", label: "双师合作互评问卷（理论导师）", shortLabel: "互评问卷（理论）", group: "协同反思类", order: 6 },
  { slug: "peer-review-practice", label: "双师合作互评问卷（实务导师）", shortLabel: "互评问卷（实务）", group: "协同反思类", order: 7 },
  { slug: "evaluation-metrics", label: "学生综合能力评价指标体系", shortLabel: "能力指标体系", group: "学习成果类", order: 8 },
  { slug: "study-report", label: "学生研习报告", shortLabel: "研习报告", group: "学习成果类", order: 9 },
  { slug: "feedback", label: "学生课后反馈", shortLabel: "课后反馈", group: "学习成果类", order: 10 },
];

export const LEGACY_MATERIAL_SLUG_REDIRECTS = new Map([
  ["study-report-01", "study-report"],
  ["study-report-02", "study-report"],
  ["study-report-03", "study-report"],
  ["feedback-01", "feedback"],
  ["feedback-02", "feedback"],
  ["feedback-03", "feedback"],
]);

export function resolveCourseMaterialSlug(slug) {
  return LEGACY_MATERIAL_SLUG_REDIRECTS.get(slug) ?? slug;
}
```

- [ ] **Step 4: Implement legacy-slug redirects in `app/courses/[slug]/[materialSlug]/page.js`**

```js
import { notFound, redirect } from "next/navigation";

import {
  resolveCourseMaterialSlug,
} from "@/lib/course-material-pages";

export default async function CourseMaterialPage({ params }) {
  const { slug, materialSlug } = await params;
  const resolvedMaterialSlug = resolveCourseMaterialSlug(materialSlug);

  if (resolvedMaterialSlug !== materialSlug) {
    redirect(`/courses/${slug}/${resolvedMaterialSlug}`);
  }

  const period = getCoursePackagePeriodBySlug(slug);
  const page = period?.materialPages.find((item) => item.slug === resolvedMaterialSlug);

  if (!period || !page) {
    notFound();
  }

  return (
    <CoursePeriodShell
      period={period}
      title={`${period.period} · ${page.label}`}
      summary={page.lead}
      activeMaterialSlug={page.slug}
    >
      <CourseMaterialArticle page={page} />
    </CoursePeriodShell>
  );
}
```

- [ ] **Step 5: Run the targeted tests to verify they pass**

Run:

```bash
node --test tests/core/course-system-round-2.test.mjs tests/core/course-material-pages.test.mjs tests/core/course-package.test.mjs
```

Expected:

- PASS for canonical 10-item material structure
- PASS for singular report/feedback labels
- PASS for legacy route redirect markers

- [ ] **Step 6: Commit**

```bash
git add \
  tests/core/course-system-round-2.test.mjs \
  tests/core/course-material-pages.test.mjs \
  tests/core/course-package.test.mjs \
  lib/course-material-pages.js \
  app/courses/[slug]/[materialSlug]/page.js
git commit -m "refactor: collapse course materials into canonical entries"
```

### Task 2: Rebuild the `/courses` homepage framework block and concrete archive-card copy

**Files:**
- Modify: `tests/core/course-system-round-2.test.mjs`
- Modify: `tests/core/course-package.test.mjs`
- Modify: `lib/course-archive-content.js`
- Modify: `app/courses/page.js`
- Modify: `app/globals.css`

- [ ] **Step 1: Write the failing tests**

```js
import { getCoursePackagePeriodBySlug } from "../../lib/course-package.js";

test("courses page removes banned framework copy and split report labels", () => {
  const source = readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8");

  assert.doesNotMatch(source, /四类材料贯穿八期课程/u);
  assert.doesNotMatch(source, /重写法理导学、任务单、课堂观察和学习成果/u);
  assert.doesNotMatch(source, /研习报告（一）|课后反馈（三）/u);
  assert.match(source, /course-framework/u);
});

test("late-period archive copy stays tied to concrete course topics", () => {
  const expectations = [
    ["course-period-05", /非法证据|程序正义|取证权力/u],
    ["course-period-06", /人脸识别|同意边界|人格权/u],
    ["course-period-07", /平台|算法|劳动关系/u],
    ["course-period-08", /生成式 AI|作品认定|责任边界/u],
  ];

  for (const [slug, pattern] of expectations) {
    const period = getCoursePackagePeriodBySlug(slug);
    assert.match(period.archiveCard.lead, pattern);
    assert.doesNotMatch(period.archiveCard.lead, /课程定位与双师设计页|学习目标页|内容导图页/u);
  }
});
```

- [ ] **Step 2: Run the targeted tests to verify they fail**

Run:

```bash
node --test tests/core/course-system-round-2.test.mjs tests/core/course-package.test.mjs
```

Expected:

- FAIL because `/courses` still contains banned framework copy
- FAIL because periods 05-08 still carry abstract or production-facing archive wording

- [ ] **Step 3: Rewrite late-period archive-card generation in `lib/course-archive-content.js`**

```js
const PERIOD_CONTENT_FALLBACKS = {
  第五期: {
    archiveCard: {
      lead: "围绕非法证据排除规则，讨论当程序违法与真实发现发生冲突时，法律为何仍要用程序正义约束国家取证权力。",
      keyPoints: ["非法证据排除", "程序正义", "取证权力"],
      contentType: "程序正义专题",
    },
  },
  第六期: {
    archiveCard: {
      lead: "围绕人脸识别中的同意边界展开，讨论个人信息处理为何不能停留在“已经同意”的表面，而要回到人格权与数字治理边界。",
      keyPoints: ["人脸识别", "同意边界", "数字人格权"],
      contentType: "数字治理专题",
    },
  },
  第七期: {
    archiveCard: {
      lead: "围绕平台劳动关系认定中的法理冲突展开，讨论算法控制如何改变劳动过程，以及法律如何回应控制与保障之间的张力。",
      keyPoints: ["平台用工", "算法控制", "劳动关系认定"],
      contentType: "平台治理专题",
    },
  },
  第八期: {
    archiveCard: {
      lead: "围绕生成式 AI 的作品认定与责任边界展开，讨论人的投入、平台控制与法律责任如何重新划分。",
      keyPoints: ["生成式 AI", "作品认定", "责任边界"],
      contentType: "智能治理专题",
    },
  },
};
```

- [ ] **Step 4: Rebuild the homepage framework UI in `app/courses/page.js` and `app/globals.css`**

```jsx
<ShowcaseSection
  title="统一材料框架"
  eyebrow="十项标准材料"
  description="课程体系统一保留教学设计、课堂实施、协同反思与学习成果四组核心材料。"
  className="showcase-section-compact"
>
  <div className="course-framework">
    <div className="course-framework-grid">
      {standardDirectory.map((group) => (
        <section key={group.title} className="course-framework-group">
          <strong>{group.title}</strong>
          <ul className="course-framework-list">
            {group.items.map((item) => (
              <li key={item.slug}>{item.shortLabel}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>

    <aside className="course-framework-summary">
      <p>报告与反馈各收为一个成果页，首页只保留结构入口，不再展示拆分页。</p>
    </aside>
  </div>
</ShowcaseSection>
```

```css
.course-framework {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(240px, 0.7fr);
  gap: 20px;
  align-items: start;
}

.course-framework-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.course-framework-group {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(35, 67, 93, 0.08);
}
```

- [ ] **Step 5: Run the targeted tests to verify they pass**

Run:

```bash
node --test tests/core/course-system-round-2.test.mjs tests/core/course-package.test.mjs
```

Expected:

- PASS for banned-copy removal on `/courses`
- PASS for concrete late-period archive leads
- PASS for compact framework markers

- [ ] **Step 6: Commit**

```bash
git add \
  tests/core/course-system-round-2.test.mjs \
  tests/core/course-package.test.mjs \
  lib/course-archive-content.js \
  app/courses/page.js \
  app/globals.css
git commit -m "feat: tighten course homepage framework and archive copy"
```

### Task 3: Enrich single-period entry pages with denser reviewer-facing content

**Files:**
- Modify: `tests/core/course-system-round-2.test.mjs`
- Modify: `tests/core/course-package.test.mjs`
- Modify: `lib/course-system-pages.js`
- Modify: `app/courses/[slug]/page.js`
- Modify: `app/globals.css`

- [ ] **Step 1: Write the failing tests**

```js
test("periodHome exposes dense entry content for reviewer-facing period pages", () => {
  const period05 = getCoursePackagePeriodBySlug("course-period-05");

  assert.equal(Array.isArray(period05.periodHome.entryPanels), true);
  assert.equal(period05.periodHome.entryPanels.length >= 3, true);
  assert.equal(Array.isArray(period05.periodHome.materialNotes), true);
  assert.equal(period05.periodHome.materialNotes.length >= 3, true);
});

test("single-period route avoids meta-intro language and uses denser layout markers", () => {
  const source = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");

  assert.doesNotMatch(source, /这一页只做引子/u);
  assert.match(source, /course-period-entry-grid/u);
  assert.match(source, /course-period-entry-panel/u);
  assert.match(source, /course-period-material-notes/u);
});
```

- [ ] **Step 2: Run the targeted tests to verify they fail**

Run:

```bash
node --test tests/core/course-system-round-2.test.mjs tests/core/course-package.test.mjs
```

Expected:

- FAIL because `periodHome.entryPanels` / `materialNotes` do not exist
- FAIL because `/courses/[slug]` does not yet use the denser layout markers

- [ ] **Step 3: Extend `periodHome` in `lib/course-system-pages.js`**

```js
function buildPeriodHome(period) {
  const profile = period.courseContentProfile;

  return {
    summary: profile.periodSummary.lead,
    highlights: uniqueTexts(profile.periodSummary.keySignals, 4),
    entryPanels: [
      {
        title: "本期处理的核心冲突",
        items: uniqueTexts(profile.caseStudy.controversies, 3),
      },
      {
        title: "本期核心问题",
        items: uniqueTexts(profile.coreQuestions.map((item) => item.question), 3),
      },
      {
        title: "本期课堂判断路径",
        items: uniqueTexts(profile.contentFlow.map((item) => `${item.title}：${item.goal}`), 4),
      },
    ],
    materialNotes: uniqueTexts([
      ...renderMaterialEntries(profile.materialsInterpretation.courseware || []),
      ...renderMaterialEntries(profile.materialsInterpretation.guideReading || []),
      ...renderMaterialEntries(profile.materialsInterpretation.taskDesign || []),
    ], 4),
  };
}
```

- [ ] **Step 4: Rebuild `app/courses/[slug]/page.js` with a denser entry composition**

```jsx
<section className="showcase-card course-period-entry-grid">
  <div className="course-period-entry-main">
    <span className="showcase-card-eyebrow">{period.period}</span>
    <h2>{period.title}</h2>
    <p className="course-detail-lead">{period.periodHome.summary}</p>
    <div className="course-period-material-notes">
      {period.periodHome.materialNotes.map((note) => (
        <p key={note}>{note}</p>
      ))}
    </div>
  </div>

  <div className="course-period-entry-side">
    {period.periodHome.entryPanels.map((panel) => (
      <section key={panel.title} className="course-period-entry-panel">
        <strong>{panel.title}</strong>
        <ul className="course-detail-list">
          {panel.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    ))}
  </div>
</section>
```

```css
.course-period-entry-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 20px;
  padding: 22px 24px;
}

.course-period-entry-panel {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(35, 67, 93, 0.08);
  background: rgba(255, 255, 255, 0.86);
}
```

- [ ] **Step 5: Run the targeted tests to verify they pass**

Run:

```bash
node --test tests/core/course-system-round-2.test.mjs tests/core/course-package.test.mjs
```

Expected:

- PASS for new `periodHome` entry data
- PASS for denser single-period layout markers
- PASS for removal of “这一页只做引子” style copy

- [ ] **Step 6: Commit**

```bash
git add \
  tests/core/course-system-round-2.test.mjs \
  tests/core/course-package.test.mjs \
  lib/course-system-pages.js \
  app/courses/[slug]/page.js \
  app/globals.css
git commit -m "feat: densify single-period entry pages"
```

### Task 4: Merge report and feedback content into single material pages

**Files:**
- Modify: `tests/core/course-material-pages.test.mjs`
- Modify: `tests/core/course-package.test.mjs`
- Modify: `tests/core/course-system-round-2.test.mjs`
- Modify: `lib/course-material-pages.js`
- Modify: `components/course-material-directory.js`
- Modify: `components/course-material-article.js`
- Modify: `app/globals.css`

- [ ] **Step 1: Write the failing tests**

```js
test("merged report and feedback pages expose singular labels and aggregated sections", () => {
  const period06 = getCoursePackagePeriodBySlug("course-period-06");
  const reportPage = period06.materialPages.find((item) => item.slug === "study-report");
  const feedbackPage = period06.materialPages.find((item) => item.slug === "feedback");

  assert.equal(reportPage.label, "学生研习报告");
  assert.equal(feedbackPage.label, "学生课后反馈");
  assert.equal(reportPage.sections.length >= 3, true);
  assert.equal(feedbackPage.sections.length >= 3, true);
  assert.equal(reportPage.sections.some((section) => /样本|代表性判断/u.test(section.title)), true);
  assert.equal(feedbackPage.sections.some((section) => /学生在课后留下的判断|继续追问/u.test(section.title)), true);
});

test("material directory source no longer renders split report and feedback labels", () => {
  const source = readFileSync(new URL("../../components/course-material-directory.js", import.meta.url), "utf8");

  assert.doesNotMatch(source, /课后反馈（一）|研习报告（二）/u);
});
```

- [ ] **Step 2: Run the targeted tests to verify they fail**

Run:

```bash
node --test tests/core/course-system-round-2.test.mjs tests/core/course-material-pages.test.mjs tests/core/course-package.test.mjs
```

Expected:

- FAIL because report/feedback pages are not yet merged
- FAIL because singular slugs are not yet wired through article and directory rendering

- [ ] **Step 3: Implement merged report/feedback builders in `lib/course-material-pages.js`**

```js
function buildMergedReportSections(period) {
  const profile = period.courseContentProfile;
  const findings = uniqueTexts(profile.studentOutcomes.reportFindings, 3);

  return ensureSections([
    {
      title: "这一期学生书面输出总体回应了什么问题",
      paragraphs: [
        `${period.period}的研习报告集中回应本期核心案件和法理争点，重点不在摘抄课堂内容，而在把事实、规范与法理理由组织成完整判断。`,
      ],
    },
    ...findings.map((finding, index) => ({
      title: `代表性判断 ${index + 1}`,
      bullets: uniqueTexts([
        finding,
        profile.caseStudy.analysisPath[index] || profile.caseStudy.analysisPath[0],
        profile.teachingDesign.trainingFocus[index] || profile.teachingDesign.trainingFocus[0],
      ], 3),
    })),
  ]);
}

function buildMergedFeedbackSections(period) {
  const profile = period.courseContentProfile;

  return ensureSections([
    {
      title: "学生在课后留下的判断",
      bullets: uniqueTexts(profile.studentOutcomes.feedbackInsights, 3),
    },
    {
      title: "课堂已经真正进入学生端的地方",
      bullets: uniqueTexts(profile.studentOutcomes.classroomOutputs, 3),
    },
    {
      title: "仍在继续追问的问题",
      bullets: uniqueTexts(profile.coreQuestions.map((item) => item.question), 4),
    },
  ]);
}
```

- [ ] **Step 4: Update directory/article rendering to match the merged model**

```jsx
<div className="course-material-directory-links">
  {group.items.map((item) => (
    <Link key={item.slug} href={item.href} className={`course-material-directory-link${item.slug === activeSlug ? " active" : ""}`}>
      <span className="course-material-directory-order">{String(item.order).padStart(2, "0")}</span>
      <span className="course-material-directory-text">{item.shortLabel}</span>
    </Link>
  ))}
</div>
```

```jsx
function renderSection(section, index) {
  return (
    <section key={section.title || index} className="course-material-article-body-block">
      {section.title ? <h3>{section.title}</h3> : null}
      {renderParagraphs(section.paragraphs)}
      {renderBullets(section.bullets)}
      {renderCards(section.cards)}
    </section>
  );
}
```

```css
.course-material-article-body-block + .course-material-article-body-block {
  padding-top: 26px;
  border-top: 1px solid rgba(35, 67, 93, 0.08);
}

.course-material-subsection {
  padding: 18px 20px;
}
```

- [ ] **Step 5: Run the targeted tests to verify they pass**

Run:

```bash
node --test tests/core/course-system-round-2.test.mjs tests/core/course-material-pages.test.mjs tests/core/course-package.test.mjs
```

Expected:

- PASS for singular report/feedback entries
- PASS for aggregated section content
- PASS for directory/article source invariants

- [ ] **Step 6: Commit**

```bash
git add \
  tests/core/course-system-round-2.test.mjs \
  tests/core/course-material-pages.test.mjs \
  tests/core/course-package.test.mjs \
  lib/course-material-pages.js \
  components/course-material-directory.js \
  components/course-material-article.js \
  app/globals.css
git commit -m "feat: merge course report and feedback pages"
```

### Task 5: Run the banned-copy audit and shared spacing pass, then verify the whole build

**Files:**
- Modify: `tests/core/course-system-round-2.test.mjs`
- Modify: `app/globals.css`
- Modify: `app/courses/page.js`
- Modify: `app/courses/[slug]/page.js`
- Modify as flagged by the audit: `lib/course-archive-content.js`, `lib/course-material-pages.js`, `lib/course-system-pages.js`, `app/page.js`, `app/resources/page.js`, `app/impact/page.js`, `app/cases/page.js`

- [ ] **Step 1: Write the failing audit tests**

```js
test("public course-facing sources avoid banned structural copy", () => {
  const forbidden = [
    /四类材料贯穿八期课程/u,
    /课程定位与双师设计页/u,
    /学习目标页/u,
    /内容导图页/u,
    /这一页只做引子/u,
    /资源化表达延展方向/u,
  ];

  const targets = [
    "../../app/courses/page.js",
    "../../app/courses/[slug]/page.js",
    "../../lib/course-archive-content.js",
    "../../lib/course-material-pages.js",
    "../../lib/course-system-pages.js",
  ];

  for (const target of targets) {
    const source = readFileSync(new URL(target, import.meta.url), "utf8");
    for (const pattern of forbidden) {
      assert.doesNotMatch(source, pattern);
    }
  }
});
```

- [ ] **Step 2: Run the full test suite to verify the audit fails before the cleanup**

Run:

```bash
npm run test:core
```

Expected:

- FAIL if any banned phrase still exists
- FAIL if updated route/data/UI assumptions are not yet reflected everywhere

- [ ] **Step 3: Apply the shared spacing pass and fix any flagged public copy**

```css
.showcase-page-body {
  display: grid;
  gap: 28px;
}

.showcase-section {
  display: grid;
  gap: 20px;
}

.showcase-section + .showcase-section,
.showcase-card + .showcase-section,
.showcase-section + .showcase-card {
  margin-top: 8px;
}
```

```js
// Example cleanup pattern for any flagged copy source
description: "围绕本期具体争议、课堂判断路径和学习成果展开。";
```

- [ ] **Step 4: Run full regression verification**

Run:

```bash
npm run test:core
npm run build
curl -sS http://127.0.0.1:3000/courses/course-period-05/ | rg -n "课程定位与双师设计页|学习目标页|内容导图页|这一页只做引子"
curl -sS http://127.0.0.1:3000/courses/course-period-05/feedback/ | rg -n "课后反馈（一）|课后反馈（二）|课后反馈（三）"
```

Expected:

- `npm run test:core` exits `0`
- `npm run build` exits `0`
- both `curl | rg` commands return no matches

Note:

- If a local server is not running, replace the `curl http://127.0.0.1:3000/...` checks with `rg` against `out/courses/.../index.html` after build.

- [ ] **Step 5: Commit**

```bash
git add \
  tests/core/course-system-round-2.test.mjs \
  app/globals.css \
  app/courses/page.js \
  app/courses/[slug]/page.js \
  lib/course-archive-content.js \
  lib/course-material-pages.js \
  lib/course-system-pages.js \
  app/page.js \
  app/resources/page.js \
  app/impact/page.js \
  app/cases/page.js
git commit -m "fix: polish course-system copy density and spacing"
```

## Self-Review

### Spec coverage

- 统一材料框架占位过大：由 Task 2 处理
- 禁止抽象结构语言：由 Task 2 和 Task 5 处理
- 第五到第八期必须具体化：由 Task 2 和 Task 3 处理
- 单期课程页首屏与“本期进入方式”过空：由 Task 3 处理
- 研习报告与课后反馈合并：由 Task 1 和 Task 4 处理
- 板块过近与全站巡检：由 Task 5 处理

No spec gap remains.

### Placeholder scan

- No `TBD`, `TODO`, “类似 Task N”, or unspecified “写测试” placeholders remain.
- Every task includes exact file paths, commands, and representative code targets.

### Type and naming consistency

- Canonical slugs are consistently named `study-report` and `feedback`.
- Route helper is consistently named `resolveCourseMaterialSlug`.
- The new homepage compact framework uses `course-framework*` naming throughout.
- The denser single-period layout uses `course-period-entry-*` naming throughout.

