---
id: 260901-005
slug: auto-activate-plugin
description: Auto-activate MITS plugin on startup
date: 2026-09-01
status: complete
---

# Quick Task: Auto-activate MITS Plugin

## Problem
MITS plugin panels weren't appearing in the UI because `activeByDefault: false` required manual activation.

## Solution
Changed `activeByDefault` from `false` to `true` in `mitsPlugin` export.

## Files changed
- `packages/plugins/src/plugins/mits/index.ts` — Set `activeByDefault: true`
