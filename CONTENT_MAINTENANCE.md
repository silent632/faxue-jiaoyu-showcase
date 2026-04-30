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
