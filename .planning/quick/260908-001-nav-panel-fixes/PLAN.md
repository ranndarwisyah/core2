# Quick Task: Navigation panel fixes (top-bar-only nav)

**Slug:** `nav-panel-fixes`
**Date:** 2026-09-08
**Status:** in-progress

## Problem

Follow-up to the `panels.md` top-bar implementation (`domain-nav/` + DesktopShell
wiring, uncommitted on `quick/nav-panel-fixes`). Five defects vs. the spec:

1. The MITS bottom tab bar (`BottomTabControl` in `mits/index.ts`) still renders —
   the top bar must be the only primary navigation.
2. The Map secondary panel embeds the full `TopToolbar`, which shows the GeoLibre
   brand (logo icon + title) and the MITS "Home" toolbar menu.
3. `DomainTopBar` items are left-aligned with empty space on the right.
4. Advance's first-level groups render as `<details>` dropdowns while every other
   panel renders plain list rows — all first levels must share one style.
5. (Kept) nested Advance options must expand inline inside the same secondary
   panel, never as another full panel.

## Fix

- **mits plugin** (`packages/plugins/src/plugins/mits/index.ts`): delete the
  `BottomTabControl` class, the `bottomTabBarControl` variable, and its
  register/unregister in `activate()`/`deactivate()`. Keep `buildToolbarMenu`
  (legacy/viewer path still uses it).
- **TopToolbar** (`apps/geolibre-desktop/.../layout/TopToolbar.tsx`): add
  `hideBrand?: boolean` (skips brand span) and `excludePluginMenuIds?: string[]`
  (forwarded to both `PluginToolbarMenus` instances). `PluginToolbarMenus`
  filters `entries` by `entry.menu.id`.
- **DesktopShell**: embedded Map-panel `TopToolbar` gets
  `hideBrand showProjectInfo={false} excludePluginMenuIds={["mits-telemetry"]}`
  (`MITS_PLUGIN_ID` from `@geolibre/plugins`). Legacy standalone instance
  unchanged.
- **DomainTopBar**: center via `mx-auto` on the `<nav>` (safe-centering: margins
  collapse to 0 on overflow so horizontal scroll still works, RTL-safe).
- **DomainSecondaryPanel**: replace `<details>` with a controlled single-expand
  accordion — group rows use the exact same button classes as leaf rows plus a
  chevron affordance and `aria-expanded`; children render inline indented below.
- **Tests** (`tests/domain-nav.test.ts`): assert Advance first level is exactly
  Data/Report/Info/Analysis/Configuration groups with children.

## Files

- `packages/plugins/src/plugins/mits/index.ts`
- `apps/geolibre-desktop/src/components/layout/TopToolbar.tsx`
- `apps/geolibre-desktop/src/components/layout/toolbar/PluginToolbarMenus.tsx`
- `apps/geolibre-desktop/src/components/layout/DesktopShell.tsx`
- `apps/geolibre-desktop/src/components/layout/domain-nav/DomainTopBar.tsx`
- `apps/geolibre-desktop/src/components/layout/domain-nav/DomainSecondaryPanel.tsx`
- `apps/geolibre-desktop/src/i18n/locales/en.json` (only if a new key is needed)
- `tests/domain-nav.test.ts`

## Verification

- `npx tsc -b apps/geolibre-desktop` clean; `npx tsc -b` in `packages/plugins`
  shows only pre-existing errors.
- `npx eslint` on touched files clean.
- `node --import tsx --test tests/domain-nav.test.ts` passes.
- No `BottomTabControl` / `mits-bottom-tab-host` references remain.
- Rules preserved: single-open secondary (existing `useDomainNav`), Layers panel
  untouched, page overlay unchanged.
