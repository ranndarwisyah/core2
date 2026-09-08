---
slug: 260908-002-secondary-panels-toolbar
status: complete
date: 2026-09-08
branch: quick/nav-panel-fixes
---

# Quick Task 260908-002: Secondary panels use horizontal toolbar style

## Objective

Follow-up to 260908-001. Re-style every domain secondary panel to match the
Map secondary panel's horizontal toolbar (ghost icon+label buttons) instead of
the vertical list used by Rainfall / Dam / others. Advance keeps a horizontal
toolbar whose nested options appear as dropdowns only when a group is clicked.

## Requirements

1. **Rule 3 — all secondary panels:** horizontal toolbar style with icons;
   the vertical-list style (Rainfall, Dam, …) is removed everywhere.
2. **Rule 4 — Map secondary panel:** unchanged mechanics — keeps the embedded
   GeoLibre TopToolbar (Project / Edit / View / Add Data / …), no GeoLibre
   logo (already handled by `hideBrand`), "stations" view row now renders as a
   horizontal button.
3. **Rule 5 — Advance:** same horizontal toolbar; row shows Data, Report,
   Info, Analysis, Configuration as buttons; nested options appear via
   dropdown only on click.
4. **Rule 6 — unchanged rules:** single secondary panel open at a time, auto
   close on top-level switch, left Layers panel stays, map stays interactive in
   the background (no code change needed — verified after this styling pass).

## Plan

1. New `DomainToolbar` component (`domain-nav/DomainToolbar.tsx`):
   - renders `entry.items` as a horizontal row of ghost `Button`s
     (icon + label, matching the Map toolbar buttons) with a per-item icon map
     keyed `navId:itemId` and a `CircleHelp` fallback
   - leaf items open the page panel when `opensPagePanel`; otherwise they are
     disabled buttons ("present but not messy")
   - group items (Advance) render as `DropdownMenu` triggers; children become
     `DropdownMenuItem`s, opening the page panel when `opensPagePanel`
   - export from the domain-nav barrel
2. Rewrite `DomainSecondaryPanel` to always render `<DomainToolbar>` in place
   of the vertical `<ul>` / accordion (deletes the `ChevronDown` accordion and
   `ROW_BUTTON_CLASS` list style); keep header + close control + Map
   `mapTools` slot.
3. Verify: `npx tsc -b apps/geolibre-desktop`, eslint on touched files,
   `tests/domain-nav.test.ts`.

## Verification

- `npx tsc -b apps/geolibre-desktop` — clean.
- eslint on the three touched files — 0 errors.
- `node --import tsx --test tests/domain-nav.test.ts` — 7/7 pass (catalog +
  toggle rules unchanged).