# Showcase Platform Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有展示站重构为“真实在运行的平台型网站”，系统吸收 8 个独立 HTML 页面中的运行、应用、成效与视频推广信息，同时保留案例检索、研习工作台、成效展示与课程视频的独立平台入口。

**Architecture:** 以现有 Next.js App Router 结构为基础，不新增独立 HTML 路由，而是扩展 `buildShowcaseContent()` 的内容模型，先统一导航与内容语义，再分别重构首页、成效页、课程视频页，最后联动案例、详情、研习和课程体系页面，确保全站叙事一致。实现上优先复用现有页面骨架与组件风格，只在首页与成效页新增少量平台总览型组件，避免把站点做成“后台截图拼装体”。

**Tech Stack:** Next.js App Router, React Server Components, existing showcase content builder, global CSS, Node test runner, existing public case/study helpers

---

## File Structure

### Existing files to modify

- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/showcase-content.js`
  Purpose: 统一全站导航、首页运营总览内容、成效页趋势与覆盖内容、视频页内容源。
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/top-nav.js`
  Purpose: 首页、案例页与研习链路页共用的新导航排序与命名。
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-nav.js`
  Purpose: 支撑内容页使用与首页一致的功能逻辑导航。
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/page.js`
  Purpose: 将首页从“平台门厅”重构为“运营总览首页”。
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-home-hero.js`
  Purpose: 将 hero 从入口导向改为成效与影响导向。
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/impact/page.js`
  Purpose: 重构成“平台应用成效总览页”。
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/resources/page.js`
  Purpose: 将当前教学资源页转向“课程视频 / 视频共享页”。
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/page.js`
  Purpose: 将课程体系页降为支撑页，弱化首页主叙事角色。
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/cases/page.js`
  Purpose: 与新首页叙事对齐，保持真实平台入口感。
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/cases/[id]/page.js`
  Purpose: 强化详情页作为平台真实使用链路中间层的定位。
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/cases/[id]/study/page.js`
  Purpose: 保持研习工作台作为深度使用证明的定位。
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
  Purpose: 增加首页总览、成效趋势、视频页和导航重排所需样式。

### New files to create

- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-operations-band.js`
  Purpose: 首页与成效页共用的指标/摘要带状区。
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-trend-panel.js`
  Purpose: 复用的趋势可视化与趋势摘要面板。
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-video-hub.js`
  Purpose: 视频页主视频、播放列表和传播快照的原生站内表达。
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-platform-integration.test.mjs`
  Purpose: 守护新的导航顺序、首页运营总览结构、成效页运行趋势结构和视频页角色。

### Existing tests to modify

- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-content.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-nav-match.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

### Scope check

虽然本 spec 触及首页、成效、视频、案例与课程等多个页面，但它们共享同一个内容模型、同一套导航逻辑和同一平台叙事，属于一个连贯的重构面，不拆成多个 plans 更适合原子化落地。

---

### Task 1: Reframe Site Content Model And Navigation

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/lib/showcase-content.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/top-nav.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-nav.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-content.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-nav-match.test.mjs`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-platform-integration.test.mjs`

- [ ] **Step 1: Write the failing navigation and content-model tests**

```js
test("showcase nav order prioritizes platform entry before impact and courses", () => {
  const content = buildShowcaseContent();
  const studyHref = getShowcaseCanonicalStudyHref();

  assert.deepEqual(content.nav.map((item) => item.label), [
    "首页",
    "案例检索",
    "研习工作台",
    "成效展示",
    "课程视频",
    "课程体系",
  ]);
  assert.deepEqual(content.nav.map((item) => item.href), ["/", "/cases", studyHref, "/impact", "/resources", "/courses"]);
});

