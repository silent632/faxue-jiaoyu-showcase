# Course System Mentor And Video Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补齐八期导师“姓名 + 单位”，补上第一期下视频入口，并修正 `/courses` 两个主板块之间的间距。

**Architecture:** 以 `lib/course-package.js` 为导师数据源统一入口，以 `lib/showcase-home-videos.js` 补视频分段数据，以 `/courses` 页面级样式做定点间距修复。所有改动都走现有数据流，避免额外组件分叉。

**Tech Stack:** Next.js 15, React 19, Node.js test runner, 全局 CSS

---

### Task 1: 统一导师数据源

**Files:**
- Modify: `lib/course-package.js`
- Test: `tests/core/course-package.test.mjs`

- [ ] **Step 1: 在 `lib/course-package.js` 引入导师单位映射**

```js
const MENTOR_UNIT_FALLBACKS = {
  第一期: {
    theoryMentor: "万娟娟（广东技术师范大学）",
    practiceMentor: "程秀建（广州市越秀区人民法院）",
  },
  第二期: {
    theoryMentor: "朱腾伟（广东技术师范大学）",
    practiceMentor: "刘宏（北京市炜衡（广州）律师事务所）",
  },
  第三期: {
    theoryMentor: "朱腾伟（广东技术师范大学）",
    practiceMentor: "王波（广州金鹏律师事务所）",
  },
  第四期: {
    theoryMentor: "万娟娟（广东技术师范大学）",
    practiceMentor: "陈伟奇（广东盈隆律师事务所）",
  },
  第五期: {
    theoryMentor: "朱省志（广东技术师范大学）",
    practiceMentor: "温绍东（广东大篆律师事务所）",
  },
  第六期: {
    theoryMentor: "李想（广东技术师范大学）",
    practiceMentor: "孔源（广州金鹏律师事务所）",
  },
  第七期: {
    theoryMentor: "董凡（广东技术师范大学）",
    practiceMentor: "李昕（金桥司徒邝（南沙）联营律师事务所）",
  },
  第八期: {
    theoryMentor: "王沛锐（广东技术师范大学）",
    practiceMentor: "陈立恒（广东佰仕杰律师事务所）",
  },
};
```

- [ ] **Step 2: 在课程 guide 构建阶段补齐导师单位**

```js
function normalizeMentorValue(period, role, value) {
  const trimmed = String(value || "").trim();
  if (/（.+）/u.test(trimmed)) return trimmed;

  const fallback = MENTOR_UNIT_FALLBACKS[period]?.[role] || "";
  if (!trimmed) return fallback;

  const fallbackName = fallback.replace(/（.+）/u, "").trim();
  if (fallbackName && trimmed.replace(/\s+/gu, "") === fallbackName.replace(/\s+/gu, "")) {
    return fallback;
  }

  return trimmed;
}
```

- [ ] **Step 3: 在 period 数据组装后统一写回标准化导师字段**

```js
guide.theoryMentor = normalizeMentorValue(period, "theoryMentor", guide.theoryMentor);
guide.practiceMentor = normalizeMentorValue(period, "practiceMentor", guide.practiceMentor);
```

- [ ] **Step 4: 为八期导师完整性补测试**

```js
test("all periods expose complete mentor names with units", () => {
  for (const { slug } of getCoursePackageStaticParams()) {
    const period = getCoursePackagePeriodBySlug(slug);
    assert.match(period.guide.theoryMentor, /（.+）/u);
    assert.match(period.guide.practiceMentor, /（.+）/u);
  }
});
```

- [ ] **Step 5: 运行课程包相关测试**

Run: `node --test tests/core/course-package.test.mjs`

Expected: PASS

### Task 2: 补齐第一期下视频卡片

**Files:**
- Modify: `lib/showcase-home-videos.js`
- Test: `tests/core/showcase-video-player.test.mjs`

- [ ] **Step 1: 在第一期分段数组中补入“第一期下”**

```js
buildSegment(
  "第一期下",
  "类案检索意义与优先承租权案细读",
  "https://llm2x7.58u.cn/a/Rn83yvz/",
  "先解释类案检索为何关系统一法律适用与司法公信，再转入优先承租权判决书的逐段展开。"
)
```

- [ ] **Step 2: 让第一期说明文案同步从“四段”升级到“完整上、下半场”**

```js
purpose: "保留上、下半场分段课堂记录，可直接查看第一期各段内容。"
```

- [ ] **Step 3: 为第一期视频数据补断言**

```js
assert.equal(period01.segments.length, 5);
assert.ok(period01.segments.some((item) => item.label === "第一期下"));
assert.match(
  period01.segments.find((item) => item.label === "第一期下").title,
  /类案检索意义|优先承租权/u
);
```

- [ ] **Step 4: 运行视频数据测试**

Run: `node --test tests/core/showcase-video-player.test.mjs`

Expected: PASS

### Task 3: 修正 `/courses` 两个 section 间距

**Files:**
- Modify: `app/courses/page.js`
- Modify: `app/globals.css`
- Test: `tests/core/course-package.test.mjs`

- [ ] **Step 1: 给课程页容器或第二个 section 增加页面级 class**

```jsx
<div className="showcase-page-body courses-page-body">
```

或

```jsx
<ShowcaseSection className="showcase-section-compact course-archive-section" />
```

- [ ] **Step 2: 在 `app/globals.css` 中增加定点间距规则**

```css
.courses-page-body .course-archive-section {
  margin-top: 28px;
}
```

或

```css
.courses-page-body .showcase-section + .course-archive-section {
  margin-top: 28px;
}
```

- [ ] **Step 3: 如页面源码测试依赖 class 名，补充最小断言**

```js
assert.match(source, /courses-page-body|course-archive-section/u);
```

- [ ] **Step 4: 运行课程页相关核心测试**

Run: `node --test tests/core/course-package.test.mjs`

Expected: PASS

### Task 4: 全量验证

**Files:**
- Modify if needed: any failing file from previous tasks

- [ ] **Step 1: 运行核心测试集**

Run: `npm run test:core`

Expected: `pass 100%`, `fail 0`

- [ ] **Step 2: 运行生产构建**

Run: `npm run build`

Expected: Next.js build succeeds with no route generation failure

- [ ] **Step 3: 检查 worktree 状态**

Run: `git status --short`

Expected: 只出现本轮预期修改文件
