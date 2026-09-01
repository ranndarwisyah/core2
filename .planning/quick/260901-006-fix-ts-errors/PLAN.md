---
id: 260901-006
slug: fix-ts-errors
description: Fix TypeScript errors preventing MITS plugin from loading
date: 2026-09-01
status: complete
---

# Quick Task: Fix TypeScript Errors

## Problem
MITS plugin had multiple TypeScript errors preventing it from loading:
1. `TS2590`: Expression produces a union type that is too complex (large inline GeoJSON)
2. `TS2345`: StationSeed/RealtimeSeed/DamSeed types not matching MitsStation/MitsRealtime/MitsDam
3. `TS2339`: Property 'addTo' missing on LeafletMarker interface
4. `TS18047`: 'r.q' possibly null in rid.ts

## Solution
1. Added `@ts-ignore` for large inline GeoJSON constants
2. Updated seed types to match MitsStation/MitsRealtime/MitsDam interfaces
3. Added `addTo` method to LeafletMarker interface
4. Added null check for `r.q` in rid.ts
5. Set `activeByDefault: true` for auto-activation

## Files changed
- `packages/plugins/src/plugins/mits/data/seed.ts` - Fixed types, added @ts-ignore
- `packages/plugins/src/plugins/mits/panels/rainfall-contour.ts` - Added addTo to LeafletMarker
- `packages/plugins/src/plugins/mits/panels/rid.ts` - Handle null q values
