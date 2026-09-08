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
