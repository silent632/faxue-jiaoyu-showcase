# Codex 内容维护架构 Design

## 背景

本项目当前已经形成完整的静态展示站：案例检索、案例详情、研习工作台、八期课程档案、课程视频和成效展示都能通过 `next build` 导出。但长期内容维护存在结构性问题：

1. 大量公开内容写在 `lib/*.js` 中，尤其是 `lib/course-content-profiles.js`，内容和代码混在一起。
2. 课程资料包依赖本机外部目录，导致 `npm run test:core` 在当前环境下有 1 个失败用例。
3. 首页指标、视频信息、课程内容、公开文案规则散落在不同 JS 和测试文件中，Codex 每次维护都需要先重新理解全局。
4. 用户不直接维护代码，计划长期通过 Codex 完成内容更新，因此项目需要面向 Codex 的稳定内容接口，而不是面向人工后台的 CMS。

本轮目标不是立即重写页面，而是设计一套让 Codex 后续能稳定维护内容的架构。

## 核心目标

1. 内容维护从“修改代码文件”转为“修改内容源文件”。
2. Codex 能快速定位内容来源、影响页面和验证命令。
3. 页面组件只消费标准 view model，不直接理解原始内容文件。
4. 内容错误在构建前暴露，包括字段缺失、链接失效、PDF 缺失、禁用话术泄露。
5. 保持静态导出架构，不引入数据库、登录后台或运行时 CMS。

## 非目标

1. 不引入 CMS、数据库或后台编辑器。
2. 不改变当前 Next.js 静态导出发布模型。
3. 不优先重做视觉设计。
4. 不一次性迁移全部内容，避免大规模低价值改动。
5. 不让非技术用户直接编辑内容文件；用户通过自然语言指令让 Codex 维护。

## 推荐架构

项目逐步调整为三层：

### 1. 内容源层

新增 `content/` 目录，保存可维护内容。建议结构：

```text
content/
  README.md
  homepage.json
  impact.json
  videos.json
  copy-policy.json
  courses/
    course-period-01.json
    course-period-02.json
    course-period-03.json
    course-period-04.json
    course-period-05.json
    course-period-06.json
    course-period-07.json
    course-period-08.json
  cases/
    showcase-rules.json
```

选择 JSON 而不是 YAML 或 Markdown 的原因：

- 当前项目没有 YAML 依赖，JSON 可直接由 Node 读取。
- Codex 可以稳定编辑 JSON，但必须配合 schema 校验防止格式错误。
- 课程内容有较强结构性，纯 Markdown 不适合承载嵌套字段、卡片、问题链和材料页。

Markdown 可以作为后续补充，用于长篇正文，但第一阶段不作为主要内容格式。

### 2. 内容生成层

新增或调整 `lib/content/`，负责读取、校验和转换内容源：

```text
lib/content/
  load-content.js
  validate-content.js
  build-homepage-view-model.js
  build-impact-view-model.js
  build-video-view-model.js
  build-course-view-model.js
  build-copy-policy.js
```

职责边界：

- `content/` 只保存事实和公开文案。
- `lib/content/` 只做校验、默认值补齐、格式转换。
- `app/` 和 `components/` 只渲染 view model。

### 3. 页面渲染层

现有 `app/` 和 `components/` 保持为渲染层。页面不直接读取 `content/`，也不直接拼接复杂业务文案。页面只接收：

- `homeViewModel`
- `impactViewModel`
- `videoHubViewModel`
- `coursePeriodViewModel`
- `caseWorkspaceViewModel`

这样 Codex 后续改内容时，主要工作集中在 `content/` 和 `lib/content/`，不会频繁进入组件内部。

## 内容 Schema

第一阶段不引入第三方 schema 库，先用 Node 原生断言函数实现校验，避免新增依赖。后续如果内容复杂度继续上升，再考虑引入 `zod`。

每类内容至少校验：

1. 必填字段存在且类型正确。
2. slug 唯一且与路由一致。
3. 内部链接以 `/` 开头，并能映射到已知路由。
4. 外部视频链接是 `http` 或 `https`。
5. PDF 引用能在 `public/pdfs/` 找到。
6. 公开文案不包含 copy policy 禁用词。
7. 课程期次数量固定为 8。
8. 每期课程材料页数量固定为 10。

## Copy Policy

将当前散落在测试中的公开文案规则集中到 `content/copy-policy.json`。建议字段：

