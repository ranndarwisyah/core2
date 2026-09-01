---
id: 260901-003
slug: integrate-external-seeds
description: Replace hardcoded seed data with official external GeoJSON files
date: 2026-09-01
status: in-progress
---

# Integrate External Seed Files

## Problem
The MITS plugin uses hardcoded seed data that is smaller and less accurate than the official external files provided by the user.

## External Files
1. `Riverline.geojson` (6190 features) — Complete OSM waterway data from Overpass Turbo
   - Canal: 3448, River: 1180, Stream: 711, Ditch: 482, Drain: 343, Weir: 13, Dam: 9
2. `mits_stations_official.geojson` (152 stations) — Official MITS station data
   - RF: 81, WL: 37, RF/WL: 18, RF/WL/GO: 9, WL/GO: 7
3. `Stations.temperature.mits.json` — GeoLibre project config with basemap style

## Property Mapping

### Stations (external → internal)
| External | Internal (MitsStation) |
|----------|------------------------|
| station_no | station_id |
| station_name | station_name |
| function | station_type (RF→Rainfall, WL→WaterLevel, etc.) |
| state | state |
| wilayah | wilayah |
| daerah | district |
| status | status |
| coordinates | lon, lat |

### Waterway Types (for layer filtering)
- Rivers: waterway=river, stream, flowline
- Irrigation: waterway=canal, ditch, drain, weir
- Structures: waterway=dam

## Solution
1. Update seed.ts to import from external files (or embed their content)
2. Update types.ts to match external properties
3. Update layers.ts to filter by waterway type
4. Update index.ts to use the new data structure
