# Course System Unified Material Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the course-system experience into a unified 14-material archive model, using period 02 as the final template and extending the same structure across all eight periods.

**Architecture:** Replace the old six-section course model with a standard-material schema that drives period homes, directory navigation, and one generic material route. Keep course-level source parsing in `lib/course-package.js`, move public material-page generation into a dedicated builder module, and reshape the UI around a light directory plus content-first reading layout. Use period-specific narrative builders so periods 05 to 08 read like teaching materials rather than video-production artifacts.

**Tech Stack:** Next.js App Router, React server components, Node built-in test runner (`node --test`), project-local content builder modules in `lib/`.

---

## File Structure

**Create**
- `lib/course-material-pages.js`
- `components/course-material-directory.js`
- `components/course-material-article.js`
- `app/courses/[slug]/[materialSlug]/page.js`
- `tests/core/course-material-pages.test.mjs`
- `docs/superpowers/plans/2026-04-13-course-system-unified-material-rebuild-implementation.md`

**Modify**
- `lib/course-package.js`
- `lib/course-content-profiles.js`
- `app/courses/page.js`
- `app/courses/[slug]/page.js`
- `components/course-period-shell.js`
- `app/globals.css`
- `tests/core/course-package.test.mjs`
- `tests/core/course-system-pages.test.mjs`
- `tests/core/public-copy-tone.test.mjs`

**Delete**
- `app/courses/[slug]/introduction/page.js`
- `app/courses/[slug]/questions/page.js`
- `app/courses/[slug]/content/page.js`
- `app/courses/[slug]/materials/page.js`
- `app/courses/[slug]/outcomes/page.js`
- `app/courses/[slug]/teaching/page.js`

### Task 1: Replace six-section tests with 14-material expectations

**Files:**
- Modify: `tests/core/course-package.test.mjs`
- Modify: `tests/core/course-system-pages.test.mjs`
- Modify: `tests/core/public-copy-tone.test.mjs`
- Create: `tests/core/course-material-pages.test.mjs`

- [ ] **Step 1: Write the failing test for the new material schema**

```js
test("course package exposes a period home plus fourteen standard material pages", () => {
  const periods = getCoursePackagePeriods();
  const period02 = periods.find((item) => item.slug === "course-period-02");

  assert.ok(period02.periodHome);
  assert.equal(period02.materialDirectory.length, 4);
  assert.equal(period02.materialPages.length, 14);
  assert.equal(period02.materialPages[0].slug, "teaching-guide");
  assert.equal(period02.materialPages.at(-1).slug, "feedback-03");
});
```

- [ ] **Step 2: Write the failing source-structure test**

```js
test("course system source includes one dynamic material route instead of six fixed child routes", async () => {
  const dynamicRoute = readFileSync("app/courses/[slug]/[materialSlug]/page.js", "utf8");

  assert.match(dynamicRoute, /materialSlug/u);
  assert.doesNotMatch(dynamicRoute, /sectionPages\.introduction/u);
  assert.doesNotMatch(dynamicRoute, /sectionPages\.questions/u);
});
```

- [ ] **Step 3: Write the failing builder test for late-period rewrites**

```js
test("late periods expose course-style material pages instead of production-process copy", () => {
  const period05 = getCoursePackagePeriodBySlug("course-period-05");
  const guidePage = period05.materialPages.find((item) => item.slug === "teaching-guide");

  assert.ok(guidePage.lead.length > 30);
  assert.doesNotMatch(guidePage.lead, /manifest|配音稿|时长表|制作清单/u);
});
```

- [ ] **Step 4: Run tests to verify the new assertions fail**

Run:

```bash
npm run test:core
```

Expected:
- FAIL in `tests/core/course-package.test.mjs`
- FAIL in `tests/core/course-system-pages.test.mjs`
- FAIL in `tests/core/course-material-pages.test.mjs`
- failures reference missing `materialPages`, missing dynamic route, and old six-section assumptions

### Task 2: Build the standard-material schema and page builder

**Files:**
- Create: `lib/course-material-pages.js`
- Modify: `lib/course-package.js`
- Modify: `lib/course-content-profiles.js`
- Test: `tests/core/course-material-pages.test.mjs`

- [ ] **Step 1: Add the standard material definition module**