test("showcase content exposes operations-first homepage and impact datasets", () => {
  const content = buildShowcaseContent();

  assert.ok(content.homeDashboard);
  assert.equal(content.homeDashboard.kpis.length >= 4, true);
  assert.ok(content.homeDashboard.trendSnapshot);
  assert.ok(content.impactDashboard);
  assert.ok(content.impactDashboard.trendPanels.length >= 2);
  assert.ok(content.videoHub);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-content.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-nav-match.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-platform-integration.test.mjs
```

Expected: FAIL because the current nav labels/order and operations-first content groups do not exist yet.

- [ ] **Step 3: Add the minimal centralized nav and operations-first content structure**

```js
nav: [
  { label: "首页", href: "/", matchPrefix: "/" },
  { label: "案例检索", href: "/cases", matchKind: "cases" },
  { label: "研习工作台", href: studyDemoHref, matchKind: "study" },
  { label: "成效展示", href: "/impact", matchPrefix: "/impact" },
  { label: "课程视频", href: "/resources", matchPrefix: "/resources" },
  { label: "课程体系", href: "/courses", matchPrefix: "/courses" },
],
homeDashboard: {
  hero: {
    kicker: "平台总览",
    title: "平台应用成效与推广影响已经形成",
    description: "围绕持续运行、应用覆盖、使用强度与视频推广，共同建立平台真实在用的第一认知。",
  },
  kpis: [
    { key: "totalVisits", label: "累计访问", value: "5万+", tone: "primary" },
    { key: "activeUsers", label: "活跃用户", value: "612", tone: "secondary" },
    { key: "workspaceReturnRate", label: "工作台回访率", value: "71%", tone: "secondary" },
  ],
  trendSnapshot: {
    title: "运行趋势保持持续抬升",
    points: ["近 30 天访问量持续增长", "内容更新与活跃变化同步出现", "高活跃模块形成稳定使用结构"],
  },
},
impactDashboard: {
  trendPanels: [
    { id: "traffic", title: "访问与活跃趋势", period: "近30天" },
    { id: "content", title: "内容更新趋势", period: "近30天" },
  ],
  coverageCards: [
    { label: "累计访问", value: "5万+" },
    { label: "案例检索使用占比", value: "63%" },
    { label: "工作台回访率", value: "71%" },
  ],
},
videoHub: {
  title: "示范性教学视频",
  featured: { title: "类案检索与法律适用", href: "https://..." },
  playlist: [...],
  outreachStats: [...],
},
```

- [ ] **Step 4: Make both nav components consume the same new item semantics**

```jsx
export default function TopNav({ user, items = NAV_ITEMS }) {
  const pathname = usePathname();

  return (
    <header className="topbar showcase-topbar">
      ...
      <nav className="topbar-links" aria-label="主导航">
        <div className="topbar-links-track">
          {items.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className={`nav-tab${isActive(pathname, item) ? " active" : ""}`}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      ...
    </header>
  );
}
```

- [ ] **Step 5: Re-run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-content.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-nav-match.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-platform-integration.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add lib/showcase-content.js components/top-nav.js components/showcase-nav.js tests/core/showcase-content.test.mjs tests/core/showcase-nav-match.test.mjs tests/core/showcase-platform-integration.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: reframe showcase navigation and content model"
```

Expected: tests PASS, commit created.

### Task 2: Rebuild Homepage As An Operations Overview

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-home-hero.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-operations-band.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-trend-panel.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

- [ ] **Step 1: Write the failing homepage structure tests**

```js
test("homepage prioritizes operations metrics and trend modules before platform entry links", () => {
  const source = readFileSync(new URL("../../app/page.js", import.meta.url), "utf8");

  assert.match(source, /homepage-operations-kpis/u);
  assert.match(source, /homepage-trend-summary/u);
  assert.match(source, /homepage-coverage-band/u);
  assert.match(source, /homepage-platform-entry-grid/u);
});

test("homepage hero copy leads with impact instead of functional hallway language", () => {
  const text = JSON.stringify(buildShowcaseContent().homeDashboard.hero);

  assert.match(text, /应用成效|推广影响/u);
  assert.equal(/持续学习入口|平台门厅|先进入平台/u.test(text), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
```

Expected: FAIL because the homepage still uses pathway/case-preview/overview-first structure.

- [ ] **Step 3: Replace the homepage body with operations-first sections**

```jsx
<main className="showcase-page">
  <TopNav user={user} items={content.nav} />
  <div className="showcase-page-body">
    <ShowcaseHomeHero content={content} featuredCases={featuredCases} canonicalStudyHref={studyHref} />
    <ShowcaseOperationsBand className="homepage-operations-kpis" items={content.homeDashboard.kpis} />
    <section className="homepage-trend-summary showcase-card">
      <ShowcaseTrendPanel panel={content.homeDashboard.trendSnapshot} compact />
    </section>
    <section className="homepage-coverage-band showcase-card">...</section>
    <section className="homepage-impact-outreach showcase-card">...</section>
    <section className="homepage-platform-entry-grid">...</section>
    <section className="homepage-supporting-overview">...</section>
  </div>
</main>
```

- [ ] **Step 4: Rebuild the hero toward platform impact**

```jsx
<section className="showcase-home-hall showcase-home-ops-hero">
  <div className="showcase-home-hall-main">
    <div className="showcase-home-hall-copy">
      <p className="showcase-home-kicker">{content.homeDashboard.hero.kicker}</p>
      <h1>{content.homeDashboard.hero.title}</h1>
      <p>{content.homeDashboard.hero.description}</p>
    </div>
    <aside className="showcase-home-hall-aside showcase-home-state-card">
      <strong>运行摘要</strong>
      <ul>
        {content.homeDashboard.trendSnapshot.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </aside>
  </div>
</section>
```

- [ ] **Step 5: Add homepage-specific operations styling**

```css
.homepage-operations-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.homepage-trend-summary,
.homepage-coverage-band,
.homepage-impact-outreach {
  margin-top: 24px;
}

.homepage-platform-entry-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.showcase-home-ops-hero .showcase-home-hall-copy h1 {
  max-width: 12ch;
}
```

- [ ] **Step 6: Re-run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/homepage-content.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/page.js components/showcase-home-hero.js components/showcase-operations-band.js components/showcase-trend-panel.js app/globals.css tests/core/homepage-content.test.mjs tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: rebuild homepage as operations overview"
```

Expected: tests PASS, commit created.

### Task 3: Rebuild Impact Page Into The Primary Results Dashboard

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/impact/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-nav.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-content.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-platform-integration.test.mjs`

- [ ] **Step 1: Write the failing impact-page tests**

```js
test("impact page uses trend-first dashboard sections", () => {
  const source = readFileSync(new URL("../../app/impact/page.js", import.meta.url), "utf8");

  assert.match(source, /impact-trend-section/u);
  assert.match(source, /impact-coverage-section/u);
  assert.match(source, /impact-activity-section/u);
  assert.match(source, /impact-video-support/u);
  assert.equal(source.includes("教学建设成效"), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-content.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-platform-integration.test.mjs
```

Expected: FAIL because the current impact page still renders four generic achievement categories.

- [ ] **Step 3: Replace the impact page with a trend-first dashboard**

```jsx
<main className="showcase-page">
  <ShowcaseNav items={content.nav} />
  <div className="showcase-page-body">
    <section className="showcase-page-head impact-dashboard-head">...</section>
    <ShowcaseOperationsBand className="impact-kpi-band" items={content.impactDashboard.coverageCards} />
    <section className="impact-trend-section showcase-card">
      {content.impactDashboard.trendPanels.map((panel) => (
        <ShowcaseTrendPanel key={panel.id} panel={panel} />
      ))}
    </section>
    <section className="impact-coverage-section showcase-card">...</section>
    <section className="impact-activity-section showcase-card">...</section>
    <section className="impact-video-support showcase-card">...</section>
  </div>
</main>
```

- [ ] **Step 4: Add the impact-page dashboard layout styles**

```css
.impact-trend-section {
  display: grid;
  gap: 20px;
}

.impact-coverage-section,
.impact-activity-section,
.impact-video-support {
  margin-top: 24px;
}

.impact-grid-two-up {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
```

- [ ] **Step 5: Re-run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-content.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-platform-integration.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/impact/page.js components/showcase-nav.js app/globals.css tests/core/showcase-content.test.mjs tests/core/showcase-platform-integration.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: rebuild impact page as results dashboard"
```

Expected: tests PASS, commit created.

### Task 4: Convert Resources Into A Video Showcase And Rebalance Supporting Pages

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/resources/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/courses/page.js`
- Create: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/showcase-video-hub.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/globals.css`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-content.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs`

- [ ] **Step 1: Write the failing video-page and courses-page tests**

```js
test("resources route is repurposed as a course video hub", () => {
  const source = readFileSync(new URL("../../app/resources/page.js", import.meta.url), "utf8");

  assert.match(source, /示范性教学视频/u);
  assert.match(source, /ShowcaseVideoHub/u);
  assert.equal(source.includes("教学资源配置"), false);
});

test("courses page keeps a supporting role instead of homepage-like framing", () => {
  const source = readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8");

  assert.match(source, /课程体系/u);
  assert.equal(/首页|主入口|核心入口/u.test(source), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-content.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
```

Expected: FAIL because `/resources` still renders teaching-resource cards and the shared content has no dedicated video hub model.

- [ ] **Step 3: Replace `/resources` with a video hub built from `content.videoHub`**

```jsx
export default function ResourcesPage() {
  const content = buildShowcaseContent();

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />
      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程视频</p>
          <h1>示范性教学视频</h1>
          <p>页面承接教学视频展示、专题播放、传播快照与共享入口，补足平台推广与课程延展能力。</p>
        </section>
        <ShowcaseVideoHub content={content.videoHub} />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Rebalance the courses page as a support page**

```jsx
<section className="showcase-page-head">
  <p className="showcase-page-kicker">课程体系</p>
  <h1>双师课程体系</h1>
  <p>页面补充平台背后的八期课程结构，为平台应用成效与教学组织提供课程支撑背景。</p>
</section>
```

- [ ] **Step 5: Add video-hub styling and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-content.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/resources/page.js app/courses/page.js components/showcase-video-hub.js app/globals.css tests/core/showcase-content.test.mjs tests/core/public-copy-tone.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "feat: turn resources into course video hub"
```

Expected: tests PASS, commit created.

### Task 5: Align Cases And Study Routes With The New Site Narrative

**Files:**
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/cases/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/cases/[id]/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/app/cases/[id]/study/page.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/components/top-nav.js`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-cases.test.mjs`
- Modify: `/Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-study.test.mjs`

- [ ] **Step 1: Write the failing route-alignment tests**

```js
test("cases and study routes keep platform-entry language after the homepage pivot", () => {
  const casesSource = readFileSync(new URL("../../app/cases/page.js", import.meta.url), "utf8");
  const detailSource = readFileSync(new URL("../../app/cases/[id]/page.js", import.meta.url), "utf8");
  const studySource = readFileSync(new URL("../../app/cases/[id]/study/page.js", import.meta.url), "utf8");

  assert.match(casesSource, /cases-page-shell/u);
  assert.match(detailSource, /案例导读判断/u);
  assert.match(studySource, /研习工作台/u);
  assert.equal(/首页主叙事|平台总览首页/u.test(`${casesSource}\n${detailSource}\n${studySource}`), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-cases.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-study.test.mjs
```

Expected: FAIL after Task 1 because route wording and nav props are still tied to the old nav component assumptions.

- [ ] **Step 3: Pass the new shared nav items into case and study routes**

```jsx
const content = buildShowcaseContent();

return (
  <main className="showcase-page cases-page-shell">
    <TopNav user={user} items={content.nav} />
    <CasesWorkspace ... />
  </main>
);
```

```jsx
<main className="showcase-page case-detail-page">
  <TopNav user={user} items={content.nav} />
  ...
</main>
```

```jsx
<main className="study-page-main">
  <TopNav user={user} items={content.nav} />
  ...
</main>
```

- [ ] **Step 4: Tighten copy so these pages read as platform entry, not leftover homepage narrative**

```js
// app/cases/[id]/page.js
<p className="case-detail-lead">{leadText}</p>

// Keep route-local teaching language
// Do not add "成效总览" or "平台影响" wording here
```

- [ ] **Step 5: Re-run tests and commit**

Run:

```bash
node --test /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-cases.test.mjs /Users/silent/Projects/faxue-jiaoyu-showcase/tests/core/showcase-study.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add app/cases/page.js 'app/cases/[id]/page.js' 'app/cases/[id]/study/page.js' components/top-nav.js tests/core/showcase-cases.test.mjs tests/core/showcase-study.test.mjs
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "refactor: align case and study routes with new platform narrative"
```

Expected: tests PASS, commit created.

### Task 6: Verify The Integrated Site End-To-End

**Files:**
- Verify only: `/Users/silent/Projects/faxue-jiaoyu-showcase`

- [ ] **Step 1: Run the full core test suite**

Run:

```bash
cd /Users/silent/Projects/faxue-jiaoyu-showcase && npm run test:core
```

Expected: all `tests/core/*.test.mjs` PASS.

- [ ] **Step 2: Run a production build**

Run:

```bash
cd /Users/silent/Projects/faxue-jiaoyu-showcase && npm run build
```

Expected: `next build` completes successfully with no route-level errors.

- [ ] **Step 3: Start the local dev server and verify the primary routes manually**

Run:

```bash
cd /Users/silent/Projects/faxue-jiaoyu-showcase && npm run dev
```

Expected: local server available on `http://localhost:3011`.

- [ ] **Step 4: Open the core routes in a browser**

Run:

```bash
open http://localhost:3011/
open http://localhost:3011/cases
open http://localhost:3011/impact
open http://localhost:3011/resources
open http://localhost:3011/courses
```

Expected:

- 首页先见“成效与影响”，再见指标、趋势与覆盖；
- 案例检索仍是首页后的第一强入口；
- 成效页第一核心模块是运行趋势；
- 视频页是独立模块，而不是资源说明页；
- 顶层导航顺序与站点叙事一致。

- [ ] **Step 5: Commit the integrated verification checkpoint**

```bash
git -C /Users/silent/Projects/faxue-jiaoyu-showcase add .
git -C /Users/silent/Projects/faxue-jiaoyu-showcase commit -m "test: verify integrated platform-focused showcase redesign"
```

Expected: verification commit created after tests and build pass.

---

## Self-Review

### Spec coverage

- 首页改为运营总览首页：由 Task 1 和 Task 2 覆盖。
- 成效页改为平台应用成效总览页：由 Task 1 和 Task 3 覆盖。
- 顶层导航保留功能逻辑并重排：由 Task 1 覆盖。
- 视频页升级为独立模块：由 Task 1 和 Task 4 覆盖。
- 全站与新叙事对齐：由 Task 5 覆盖。
- 8 个 HTML 内容被拆解吸收，而非原样嵌入：由 Task 1 到 Task 4 覆盖。
- 整站验证与截图/浏览可信度：由 Task 6 覆盖。

### Placeholder scan

- 无 `TODO`、`TBD` 或“以后补”之类占位语。
- 每个任务都有明确文件、测试命令和提交节点。
- 每个代码步骤都给出了需要落地的结构片段，而不是纯口头描述。

### Type consistency

- 顶层导航统一使用 `content.nav`。
- 首页使用 `homeDashboard`，成效页使用 `impactDashboard`，视频页使用 `videoHub`，命名彼此清晰且不重叠。
- `/resources` 路由语义转为“课程视频”，但不改变现有技术路由路径。

### Execution note

本计划应按顺序执行，因为：

1. 先统一内容模型与导航，后续页面才能共享同一语义。
2. 首页与成效页依赖新的内容字段与共用组件。
3. 视频页和案例/研习页需要建立在新导航与叙事基础之上。
