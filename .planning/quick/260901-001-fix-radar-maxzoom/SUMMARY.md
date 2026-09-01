---
id: 260901-001
slug: fix-radar-maxzoom
description: Fix "Zoom Level Not Supported" on RainViewer radar layer
date: 2026-09-01
status: complete
commit: 954de310
---

# Summary

## What was done
Added `maxzoom: 7` to the RainViewer radar tile layer registration in `packages/plugins/src/plugins/mits/index.ts:73`.

RainViewer tiles are only available up to zoom level ~7-8. Without a `maxzoom` set, MapLibre attempts to request tiles at higher zoom levels and throws "Zoom Level Not Supported". Setting `maxzoom: 7` tells MapLibre to overscale the zoom-7 tiles automatically when users zoom past level 7, preventing the error.

## Basemap recommendation
GeoLibre's default basemaps (CARTO Light/Positron, OpenFreeMap Liberty, OSM) all support high zoom levels (up to 20+). No basemap changes needed — the radar overlay will simply overscale on top of whatever basemap is active.

## Files changed
- `packages/plugins/src/plugins/mits/index.ts` — Added `maxzoom: 7` to radar tile layer options
