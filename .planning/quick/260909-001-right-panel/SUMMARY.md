# Quick Task 260909-001: Real-time right panel, floating station panel, public summary table — SUMMARY

**Status:** complete
**Date:** 2026-09-09
**Branch:** `quick/nav-panel-fixes`
**Commit:** `2e8dbb24`

## What was done

Implemented `right-panel.md` (v0.1) entirely inside
`packages/plugins/src/plugins/mits/`, using host APIs only.

- **`panels/station-display.ts`** (new) — shared display helpers reused by all
  three UIs: `stationLevel` (via `resolveStationStatus`), `statusColor`
  (green/amber/red/grey-offline dot), `statusText`, `latestReading` (WL → `m`,
  RF → `mm`), `parseStationDate`/`relativeTime` (`Intl.RelativeTimeFormat`,
  tolerant of `M/D/YY HH:mm`), plus `escapeHtml` for dataset strings.
- **`panels/station-list.ts`** (rewrite) — the registered right panel is now the
  live telemetry workspace: **Stations / Alerts** tabs, per-row status dot,
  name, latest value + unit, relative time and status text; the Alerts tab
  shows only `alert|warning|danger` stations sorted by severity with a live
  badge count. Row click flies to the station and opens the Floating Station
  Panel. Header gains a "Public Summary" button.
- **`panels/station-detail.ts`** (new) — `openStationDetail(app, stationId)`
  registers + opens a floating card at the map's right side
  (`position: 'top-right'`, `defaultWidth` 340); shows live value + unit,
  status, relative time, thresholds when present, and the existing Center map /
  Open full data actions. Closes via the host card ×, Escape, or a click
  outside. `disposeStationDetail()` is called on plugin deactivate.
- **`panels/public-summary.ts`** (new) — full-viewport overlay appended to
  `document.body` (`inset:0`, z-2000) with the Station / District / Type /
  Latest value / Status / Updated table, type dropdown + search filters,
  status pills, CSV (BOM, Excel-safe) and PDF (print-window) export, and the
  public note. Rows fly to the station and close the overlay on click.
- **`index.ts`** — right-panel `defaultWidth` 320 → 288; registered a
  `public-summary` panel and added a `nav_summary` toolbar item; plugin
  deactivate now disposes the station-detail floating panel.
- **`i18n.ts`** — new EN+MS keys: `nav_summary`, `ui_online`/`ui_offline`,
  `ps_all_types`, `ps_export_csv`, `ps_export_pdf`, `sd_center_map`,
  `sd_open_data`, `sd_thresholds`. (`sd_no_data` from the plan was dropped;
  a missing reading renders as `—`.)
- The Floating Station Panel and the Public Summary overlay are the first MITS
  UI to use `escapeHtml` on all interpolated dataset strings (station names,
  types, districts).

## Verification

- `npx tsc -b apps/geolibre-desktop/tsconfig.json` — clean.
- eslint on all touched MITS files — 0 errors.
- Note: `packages/plugins` standalone build flags pre-existing, unreferenced
  code (`mits/data/mapping.ts` imports, `local-netcdf.ts`, `maplibre-gl` CSS
  side-effect imports); these are not reachable from the app build and are
  untouched.