# Content Maintenance Guide

## Purpose

This project is maintained through Codex-assisted content updates. The user does not need to edit source files directly. Codex should update structured content files, run validation, run tests, build the static site, and report the affected pages.

## Content Update Workflow

When asked to update public content:

1. Identify the content source file under `content/`.
2. Read the related rendering and validation files before editing.
3. Edit the smallest content file that owns the requested text or data.
4. Run `npm run validate:content`.
5. Run the smallest relevant `node --test` command.
6. Run `npm run build` when the change affects routes, links, assets, or generated pages.
7. Report changed files, affected pages, commands run, and remaining risks.

## Standard User Prompts

Use prompts like:

```text
更新第七期课程内容，保持公开展示口径，跑内容校验、核心测试和构建，最后汇报影响页面。
```

```text
更新首页指标文案，不改页面结构，检查公开文案规则并构建。
```

```text
检查所有 PDF 和视频链接是否仍然有效，给出失败清单。
```

## Public Copy Rules

Public pages must not expose backstage wording, reviewer-facing instructions, production-process wording, incomplete-state wording, or implementation commentary. The central rule file is `content/copy-policy.json`.

## Validation Commands

```bash
npm run validate:content
npm run audit:assets
npm run test:core
npm run build
```

Use `npm run check` when a change should pass the full local verification chain.

## Content Ownership

- Course period content belongs in `content/courses/`.
- Public-copy policy belongs in `content/copy-policy.json`.
- Video data will move to `content/videos.json` in a later migration.
- Homepage and impact data will move to `content/homepage.json` and `content/impact.json` in a later migration.
- Case extraction data remains in `data/generated/cases-extracted.json`.

## Reporting Format

Codex should end content maintenance work with:

- Changed content files.
- Affected public pages.
- Validation commands and results.
- Any source data that could not be verified.


## 2026-09 内容与记录契约

默认构建仅使用仓库快照。`COURSE_PACKAGE_ROOT` 是显式外部覆盖，不能用来隐藏缺失输入；发布需保留 `scripts/build-input-manifest.mjs` 的输出。远端视频检查使用 `scripts/audit-remote-assets.mjs`，与本地文件审计分开。

修改日期、法院或程序前记录旧值、页码、原文、来源文件指纹。日期不能取案件事实中的时间。全文事实/争点/说理仍属教学整理；精选量规即使引文核对通过也不得改称教师审定。

实验新记录使用 v2 与共享完成规则；学习记录导出兼容 v1/v2。跨页写入需检查 revision。导入使用单次快照与冲突副本，不按时间覆盖。课程版本变化保留历史任务；课程完成必须有研习、指定实验与反思。

修改行为后运行浏览器回归；改 PDF 依据后运行 PROGRESS.md 所列物理页验证脚本。运营数字必须同时提供原始来源、区间和口径，缺失则隐藏或保持待核验。当前状态只维护在 PROGRESS.md。

## 使用者欢迎、指南与反馈

`content/help.json` 维护欢迎词、公告版本、常见问题和反馈服务配置。欢迎词面向各年级使用者，不能重新限定为新生。公告关闭状态使用独立键 `faxue-welcome-dismissed`，不能混入学习档案；只有确需重新提示时才更新公告版本。

使用指南位于 `app/help/guide/page.js`，配图位于 `public/images/guide/`。页面操作变化时，使用隔离浏览器重新截图，不能包含真实学生的学习记录。

当前反馈通过用户提供的邮箱联系；email 配置保存在 content/help.json，正文只生成邮件草稿，由使用者确认发送。长正文不塞入可能被截断的邮件链接，应提示复制完整内容。独立表单为可选扩展：需提供 HTTPS 地址、确认私密收集和可选联系方式。站内草稿暂存在 sessionStorage，只提供整理与复制；不能提示“已提交”。不能通过 mailto 链接验证送达，也不得擅自发送测试邮件。若后续使用表单，真实送达以提交结果和管理端回读为准。不配置地址时保持明确的未发送状态，不写虚假接口或收件人。

## 教学场景与云端学习记录

场景脚本在 `content/scenes/versions/`；目前为原创教学假设情境，教师审阅状态必须如实保留。后台发布将脚本及指纹存入数据库，既有版本不能覆盖；修改时新增版本并保留旧实例依赖。场景发布同时控制新教学任务与公开自主体验；撤下后保留已有课程实例的原版本访问，公开入口保留本机历史导出。v1保留，v2增加角色专属材料；客户端与服务端共同校验材料是否属于当前角色。

账号、小组、任务、提交、反馈和交流记录存于 D1，不能写入 Git。草稿更新须携带 revision；历史提交和任务版本不可原地重写。教师反馈与学生自评、系统结构检查不能混称。指南已区分匿名本地记录与账号云端任务；不得再笼统宣称全站自动同步或全站只存在浏览器中。

当前实施、验证命令和生产环境缺口见 `docs/教学平台实施与验收-2026-09-18.md`。生产绑定与凭据不可凭空填入，本地测试数据库不可上传为正式数据库。

## 名单预设与账号管理

原始名单及提取结果必须放在代码仓库之外。仅提取姓名、学号、班级；联系方式、家庭住址等不进入账号表。不同姓名或班级共用学号时隔离冲突，不静默覆盖。`prepare-student-roster.py` 输出私有JSON，`import-students-local.mjs` 仅操作本地专用库；正式导入另行核对目标数据库。

名单账号初始密码为学号后六位，数据库只存独立盐值的哈希。`must_change_password` 为真时，服务端仅允许查看本人登录状态、改密及退出；改密后撤销旧会话并重新登录。管理员、教师账号不通过学生名单创建，既有账号不得被导入程序重置或升级角色。
