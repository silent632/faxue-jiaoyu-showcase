# Course System Content Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将课程体系从“栏目页消费材料标签”改成“栏目页消费课程内容对象”，并优先完整重建第一、五、六、七、八期的真实课程内容。

**Architecture:** 保留 `/courses/[slug]` 与六个子页面路由不变，但新增一层 `courseContentProfile` 作为唯一页面数据源。原始资料继续由 `guide / outline / materialGroups` 提供底层线索，再由专门的内容构建层整理、转写和补写为网站可读内容。

**Tech Stack:** Next.js App Router, React Server Components, local content builders in `lib/`, global CSS, Node test runner

---

## File Structure

### New Files

- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-content-profiles.js`
  - 负责输出八期统一的 `courseContentProfile`
  - 第一期、第五期、第六期、第七期、第八期写完整内容
  - 第二、三、四期接入结构化骨架
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-content-profiles.test.mjs`
  - 验证 `courseContentProfile` 字段完整、页面不再依赖原始材料名

### Modified Files

- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-package.js`
  - 合并 `courseContentProfile`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-system-pages.js`
  - 改为纯页面映射层，停止直接输出样板段落
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/course-period-shell.js`
  - 让页面消费 `courseContentProfile`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/page.js`
  - 单期主页改成内容总览页
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/introduction/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/questions/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/content/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/materials/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/outcomes/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/teaching/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/page.js`
  - 总览页入口摘要改成课程内容导向
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
  - 新增内容型主页、案例块、成果块样式
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

---

### Task 1: Add Red Tests For Content-Profile Driven Course Pages

**Files:**
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-content-profiles.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-system-pages.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

- [ ] **Step 1: Write the failing content-profile data test**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { getCoursePackagePeriodBySlug } from "../../lib/course-package.js";

test("priority periods expose a complete courseContentProfile", () => {
  for (const slug of [
    "course-period-01",
    "course-period-05",
    "course-period-06",
    "course-period-07",
    "course-period-08",
  ]) {
    const period = getCoursePackagePeriodBySlug(slug);
    const profile = period.courseContentProfile;

    assert.ok(profile);
    assert.ok(profile.periodSummary);
    assert.ok(Array.isArray(profile.coreQuestions));
    assert.equal(profile.coreQuestions.length >= 3, true);
    assert.ok(Array.isArray(profile.contentFlow));
    assert.equal(profile.contentFlow.length >= 4, true);
    assert.ok(profile.caseStudy);
    assert.ok(profile.materialsInterpretation);
    assert.ok(profile.studentOutcomes);
    assert.ok(profile.teachingDesign);
  }
});
```

- [ ] **Step 2: Write the failing page-source test**

```js
import { readFileSync } from "node:fs";

test("course pages render courseContentProfile instead of raw material labels", () => {
  const homeSource = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");
  const outcomesSource = readFileSync(new URL("../../app/courses/[slug]/outcomes/page.js", import.meta.url), "utf8");

  assert.match(homeSource, /courseContentProfile/u);
  assert.match(outcomesSource, /courseContentProfile/u);
  assert.equal(/学生课后反馈（一）|学生研习报告（二）|双师合作互评问卷/u.test(homeSource + outcomesSource), false);
});
```

- [ ] **Step 3: Tighten public copy expectations**

```js
test("course system public copy avoids material-name placeholders", () => {
  const text = [
    readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/courses/[slug]/materials/page.js", import.meta.url), "utf8"),
    readFileSync(new URL("../../app/courses/[slug]/outcomes/page.js", import.meta.url), "utf8"),
  ].join("\n");

  assert.equal(/学生课后反馈（一）|学生课后反馈（二）|学生研习报告（二）|资料包制作清单/u.test(text), false);
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run:

```bash
node --test tests/core/course-content-profiles.test.mjs tests/core/course-package.test.mjs tests/core/course-system-pages.test.mjs tests/core/public-copy-tone.test.mjs
```

Expected: FAIL because `courseContentProfile` does not exist yet and pages still depend on older structures.

- [ ] **Step 5: Commit the red test baseline**

```bash
git add tests/core/course-content-profiles.test.mjs tests/core/course-package.test.mjs tests/core/course-system-pages.test.mjs tests/core/public-copy-tone.test.mjs
git commit -m "test: cover course content profile rebuild"
```

---

### Task 2: Build The `courseContentProfile` Data Layer

**Files:**
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-content-profiles.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-package.js`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-content-profiles.test.mjs`

- [ ] **Step 1: Add the shared profile shape**

```js
function buildProfileSkeleton(period) {
  return {
    periodSummary: {
      theme: period.guide.courseTheme || period.theme,
      position: period.module,
      bridge: period.phaseLabel,
      lead: period.guide.coursePosition || period.summary,
      keySignals: [],
    },
    coreQuestions: [],
    contentFlow: [],
    caseStudy: {
      mainCases: [],
      supportCases: [],
      controversies: [],
      comparisonPoints: [],
      analysisPath: [],
    },
    materialsInterpretation: {
      courseware: [],
      guideReading: [],
      taskDesign: [],
      supportingMaterials: [],
    },
    studentOutcomes: {
      reportFindings: [],
      feedbackInsights: [],
      classroomOutputs: [],
      learningShift: [],
    },
    teachingDesign: {
      mentorRoles: [],
      sessionStructure: [],
      trainingFocus: [],
      designHighlights: [],
    },
  };
}
```

- [ ] **Step 2: Add profile builders for priority periods**

```js
const PROFILE_BUILDERS = {
  "course-period-01": buildPeriod01Profile,
  "course-period-05": buildPeriod05Profile,
  "course-period-06": buildPeriod06Profile,
  "course-period-07": buildPeriod07Profile,
  "course-period-08": buildPeriod08Profile,
};

