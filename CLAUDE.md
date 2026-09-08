# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概况

裁判文书研习平台（faxue-jiaoyu-showcase）：面向法学教育的静态展示站。Next.js 15 App Router + React 19，纯 JavaScript（无 TypeScript），静态导出（`output: "export"`，581 个页面/元数据入口），部署在 Cloudflare Pages（push main 自动构建，线上地址 https://falixue-yanxi.pages.dev/）。路径别名 `@/*` 指向仓库根目录。

项目按系统性优化方案的工作包推进，进度与各阶段待办以 [PROGRESS.md](PROGRESS.md) 为总控，做整改类工作前先读它。

## 常用命令

```bash
npm run dev                # 开发服务器，端口 3011
npm run build              # 静态构建（输出到 out/）
npm run test:core          # 全部核心测试（node --test tests/core/*.test.mjs）
node --test tests/core/showcase-cases.test.mjs   # 跑单个测试文件
npm run validate:content   # 内容校验（copy-policy 等）
npm run audit:assets       # PDF/视频等资源链接审计
npm run check              # 完整验证链：validate + audit + test + build
```

改动内容后至少跑 `validate:content` 和相关测试；影响路由、链接、资源或生成页面时必须跑 `build`；提交前用 `npm run check` 全绿。

## 架构

### 内容层（核心约束）

长期内容存放在结构化 JSON 中，渲染代码只通过 `lib/content/` 的加载器读取，向 `app/`、`components/` 暴露稳定的视图模型。**改公开文案时优先改 `content/` 下最小的内容文件，而不是改组件。**

- `content/courses/course-period-0*.json` — 八期课程内容；`archive.json` 为课程档案
- `content/site.json` — 站点级文案（首页等）
- `content/experiments.json` — 六个实验模块配置
- `content/videos.json`、`content/jurisprudence-tags.json` — 视频与法理标签
- `content/copy-policy.json` — **公开文案红线**：公开页面禁止出现后台口径、评审向措辞、制作过程、未完成状态等词。由 `validate:content` 和 `tests/core/public-copy-tone.test.mjs` 强制检查
- `data/generated/cases-extracted.json` — 210 篇案例抽取数据（`lib/showcase-cases.js` 加载，可用 `SHOWCASE_CASES_JSON_PATH` 环境变量覆盖）

### 外部依赖：课程资料包

`lib/course-package.js` 默认只使用仓库课程快照，不扫描 cwd 或同级资料。显式设置 `COURSE_PACKAGE_ROOT` 才读取外部包，目录不存在即报错；正式发布默认不要设置个人路径。用 `node scripts/build-input-manifest.mjs` 记录实际输入和课程数据指纹。`npm run sync:pdfs` 同步 PDF。

### 渲染层

- `app/` — 路由：首页、`cases/[id]`（案例 + `/study` 研习工作台）、`courses/[slug]/[materialSlug]`（约 80 个材料子页）、`experiments/[moduleId]`（六个实验）、`resources/videos/[slug]`
- `components/` — 按前缀分组：`exp-*`（六个实验模块交互）、`cases-*`（案例库工作区）、`course-*`（课程体系页）、`study-*`（研习工作台）、`showcase-*`（站点级）
- `lib/` — 构建期数据管道：`course-package.js` → `course-content-profiles.js` / `course-material-pages.js` / `course-system-pages.js` 等生成页面数据；测试直接针对这些 lib 模块
- `app/globals.css` — 全站样式与设计 token（字号/间距在第一阶段已统一提档，改样式先看这里的 token 而非写死数值）

### 测试

`tests/core/` 下用 Node 内置 test runner（`.test.mjs`），覆盖内容结构、记录恢复、导入、完成规则、页面数据与公开文案；数量以当前测试输出为准。改内容或 lib 数据管道后，对应测试文件往往需要同步更新。

## 内容维护工作流

详见 [CONTENT_MAINTENANCE.md](CONTENT_MAINTENANCE.md)。要点：定位 `content/` 下的内容源文件 → 先读相关渲染与校验代码 → 只改拥有该文案的最小文件 → 跑校验和最小相关测试 → 必要时构建 → 汇报改动文件、受影响页面、执行的命令与剩余风险。

## 可靠性与证据

记录通过 lib/local-record.js 保存；保存成功、结构完成、学生自评、教师审阅分别处理。不要把待核验指标改回示例数字，也不要把引文核对标为教师审定。修改记录或学习动线后补跑浏览器回归；详见 PROGRESS.md 与最新交接文档。
