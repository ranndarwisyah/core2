---
project: MITS Plugin for GeoLibre
created: 2026-09-01
---

# PROJECT.md — MITS Plugin

## Core Value
Port the MITS (MADA Integrated Telemetry System) prototype into a GeoLibre plugin, providing water management telemetry visualization for Malaysian irrigation infrastructure.

## Requirements
- Full GeoLibre plugin with toolbar menu, right panel, floating panels
- localStorage-backed data persistence with ~144 stations, 3 dams, 2 regulators, 3 webcams
- Simplified 2-user RBAC (superadmin + user)
- Bilingual i18n (EN/MS) with ~250 translation keys
- Chart.js for data visualization, Leaflet for rainfall contour analysis
- Embedded MP_HTML_B64 schematic

## Tech Stack
- TypeScript (GeoLibre plugin API)
- MapLibre GL JS (via GeoLibre host)
- Chart.js 4.4.x (npm dependency)
- Leaflet 1.9.x (npm dependency)
- localStorage for persistence
