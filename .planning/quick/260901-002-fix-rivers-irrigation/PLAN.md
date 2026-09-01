---
id: 260901-002
slug: fix-rivers-irrigation
description: Fix river and irrigation line layers - proper colors and styling
date: 2026-09-01
status: in-progress
---

# Fix Rivers + Irrigation Lines

## Problem
The river and irrigation line layers from the MITS seed data are added as plain GeoJSON without proper styling. The original MITS prototype uses specific colors and zoom-interpolated line widths.

## Data Structure
- `RC_RIVERLINE_DATA`: FeatureCollection with `waterway: "river"` properties (LineString geometries)
- `DSG_MAIN_CONVEYANCE`: FeatureCollection with `waterway: "canal"` and `kind: "main_conveyance"` properties (LineString geometries)

## Original MITS Paint Properties
From the HTML prototype:

**Rivers** (`#3a7bd5`):
```json
{
  "line-color": "#3a7bd5",
  "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.8, 12, 1.7, 15, 2.6],
  "line-opacity": 0.9
}
```

**Irrigation Lines** (`#2dd4a8`):
```json
{
  "line-color": "#2dd4a8",
  "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.8, 12, 1.6, 15, 2.5],
  "line-opacity": 0.9
}
```

## Solution
1. Update `layers.ts` to add helper functions that return styled GeoJSON
2. Update `index.ts` to use the styled layers
3. Create standalone GeoJSON files for export

## Files
- `packages/plugins/src/plugins/mits/map/layers.ts` - Add styled layer builders
- `packages/plugins/src/plugins/mits/index.ts` - Use styled layers
- `packages/plugins/src/plugins/mits/data/rivers.geojson` - Export file
- `packages/plugins/src/plugins/mits/data/irrigation.geojson` - Export file
