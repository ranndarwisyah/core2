---
id: 260901-003
slug: integrate-external-seeds
description: Replace hardcoded seed data with official external GeoJSON files
date: 2026-09-01
status: complete
---

# Summary

## What was done

### 1. Integrated external station data
- Replaced hardcoded SEED_STATIONS (144 stations) with mits_stations_official.geojson (152 stations)
- Updated MitsStationType to include 'RF' and 'GO' as standalone types
- Added MitsExternalStation and MitsExternalWaterway types for external data mapping
- Created mapping.ts with conversion functions

### 2. Integrated external river/irrigation data
- Replaced RC_RIVERLINE_DATA (543 features) with filtered Riverline.geojson (1895 river/stream/flowline features)
- Replaced DSG_MAIN_CONVEYANCE (3 features) with filtered irrigation data (4286 canal/ditch/drain/weir features)
- Created separate GeoJSON export files:
  - rivers.geojson: 1895 features
  - irrigation.geojson: 4286 features

### 3. Data statistics
| Dataset | Before | After |
|---------|--------|-------|
| Stations | 144 | 152 |
| Rivers | 543 | 1895 |
| Irrigation | 3 | 4286 |

## Files changed
- `packages/plugins/src/plugins/mits/data/seed.ts` - Updated with external data
- `packages/plugins/src/plugins/mits/data/mapping.ts` - New: conversion functions
- `packages/plugins/src/plugins/mits/data/rivers.geojson` - Updated: 1895 river features
- `packages/plugins/src/plugins/mits/data/irrigation.geojson` - Updated: 4286 irrigation features
- `packages/plugins/src/plugins/mits/types.ts` - Added external types
