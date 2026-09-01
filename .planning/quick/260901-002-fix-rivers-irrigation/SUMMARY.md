---
id: 260901-002
slug: fix-rivers-irrigation
description: Fix river and irrigation line layers - proper colors and styling
date: 2026-09-01
status: complete
---

# Summary

## What was done

### 1. Extracted clean GeoJSON files
- `packages/plugins/src/plugins/mits/data/rivers.geojson` (181 KB) - All river LineString features from RC_RIVERLINE_DATA
- `packages/plugins/src/plugins/mits/data/irrigation.geojson` (806 B) - Main conveyance/canal lines from DSG_MAIN_CONVEYANCE

Both files contain proper LineString geometries (not points).

### 2. Documented paint properties in layers.ts
Added `RIVER_STYLE` and `IRRIGATION_STYLE` constants with the exact styling from the original MITS prototype.

## GeoLibre Styling Instructions

After adding the GeoJSON layers via Add Data, apply these styles in the Style panel:

### Rivers (rivers.geojson)
- Stroke color: `#3a7bd5`
- Stroke width: `1.5` px
- Fill opacity: `0.9`

### Irrigation (irrigation.geojson)
- Stroke color: `#2dd4a8`
- Stroke width: `1.5` px
- Fill opacity: `0.9`

### Zoom-interpolated widths (advanced)
For rivers:
```json
["interpolate", ["linear"], ["zoom"], 8, 0.8, 12, 1.7, 15, 2.6]
```

For irrigation:
```json
["interpolate", ["linear"], ["zoom"], 8, 0.8, 12, 1.6, 15, 2.5]
```

## Files changed
- `packages/plugins/src/plugins/mits/map/layers.ts` - Added style constants and documentation
- `packages/plugins/src/plugins/mits/data/rivers.geojson` - New: clean river GeoJSON
- `packages/plugins/src/plugins/mits/data/irrigation.geojson` - New: clean irrigation GeoJSON
