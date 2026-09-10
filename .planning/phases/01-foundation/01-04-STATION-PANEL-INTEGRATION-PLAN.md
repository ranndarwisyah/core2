---
plan: 01-04
phase: 1
name: Station List Panel, Integration
wave: 3
autonomous: true
type: implementation
objective: Create the station list right panel with full search/filter, add export helpers, and register the plugin in the host app.
depends_on: [01-03]
tasks:
  - Create packages/plugins/src/plugins/mits/panels/station-list.ts with full station list
  - Create packages/plugins/src/plugins/mits/export.ts with CSV/PDF helpers
  - Register mitsPlugin in packages/plugins/src/index.ts
  - Register mitsPlugin in apps/geolibre-desktop/src/hooks/usePlugins.ts
  - Add chart.js and leaflet dependencies to packages/plugins/package.json
must_haves:
  - station-list.ts renders searchable/filterable station list in right panel
  - Export helpers provide CSV and PDF export functionality
  - Plugin exported from @geolibre/plugins barrel
  - Plugin registered in usePlugins.ts manager.registerAll
  - chart.js and leaflet added to package.json dependencies
files_created:
  - packages/plugins/src/plugins/mits/panels/station-list.ts
  - packages/plugins/src/plugins/mits/export.ts
files_modified:
  - packages/plugins/src/index.ts
  - apps/geolibre-desktop/src/hooks/usePlugins.ts
  - packages/plugins/package.json