export function buildCourseContentProfile(period) {
  const builder = PROFILE_BUILDERS[period.slug];
  if (builder) return builder(period);
  return buildStructuredFallbackProfile(period);
}
```

- [ ] **Step 3: Merge profile into package lookup**

```js
import { buildCourseContentProfile } from "./course-content-profiles.js";

const courseContentProfile = buildCourseContentProfile({
  ...basePeriod,
  archiveCard,
  detailContent,
});

return {
  ...basePeriod,
  archiveCard,
  detailContent,
  courseContentProfile,
  ...courseSystemPages,
};
```

- [ ] **Step 4: Run the focused test**

Run:

```bash
node --test tests/core/course-content-profiles.test.mjs
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/course-content-profiles.js lib/course-package.js tests/core/course-content-profiles.test.mjs
git commit -m "feat: add course content profile layer"
```

---

### Task 3: Refactor `course-system-pages.js` Into A Pure Page-Mapping Layer

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-system-pages.js`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-package.test.mjs`

- [ ] **Step 1: Replace hard-coded sample prose with profile mapping**

```js
function buildPeriodHome(period) {
  const profile = period.courseContentProfile;

  return {
    summary: profile.periodSummary.lead,
    highlights: profile.periodSummary.keySignals,
    cards: COURSE_PERIOD_SECTIONS.map((section) => ({
      key: section.key,
      label: section.label,
      summary: profile.sectionSummaries[section.key].summary,
      detail: profile.sectionSummaries[section.key].detail,
      href: `/courses/${period.slug}/${section.hrefSegment}`,
    })),
  };
}
```

- [ ] **Step 2: Map six sections from profile data**

```js
function buildSectionPages(period) {
  const profile = period.courseContentProfile;

  return {
    introduction: profile.sectionPages.introduction,
    questions: profile.sectionPages.questions,
    content: profile.sectionPages.content,
    materials: profile.sectionPages.materials,
    outcomes: profile.sectionPages.outcomes,
    teaching: profile.sectionPages.teaching,
  };
}
```

- [ ] **Step 3: Remove direct sample-page builders that duplicate content**

```js
export function buildCourseSystemPages(period) {
  return {
    periodHome: buildPeriodHome(period),
    sectionNavItems: buildSectionNavItems(period),
    sectionPages: buildSectionPages(period),
  };
}
```

- [ ] **Step 4: Run related tests**

Run:

```bash
node --test tests/core/course-package.test.mjs tests/core/course-system-pages.test.mjs
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/course-system-pages.js tests/core/course-package.test.mjs tests/core/course-system-pages.test.mjs
git commit -m "refactor: map course pages from content profiles"
```

---

### Task 4: Rewrite The Course Pages To Render Real Content Blocks

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/course-period-shell.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/introduction/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/questions/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/content/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/materials/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/outcomes/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/teaching/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`

- [ ] **Step 1: Expand shell rendering helpers for richer blocks**

```js
function renderInsightGroups(groups) {
  return (
    <div className="course-insight-grid">
      {groups.map((group) => (
        <article key={group.title} className="course-insight-card">
          <strong>{group.title}</strong>
          <p>{group.summary}</p>
          <ul className="course-detail-list">
            {group.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Rewrite single-period homepage**

```js
const profile = period.courseContentProfile;

