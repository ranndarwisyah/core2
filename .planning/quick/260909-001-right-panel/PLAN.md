---
slug: 260909-001-right-panel
status: complete
date: 2026-09-09
branch: quick/nav-panel-fixes
---

# Quick Task 260909-001: Real-time right panel, floating station panel, public summary table

## Objective

Implement `right-panel.md` (v0.1) for the MITS plugin:

1. **Right Panel (persistent)** — the registered `mits-telemetry-stations` panel
   becomes the live telemetry workspace: default width 288px, two tabs
   (Stations / Alerts), per-row status dot (green/amber/red), station name,
   latest value + unit, relative time ("2 min ago"), and status text. Clicking a
   row flies to the station **and** opens the Floating Station Panel. The Alerts
   tab shows only Alert/Warning/Danger stations and its badge shows the live
   alert count.
2. **Floating Station Panel** — a floating panel opened at the map's right side
   (`position: 'top-right'`) that shows detailed live data for the selected
   station and keeps the existing actions (Center map, Open full data). Closes
   via the host card × button, Escape, or a click outside.
3. **Public Summary Table (full overlay)** — a full-viewport overlay with a
   Station / District / Type / Latest value / Status / Updated table, a Type
   dropdown + search filters, CSV and PDF export, status pills, and the public
   note. Opened from a dedicated toolbar item and a button in the right panel.

Constraints: entirely within `packages/plugins/src/plugins/mits/` (host APIs for
the right panel, floating panels, and `getMap()` already exist). Left Layers
panel behaviour unchanged. Panel + floating panel can coexist.

## Plan

1. **`panels/station-display.ts`** (new): shared helpers used by the right
   panel, station detail, and public summary —
   - `stationLevel(rt)` → `MitsAlertLevel` via `resolveStationStatus`
   - `statusColor(rt)` → green (`⚠ normal`), amber (`alert`/`warning`), red
     (`danger`), grey when offline
   - `statusText(rt, locale)` → i18n status/offline label
   - `latestReading(rt)` → `{ value, unit }` (WL → `m`, RF → `mm`)
   - `parseStationDate(dt)` / `relativeTime(dt, locale)` → "2 min ago"
     (Intl.RelativeTimeFormat for `en`/`ms`, tolerant of `M/D/YY HH:mm`).
2. **`panels/station-list.ts`** (rewrite): rows per the spec (dot, name,
   value+unit, relative time, status text); click = `flyTo` + open station
   detail; Alerts tab filters to `alert|warning|danger` with live badge count;
   header gains a "Public Summary" button (`ps_*`).
3. **`panels/station-detail.ts`** (new): `openStationDetail(app, stationId)`
   registers + opens a floating panel (`position: 'top-right'`,
   `defaultWidth` ≈ 340) and returns a disposer; content shows the station's
   live value + unit, status, relative time, thresholds (when present), and the
   Center map / Open full data actions; Escape + outside-click close it.
4. **`panels/public-summary.ts`** (new): `openPublicSummary(app)` appends a
   full-viewport overlay to `document.body` (prototype-style `inset:0`), with
   type + search filters, status pills, CSV/PDF export (print-window PDF like
   the prototype), and the public note; `closePublicSummary()` removes it.
   Rows fly to the station on click.
5. **`index.ts`**: right-panel `defaultWidth` 320 → 288; register a
   `public-summary` panel (open/close the overlay) and expose it in the toolbar
   menu; track + dispose the station-detail floating panel in `deactivate`.
6. **`i18n.ts`**: add keys (EN + MS): `nav_summary`, `ui_online`/`ui_offline`,
   `ps_all_types`, `ps_export_csv`, `ps_export_pdf`, `sd_center_map`,
   `sd_open_data`, `sd_thresholds`. (`sd_no_data` was dropped — no reading
   renders as `—`, no dedicated key needed.)
7. **Docs**: `.planning/quick/260909-001-right-panel/SUMMARY.md`; append the
   task row + row for the quick directory in `.planning/STATE.md`.

## Verification

- `npx tsc -b` (packages/plugins reference) — clean.
- eslint on the touched MITS files — no new errors.
- Manual: plugin activates; right panel (Home / Real-Time) shows the new rows
  and tabs; clicking a row opens the floating detail at the right edge; Escape
  / outside-click closes it; toolbar Public Summary opens the full overlay with
  working filters and CSV export; deactivate leaves no stray DOM.