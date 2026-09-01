---
id: 260901-005
slug: auto-activate-plugin
description: Auto-activate MITS plugin on startup
date: 2026-09-01
status: complete
---

# Summary

## What was done
Changed `activeByDefault` from `false` to `true` in `mitsPlugin` export so the plugin loads automatically on app startup.

## Files changed
- `packages/plugins/src/plugins/mits/index.ts` — Set `activeByDefault: true`

## Commit
- `e8e9c526` — feat(mits): auto-activate plugin on startup