```json
{
  "forbiddenPatterns": [],
  "forbiddenPublicReviewPatterns": [],
  "forbiddenIncompleteStatePhrases": [],
  "preferredTerms": {},
  "pageRoleRules": {}
}
```

测试读取该文件执行校验。这样后续要调整公开口径时，Codex 只需要改一处规则文件和对应内容。

## 迁移顺序

### 阶段一：维护手册与校验底座

新增：

- `CONTENT_MAINTENANCE.md`
- `content/README.md`
- `content/copy-policy.json`
- `lib/content/validate-content.js`
- `tests/core/content-validation.test.mjs`

目标是先让 Codex 有固定维护入口，而不是立刻搬迁所有内容。

### 阶段二：迁移课程内容

优先迁移 `lib/course-content-profiles.js`，因为它是最大内容负债。每期课程一个 JSON 文件，字段覆盖：

- `periodSummary`
- `coreQuestions`
- `contentFlow`
- `caseStudy`
- `materialsInterpretation`
- `studentOutcomes`
- `teachingDesign`
- `sectionRichContent`
- `sectionPageMode`

迁移后 `lib/course-content-profiles.js` 应缩减为读取和 fallback 逻辑，不再保存大段正文。

### 阶段三：迁移视频、首页、成效

迁移：

- `lib/showcase-home-videos.js` 中的视频数据到 `content/videos.json`
- `lib/showcase-content.js` 中的首页和成效数据到 `content/homepage.json`、`content/impact.json`

迁移后 `showcase-content.js` 只负责组合 view model。

### 阶段四：资产审计

新增 `npm run audit:assets`，检查：

- 210 个案例的 PDF 是否都存在。
- 视频链接是否格式合法。
- 课程 slug 是否都有对应页面。
- 静态导出产物不被误提交。

### 阶段五：维护指令模板

在 `CONTENT_MAINTENANCE.md` 中写明用户以后如何向 Codex 下指令，例如：

```text
更新第七期课程内容，保持公开展示口径，跑内容校验、核心测试和构建，最后汇报影响页面。
```

Codex 执行时必须按顺序：

1. 定位内容源。
2. 修改内容文件。
3. 跑内容校验。
4. 跑相关核心测试。
5. 跑 `npm run build`。
6. 汇报变更、影响页面和残余风险。

## 测试策略

新增三个层级：

1. `validate:content`
   只校验内容文件结构和公开口径，速度最快。

2. `test:core`
   保持现有核心行为测试，逐步改为读取集中 copy policy。

3. `build`
   最终确认静态导出页面可生成。

推荐脚本：

```json
{
  "validate:content": "node ./scripts/validate-content.mjs",
  "audit:assets": "node ./scripts/audit-assets.mjs",
  "check": "npm run validate:content && npm run audit:assets && npm run test:core && npm run build"
}
```

## 风险与边界

1. 一次性迁移全部内容风险过高。课程内容最重，应先迁移课程，其他内容后置。
2. JSON 可维护性强但不适合超长正文。若后续单段正文过长，可对该字段引入 Markdown 文件引用。
3. 现有测试中有不少源码文本断言，迁移后需要逐步改成内容规则断言，否则会出现测试和架构目标冲突。
4. 当前课程资料包外部目录缺失导致测试失败，这应在阶段一作为可复现性问题处理。
5. Codex 维护依赖明确手册和校验命令；没有手册时，内容结构化收益会明显下降。

## 验收标准

第一轮架构优化完成时，应满足：

1. 仓库存在 `CONTENT_MAINTENANCE.md`，用户能按模板向 Codex 下内容维护指令。
2. 仓库存在 `content/`，至少 copy policy 和课程内容迁移样例已落地。
3. 有 `validate:content` 命令，能在不跑完整 build 的情况下发现内容结构错误。
4. `course-content-profiles.js` 不再承担大段内容库职责，至少一期课程已完成内容源迁移并保持页面输出不变。
5. `npm run test:core` 和 `npm run build` 在当前环境可复现通过，或测试明确区分外部资料包存在与不存在两种状态。

## 推荐第一批实施范围

第一批只做以下事项：

1. 新增 `CONTENT_MAINTENANCE.md`。
2. 新增 `content/README.md` 和 `content/copy-policy.json`。
3. 新增内容校验脚本和测试。
4. 迁移一期课程作为样例，推荐先迁移 `course-period-01`。
5. 修正课程资料包缺失导致的测试不可复现问题。

这批完成后，再决定是否迁移其余七期课程。
