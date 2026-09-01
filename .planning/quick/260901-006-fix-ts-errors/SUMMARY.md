---
id: 260901-006
slug: fix-ts-errors
description: Fix TypeScript errors preventing MITS plugin from loading
date: 2026-09-01
status: complete
---

# Summary

## What was done
Fixed all TypeScript errors preventing the MITS plugin from loading:

1. **TS2590** - Added `@ts-ignore` for large inline GeoJSON constants
2. **TS2345** - Updated `StationSeed`, `RealtimeSeed`, `DamSeed` interfaces to match target types
3. **TS2339** - Added `addTo` method to `LeafletMarker` interface
4. **TS18047** - Added null check for `r.q` in rid.ts
5. Set `activeByDefault: true` for auto-activation

## Files changed
- `packages/plugins/src/plugins/mits/data/seed.ts`
- `packages/plugins/src/plugins/mits/panels/rainfall-contour.ts`
- `packages/plugins/src/plugins/mits/panels/rid.ts`

## Commit
- `7f0f7fc4` - fix(mits): resolve TypeScript errors and auto-activate plugin