```js
export const STANDARD_COURSE_MATERIALS = [
  { slug: "teaching-guide", label: "教学材料指南", group: "教学设计类", order: 1 },
  { slug: "jurisprudence-guide", label: "裁判文书法理导学", group: "教学设计类", order: 2 },
  { slug: "study-task-sheet", label: "裁判文书研习任务单", group: "教学设计类", order: 3 },
  { slug: "mentor-role-plan", label: "双师职责分工表", group: "课堂实施类", order: 4 },
  { slug: "classroom-observation", label: "双师课堂记录观察表", group: "课堂实施类", order: 5 },
  { slug: "peer-review-theory", label: "双师合作互评问卷（理论导师）", group: "协同反思类", order: 6 },
  { slug: "peer-review-practice", label: "双师合作互评问卷（实务导师）", group: "协同反思类", order: 7 },
  { slug: "evaluation-metrics", label: "学生综合能力评价指标体系", group: "学习成果类", order: 8 },
  { slug: "study-report-01", label: "学生研习报告（一）", group: "学习成果类", order: 9 },
  { slug: "study-report-02", label: "学生研习报告（二）", group: "学习成果类", order: 10 },
  { slug: "study-report-03", label: "学生研习报告（三）", group: "学习成果类", order: 11 },
  { slug: "feedback-01", label: "学生课后反馈（一）", group: "学习成果类", order: 12 },
  { slug: "feedback-02", label: "学生课后反馈（二）", group: "学习成果类", order: 13 },
  { slug: "feedback-03", label: "学生课后反馈（三）", group: "学习成果类", order: 14 },
];
```

- [ ] **Step 2: Add the material-page builder API**

```js
export function buildCourseMaterialPages(period) {
  const directory = buildMaterialDirectory(period);
  const pages = STANDARD_COURSE_MATERIALS.map((definition) =>
    buildMaterialPage(period, definition)
  );

  return { materialDirectory: directory, materialPages: pages };
}
```

- [ ] **Step 3: Wire the builder into `lib/course-package.js`**

```js
import { buildCourseMaterialPages } from "./course-material-pages.js";

const materialPagesModel = buildCourseMaterialPages({
  ...basePeriod,
  archiveCard,
  detailContent,
  courseContentProfile,
});

return {
  ...basePeriod,
  archiveCard,
  detailContent,
  courseContentProfile,
  ...materialPagesModel,
};
```

- [ ] **Step 4: Add profile-level aliases needed for report and feedback mapping**

```js
studentOutcomes: {
  reportFindings: existingReportFindings,
  feedbackInsights: existingFeedbackInsights,
  reportViews: [
    { key: "study-report-01", title: "代表性研习报告（一）", paragraphs: existingReportFindings.slice(0, 2) },
    { key: "study-report-02", title: "代表性研习报告（二）", paragraphs: existingReportFindings.slice(1, 3) },
    { key: "study-report-03", title: "代表性研习报告（三）", paragraphs: existingReportFindings.slice(-2) },
  ],
  feedbackViews: [
    { key: "feedback-01", title: "课后反馈（一）", paragraphs: existingFeedbackInsights.slice(0, 2) },
    { key: "feedback-02", title: "课后反馈（二）", paragraphs: existingFeedbackInsights.slice(1, 3) },
    { key: "feedback-03", title: "课后反馈（三）", paragraphs: existingFeedbackInsights.slice(-2) },
  ],
}
```

- [ ] **Step 5: Run the focused tests**

Run:

```bash
node --test tests/core/course-material-pages.test.mjs tests/core/course-package.test.mjs
```

Expected:
- PASS in new material-schema assertions
- other tests still fail because routes and UI have not been rebuilt yet

### Task 3: Replace the six-section route tree with a generic material route

**Files:**
- Create: `app/courses/[slug]/[materialSlug]/page.js`
- Modify: `components/course-period-shell.js`
- Create: `components/course-material-directory.js`
- Create: `components/course-material-article.js`
- Delete: `app/courses/[slug]/introduction/page.js`
- Delete: `app/courses/[slug]/questions/page.js`
- Delete: `app/courses/[slug]/content/page.js`
- Delete: `app/courses/[slug]/materials/page.js`
- Delete: `app/courses/[slug]/outcomes/page.js`
- Delete: `app/courses/[slug]/teaching/page.js`
- Test: `tests/core/course-system-pages.test.mjs`

