---
plan: 01-03
phase: 1
name: Plugin Entry, Toolbar, Map Layers
wave: 2
autonomous: true
type: implementation
objective: Create the main plugin entry point with lifecycle management, toolbar menu registration, and map layer registration (stations, rivers, canals, radar tiles).
depends_on: [01-01, 01-02]
tasks:
  - Create packages/plugins/src/plugins/mits/index.ts with plugin entry
  - Create packages/plugins/src/plugins/mits/map/layers.ts with GeoJSON builders
  - Create packages/plugins/src/plugins/mits/map/markers.ts with station popups
  - Create packages/plugins/src/plugins/mits/map/radar.ts with RainViewer
  - Create packages/plugins/src/plugins/mits/panels/manager.ts with panel orchestration
must_haves:
  - index.ts exports mitsPlugin conforming to GeoLibrePlugin interface
  - Toolbar menu with Home, Dam, Rainfall, Water Level, Gate, Webcam, Services, Advance, Admin
  - registerMapLayers adds station GeoJSON, river lines, canal lines via app.addGeoJsonLayer
  - registerMapLayers adds RainViewer radar tiles via app.addTileLayer
  - buildPopupHtml creates rich station popups with readings and thresholds
  - initRadar fetches RainViewer frames and manages animation
files_created:
  - packages/plugins/src/plugins/mits/index.ts
  - packages/plugins/src/plugins/mits/map/layers.ts
  - packages/plugins/src/plugins/mits/map/markers.ts
  - packages/plugins/src/plugins/mits/map/radar.ts
  - packages/plugins/src/plugins/mits/panels/manager.ts
