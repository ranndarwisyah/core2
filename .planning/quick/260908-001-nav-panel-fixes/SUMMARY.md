# Quick Task 260908-001: Navigation panel fixes — SUMMARY

**Status:** complete
**Date:** 2026-09-08
**Branch:** `quick/nav-panel-fixes`
**Commits:** `2bd4edbf`, `cbef1ae0`, `532c2fcb`, `cd85af48`

## What was done

Follow-up fixes to the `panels.md` top-bar navigation (base shell in `cd85af48`),
per the five exact requirements:

1. **Bottom nav bar removed** (`2bd4edbf`, −294 lines): deleted the
   `BottomTabControl` class, its `bottomTabBarControl` registration in
   `activate()` / teardown in `deactivate()` in
   `packages/plugins/src/plugins/mits/index.ts`. The top bar is now the only
   primary navigation. `buildToolbarMenu` is kept for the legacy/viewer path.
2. **Map secondary panel cleaned** (`cbef1ae0`): `TopToolbar` gained
   `hideBrand` (drops the logo icon + product title) and
   `excludePluginMenuIds` (forwarded to both `PluginToolbarMenus` placements,
   which now filter by menu id). The embedded Map-panel instance renders with
   `hideBrand showProjectInfo={false} excludePluginMenuIds={["mits-telemetry"]}`,
   so no brand and no Home menu appear inside it. Legacy standalone instance
   unchanged.
3. **Top bar centered** (`532c2fcb`): `DomainTopBar` nav uses `mx-auto` —
   auto margins collapse to zero on overflow, so narrow viewports still scroll
   from the first item (unlike `justify-center`), RTL-safe.
4. **Uniform first-level rows** (`532c2fcb`): `DomainSecondaryPanel` renders
   every first-level sub-item (including Advance's Data/Report/Info/Analysis/
   Configuration) with one shared row style; the `<details>` dropdowns are
   gone.
5. **Nested options inline** (`532c2fcb`): groups expand via a controlled
   single-expand accordion (chevron + `aria-expanded`, reset on top-level
   switch) inside the same secondary panel — never another full panel.

Rules preserved: single-open secondary (`useDomainNav`, unchanged), Layers
panel untouched, map stays mounted/interactive behind the page overlay.

## Verification

- `node --import tsx --test tests/domain-nav.test.ts`: 7/7 pass (incl. new
  Advance first-level guard).
- `npx tsc -b apps/geolibre-desktop`: clean.
- `npx tsc -b packages/plugins`: only pre-existing errors in untouched files
  (MapCanvas CSS imports, local-netcdf WorkerGlobalScope, mits/data/mapping
  modules) — none in `mits/index.ts`.
- `npx eslint` on all touched files: 0 errors (2 pre-existing warnings in
  untouched TopToolbar code).
- No `BottomTabControl` / `mits-bottom-tab-host` references remain anywhere;
  no tests/e2e referenced the bottom bar.