- [ ] **Step 1: Write the generic material route**

```js
export function generateStaticParams() {
  return getCoursePackagePeriods().flatMap((period) =>
    period.materialPages.map((page) => ({
      slug: period.slug,
      materialSlug: page.slug,
    }))
  );
}

export default async function CourseMaterialPage({ params }) {
  const { slug, materialSlug } = await params;
  const period = getCoursePackagePeriodBySlug(slug);
  const page = period?.materialPages.find((item) => item.slug === materialSlug);

  if (!period || !page) notFound();

  return (
    <CoursePeriodShell period={period} title={`${period.period} · ${page.label}`} summary={page.lead} activeMaterialSlug={page.slug}>
      <CourseMaterialArticle period={period} page={page} />
    </CoursePeriodShell>
  );
}
```

- [ ] **Step 2: Add the light directory component**

```js
export default function CourseMaterialDirectory({ groups, activeSlug }) {
  return (
    <nav className="course-material-directory" aria-label="本期材料目录">
      {groups.map((group) => (
        <section key={group.title} className="course-material-directory-group">
          <strong>{group.title}</strong>
          {group.items.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className={`course-material-directory-link${item.slug === activeSlug ? " active" : ""}`}
            >
              <span>{String(item.order).padStart(2, "0")}</span>
              <span>{item.shortLabel}</span>
            </Link>
          ))}
        </section>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: Update `CoursePeriodShell` to support material navigation**

```js
export function CoursePeriodShell({ period, title, summary, activeMaterialSlug = null, children }) {
  const directory = activeMaterialSlug ? (
    <CourseMaterialDirectory groups={period.materialDirectory} activeSlug={activeMaterialSlug} />
  ) : null;

  return (
    <main className="showcase-page" data-page-role="course-detail">
      <ShowcaseNav />
      <div className="showcase-page-body">
        <div className="course-detail-back-row">
          <Link href="/courses" className="btn btn-ghost">返回课程体系</Link>
        </div>
        <section className="showcase-card course-detail-hero">
          <div className="course-detail-hero-copy">
            <p className="showcase-page-kicker">{period.period}</p>
            <h1>{title}</h1>
            <p className="course-detail-lead">{summary}</p>
          </div>
        </section>
        {directory}
        {children}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run route-structure tests**

Run:

```bash
node --test tests/core/course-system-pages.test.mjs
```

Expected:
- PASS in dynamic-route assertions
- no references remain to `sectionPages.introduction` or the six fixed child routes

### Task 4: Rebuild `/courses` and `/courses/[slug]` around the new archive model

**Files:**
- Modify: `app/courses/page.js`
- Modify: `app/courses/[slug]/page.js`
- Modify: `tests/core/public-copy-tone.test.mjs`
- Modify: `tests/core/course-package.test.mjs`

- [ ] **Step 1: Rewrite the courses overview page**

```js
<section className="showcase-page-head">
  <p className="showcase-page-kicker">课程体系</p>
  <h1>八期课程档案</h1>
  <p>八期课程按法理主题推进，每一期进入后先看课程引子，再按统一材料目录展开具体页面。</p>
</section>
```

- [ ] **Step 2: Rewrite the period home around identity, bridge, logic chain, and entry matrix**

```js
const featuredQuestions = period.courseContentProfile.coreQuestions.slice(0, 3);

<CoursePeriodShell period={period} title={period.title} summary={period.periodHome.summary}>
  <ShowcaseSection title="本期定位" eyebrow={period.period} description={period.courseContentProfile.periodSummary.lead}>
    <p>{period.courseContentProfile.periodSummary.position}</p>
  </ShowcaseSection>
  <section className="course-period-logic-grid">
    {featuredQuestions.map((item) => <article key={item.question}>{item.question}</article>)}
  </section>
  <section className="course-period-entry-grid">
    {period.materialDirectory.flatMap((group) => group.items).map((item) => (
      <Link key={item.slug} href={item.href} className="course-period-entry-card">{item.label}</Link>
    ))}
  </section>
</CoursePeriodShell>
```

- [ ] **Step 3: Drop copy that still references six fixed columns**

```js
assert.doesNotMatch(pageSource, /六个栏目|本期导读 · 重点问题 · 内容展开/u);
assert.match(pageSource, /统一材料目录|本期材料页/u);
```

- [ ] **Step 4: Run the page-shape tests**

Run:

```bash
node --test tests/core/course-package.test.mjs tests/core/public-copy-tone.test.mjs
```

Expected:
- PASS in new overview/home-page assertions
- FAIL only where material-page content has not yet been updated

### Task 5: Make period 02 the final template with concrete material-page content

**Files:**
- Modify: `lib/course-material-pages.js`
- Modify: `lib/course-content-profiles.js`
- Test: `tests/core/course-material-pages.test.mjs`

- [ ] **Step 1: Encode period 02 page leads and “this page proves” copy**

```js
{
  slug: "teaching-guide",
  lead: "第二期教学材料指南负责交代课程主题、核心案件、材料组成与教学逻辑链，是整个资料包的总入口。",
  purpose: "证明第二期的课程设计是如何从法理主题、案例选择、双师分工一路落到材料组织的。",
}
```

- [ ] **Step 2: Build concrete section blocks from the existing period-02 profile and source-rich text**

```js
if (period.slug === "course-period-02" && definition.slug === "jurisprudence-guide") {
  return {
    ...basePage,
    sections: [
      { title: "案件基本信息", bullets: ["案件名称：“小马奔腾”案。", "核心文书：（2020）最高法民申2195号民事裁定书。", "核心争议：经营性债务在何种条件下认定为夫妻共同债务。"] },
      { title: "法理提炼", bullets: ["权利义务相一致强调权利与风险同步承担。", "受益者负担是该原则在财产法领域的具体表达。", "《民法典》第1064条需要结合共同生产经营作目的解释。"] },
      { title: "四步推演链", bullets: ["主张共同财产。", "确认利益共同体身份。", "共同承担经营风险。", "据此认定共同债务。"] },
      { title: "思考题", bullets: ["不知情但受益是否担责。", "知情但未受益如何判断。", "受益与知情哪个因素更关键。"] },
    ],
  };
}
```

- [ ] **Step 3: Give reports and feedback pages concrete, separate identities**

```js
reportViews: [
  { key: "study-report-01", title: "权责对等：从“小马奔腾”案看第1064条的实质正义", paragraphs: ["围绕权责一致重构夫妻共同债务的判断路径。", "说明为何形式签字标准不足以解释本案。"] },
  { key: "study-report-02", title: "实质的公平：从受益者负担看裁判智慧", paragraphs: ["把受益者负担作为法院说理的核心支点。", "比较实质审查与形式审查的差异。"] },
  { key: "study-report-03", title: "从形式到实质：法律思维在案件中的进化", paragraphs: ["把旧24条背景与第1064条适用放在一起比较。", "讨论知情、受益、共同经营之间的边界。"] },
]
```

- [ ] **Step 4: Run the period-02 material tests**

Run:

```bash
node --test tests/core/course-material-pages.test.mjs
```

Expected:
- PASS in concrete period-02 content assertions
- no page lead contains raw production-process wording

### Task 6: Map periods 01, 03, and 04 into the standard material model

**Files:**
- Modify: `lib/course-material-pages.js`
- Modify: `lib/course-content-profiles.js`
- Test: `tests/core/course-material-pages.test.mjs`

- [ ] **Step 1: Normalize early-period aliases into the standard report and feedback slots**

```js
const reportViews = normalizeThreeSlotViews({
  entries: period.courseContentProfile.studentOutcomes.reportViews,
  fallbackLabel: "学生研习报告",
});

const feedbackViews = normalizeThreeSlotViews({
  entries: period.courseContentProfile.studentOutcomes.feedbackViews,
  fallbackLabel: "学生课后反馈",
});
```

- [ ] **Step 2: Rebuild period 01 pages from PNG/PDF-era content**

```js
if (period.slug === "course-period-01") {
  return {
    ...basePage,
    sections: [
      { title: "课程起点", paragraphs: ["第一期的任务不是讲工具，而是建立类案检索进入裁判文书研习的起点。"] },
      { title: "类案检索与阅读路径", bullets: ["划定类案范围。", "按事实、争点、说理顺序阅读。", "比较借名买房案与优先承租权案的裁判分歧。"] },
      { title: "争点识别与表达训练", bullets: ["把检索结果转成导读判断。", "说明事实差异如何影响法律适用。", "形成课堂表达结论。"] },
    ],
  };
}
```

- [ ] **Step 3: Confirm periods 03 and 04 keep their own themes while adopting the shared structure**

```js
assert.match(period03.materialPages.find((item) => item.slug === "teaching-guide").lead, /多元纠纷解决机制/u);
assert.match(period04.materialPages.find((item) => item.slug === "jurisprudence-guide").lead, /沉睡的权利/u);
```

- [ ] **Step 4: Run the focused early-period tests**

Run:

```bash
node --test tests/core/course-material-pages.test.mjs tests/core/course-package.test.mjs
```

Expected:
- PASS in periods 01, 03, and 04 mapping assertions
- remaining work concentrates in periods 05 to 08 rewrites

### Task 7: Rewrite periods 05 to 08 into course-style teaching materials

**Files:**
- Modify: `lib/course-material-pages.js`
- Modify: `lib/course-content-profiles.js`
- Test: `tests/core/course-material-pages.test.mjs`
- Test: `tests/core/public-copy-tone.test.mjs`

- [ ] **Step 1: Convert each late-period teaching guide into course-facing copy**

```js
if (period.slug === "course-period-05") {
  return {
    ...basePage,
    lead: "第五期围绕非法证据排除规则组织程序正义与权利保障的课堂进入，不再展示视频制作过程文件。",
    sections: [
      { title: "课程主题与问题进入", paragraphs: ["第五期围绕非法证据排除规则，处理程序正义、权利保障与刑事证明之间的张力。"] },
      { title: "核心案例与课堂任务", bullets: ["围绕非法取证场景进入案件分析。", "要求学生判断证据排除的规范基础与适用边界。", "把规则适用转成课堂论证与报告输出。"] },
      { title: "双师如何推进讨论", bullets: ["理论导师负责程序正义与排除规则框架。", "实务导师负责取证场景、审判逻辑与排除实务。"] },
    ],
  };
}
```

- [ ] **Step 2: Expand each late-period report and feedback slot to three concrete pages**

```js
reportViews: [
  { key: "study-report-01", title: "规则论证视角", paragraphs: ["围绕本期核心规则解释其法理基础。", "说明规则为什么应当以这种方式适用。"] },
  { key: "study-report-02", title: "案例比较视角", paragraphs: ["比较不同案件中同一规则的适用差异。", "归纳差异背后的关键事实与制度考量。"] },
  { key: "study-report-03", title: "边界追问视角", paragraphs: ["提出规则适用最容易出现争议的边界情形。", "对课堂没有完全展开的问题继续追问。"] },
]
```

- [ ] **Step 3: Verify no late-period public page leaks process-only wording**

```js
assert.doesNotMatch(pageText, /manifest|配音稿|制作清单|逐页时长表/u);
assert.match(pageText, /课堂|案例|法理|研习|学生/u);
```

- [ ] **Step 4: Run the late-period rewrite tests**

Run:

```bash
npm run test:core
```

Expected:
- PASS in all course-material assertions
- no public-copy regressions

### Task 8: Style the new archive model and verify the full app

**Files:**
- Modify: `app/globals.css`
- Test: `tests/core/public-copy-tone.test.mjs`

- [ ] **Step 1: Add lightweight directory and content-first layout styles**

```css
.course-material-layout {
  display: grid;
  grid-template-columns: minmax(180px, 220px) minmax(0, 1fr);
  gap: 20px;
}

.course-material-directory {
  position: sticky;
  top: 92px;
}

.course-material-article {
  display: grid;
  gap: 18px;
}
```

- [ ] **Step 2: Add mobile collapse behavior**

```css
@media (max-width: 920px) {
  .course-material-layout {
    grid-template-columns: 1fr;
  }

  .course-material-directory {
    position: static;
  }
}
```

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run test:core
npm run build
```

Expected:
- `npm run test:core` => PASS
- `npm run build` => PASS
- no references remain to the retired six-section model

- [ ] **Step 4: Commit**

```bash
git add app/courses app/globals.css components/course-material-article.js components/course-material-directory.js components/course-period-shell.js lib/course-content-profiles.js lib/course-material-pages.js lib/course-package.js tests/core
git commit -m "feat: rebuild course system as unified material archive"
```
