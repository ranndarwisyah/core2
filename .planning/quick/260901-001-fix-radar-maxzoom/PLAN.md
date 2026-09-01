---
id: 260901-001
slug: fix-radar-maxzoom
description: Fix "Zoom Level Not Supported" on RainViewer radar layer
date: 2026-09-01
status: in-progress
---

# Fix "Zoom Level Not Supported" on RainViewer radar layer

## Problem
The RainViewer radar XYZ tiles are only available up to zoom level ~7-8. When users zoom past this, MapLibre throws a "Zoom Level Not Supported" error because no `maxzoom` is set on the tile source.

## Solution
Set `maxzoom: 7` on the radar tile layer so MapLibre overscales the zoom-7 tiles automatically when users zoom in further.

## Tasks
1. Add `maxzoom: 7` to radar tile layer in `index.ts`
2. Verify no other tile layers have the same issue

## Files
- `packages/plugins/src/plugins/mits/index.ts` — radar layer registration

## Basemap Recommendation
GeoLibre already includes CARTO Light (Positron) which supports high zoom (up to zoom 20). For the MITS plugin context:
- **CARTO Light** — clean, light basemap, good for overlaying radar data
- **OpenFreeMap Liberty** — free, open-source, supports high zoom
- **OSM** — standard, supports all zoom levels

The default basemap in GeoLibre should already be sufficient. No changes needed.
