# Content Sources

This directory stores maintainable public content for Codex-assisted updates.

The goal is to keep long-lived content out of large JS modules. Rendering code should load validated content through `lib/content/` helpers and expose stable view models to `app/` and `components/`.

## Current Files

- `copy-policy.json`: public-copy guardrails used by validation and tests.
- `courses/course-period-01.json`: first migrated course period sample.

## Rules

1. Keep route slugs stable.
2. Keep public copy concise and visitor-facing.
3. Do not write backstage, reviewer-facing, or production-process wording.
4. Run `npm run validate:content` after editing content files.
5. Run `npm run build` when content changes affect generated routes or visible pages.
