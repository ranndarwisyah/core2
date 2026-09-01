---
id: 260901-004
slug: stations-top-layer
description: Make telemetry stations the top layer by default
date: 2026-09-01
status: complete
---

# Summary

## What was done
Reordered `registerMapLayers()` in `index.ts` so stations are added last and render on top of all other layers.

**Layer order (bottom to top):**
1. Rivers
2. Canals
3. Radar
4. **Stations** (top)

## Files changed
- `packages/plugins/src/plugins/mits/index.ts` — Reordered layer registration

## Commit
- `673e78c9` — feat(mits): make telemetry stations top layer by default