<ShowcaseSection title="本期线索" ...>
  <div className="course-period-home-grid">
    <article className="course-period-home-panel">
      <strong>课程主线</strong>
      <p>{profile.periodSummary.position}</p>
      <ul className="course-detail-list">
        {profile.periodSummary.keySignals.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
    <article className="course-period-home-panel">
      <strong>核心案例</strong>
      <ul className="course-detail-list">
        {profile.caseStudy.mainCases.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  </div>
</ShowcaseSection>
```

- [ ] **Step 3: Point subpages to profile-backed section objects**

```js
const section = period.sectionPages.outcomes;
return (
  <CoursePeriodShell ...>
    <CoursePeriodSectionContent period={period} section={section} />
  </CoursePeriodShell>
);
```

- [ ] **Step 4: Add styles for content-heavy blocks**

```css
.course-insight-grid,
.course-case-grid,
.course-flow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.course-insight-card,
.course-case-card,
.course-flow-card {
  display: grid;
  gap: 12px;
  padding: 22px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(247,241,232,.98));
  border: 1px solid rgba(35, 67, 93, .1);
}
```

- [ ] **Step 5: Run page-source tests**

Run:

```bash
node --test tests/core/course-system-pages.test.mjs tests/core/public-copy-tone.test.mjs
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/course-period-shell.js app/courses/[slug]/page.js app/courses/[slug]/introduction/page.js app/courses/[slug]/questions/page.js app/courses/[slug]/content/page.js app/courses/[slug]/materials/page.js app/courses/[slug]/outcomes/page.js app/courses/[slug]/teaching/page.js app/globals.css tests/core/course-system-pages.test.mjs tests/core/public-copy-tone.test.mjs
git commit -m "feat: render course pages from rebuilt content"
```

---

### Task 5: Fill Priority Period Profiles With Real Course Content

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/course-content-profiles.js`
- Test: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/course-content-profiles.test.mjs`

- [ ] **Step 1: Write the first-period profile from early-stage materials**

```js
function buildPeriod01Profile(period) {
  return {
    periodSummary: {
      theme: "类案检索与法律适用",
      position: "作为八期课程的方法起点，先建立类案检索、比较阅读和争点识别的进入方式。",
      bridge: "后续期次都会沿用第一期建立的案例进入路径。",
      lead: "第一期不是单讲检索工具，而是把类案检索放回裁判文书阅读、争点识别和课堂表达的起点位置。",
      keySignals: [
        "从类案检索进入裁判文书阅读。",
        "借名买房案与优先承租权案构成第一组训练样本。",
        "课堂重点在于把检索结果转成导读判断。",
      ],
    },
    // 其余字段按同一结构完整补足
  };
}
```

- [ ] **Step 2: Write the fifth-to-eighth-period profiles from guide + voiceover + manifest**

```js
function buildPeriod06Profile(period) {
  return {
    periodSummary: {
      theme: "人脸识别中的同意边界与法理回应",
      position: "从数字治理进入人格权保护，讨论效率、安全与权利边界如何重新划定。",
      bridge: "承接第五期的权力边界问题，并为第七期的平台控制议题铺路。",
      lead: "第六期把人脸识别放回个人信息保护与数字人格权框架中理解，重点不在技术能否做到，而在法律边界应如何画定。",
      keySignals: [
        "同意不是人脸识别正当化的终点。",
        "必要性与比例性决定治理边界。",
        "人脸信息问题本质上是人格边界问题。",
      ],
    },
    // 其余字段按同一结构完整补足
  };
}
```

- [ ] **Step 3: Add structured fallback profiles for 02/03/04**

```js
function buildStructuredFallbackProfile(period) {
  const skeleton = buildProfileSkeleton(period);
  return {
    ...skeleton,
    periodSummary: {
      ...skeleton.periodSummary,
      keySignals: (period.outline || []).slice(0, 4),
    },
    coreQuestions: (period.guide.caseDirections || []).slice(0, 3).map((item) => ({
      question: item,
      whyItMatters: period.guide.coursePosition || period.summary,
      judgmentPath: "先回到案件事实，再进入规范判断和法理衡量。",
    })),
  };
}
```

- [ ] **Step 4: Run profile tests**

Run:

```bash
node --test tests/core/course-content-profiles.test.mjs tests/core/course-package.test.mjs
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/course-content-profiles.js tests/core/course-content-profiles.test.mjs tests/core/course-package.test.mjs
git commit -m "feat: rebuild priority course content profiles"
```

---

### Task 6: Final Tone Sweep And Full Verification

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/[slug]/outcomes/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

- [ ] **Step 1: Remove residual placeholder-style phrasing**

```js
for (const source of [homeSource, materialsSource, outcomesSource]) {
  assert.equal(/学生课后反馈（一）|学生研习报告（二）|资料包制作清单|在这里可以/u.test(source), false);
}
```

- [ ] **Step 2: Update course index copy to match the rebuilt content model**

```js
<p>八期课程按主题推进，进入各期主页后可继续查看课程主线、案例争点、学习成果和教学安排。</p>
```

- [ ] **Step 3: Run the full core suite**

Run:

```bash
npm run test:core
```

Expected:

```txt
ℹ pass <all>
ℹ fail 0
```

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected:

```txt
✓ Compiled successfully
✓ Generating static pages
✓ Exporting
```

- [ ] **Step 5: Commit**

```bash
git add app/courses/page.js app/courses/[slug]/page.js app/courses/[slug]/outcomes/page.js tests/core/public-copy-tone.test.mjs
git commit -m "refine: finalize course content rebuild"
```
