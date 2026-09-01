---
id: 260901-004
slug: stations-top-layer
description: Make telemetry stations the top layer by default
date: 2026-09-01
status: complete
---

# Quick Task: Stations Top Layer

## Problem
Telemetry station markers were rendering below river/canal lines, making them hard to see.

## Solution
Reorder `registerMapLayers()` so stations are added last (rendering on top):
1. Rivers (bottom)
2. Canals
3. Radar
4. Stations (top)

## Files changed
- `packages/plugins/src/plugins/mits/index.ts` — Reordered layer registration
