---
slug: 260908-004-map-secondary-panel-items
status: complete
date: 2026-09-08
branch: quick/nav-panel-fixes
---

# Quick Task 260908-004: Map secondary panel — single toolbar with all items

## Objective

Fold the MITS map views into the Map secondary panel's single horizontal tool
row (same level as Project / Edit / View / Add Data / …) instead of a separate
row below. Full target list for the panel: Project, Edit, View, Add Data,
Processing, Controls, Plugins, Settings, Help, Station Location Map, Muda Area
Plan, MADA Quality System, Contact Us. No extra bar or third level anywhere.

## Plan

1. **`TopToolbar`**: new optional `trailingItems?: ReactNode` rendered inside
   the header row right after the external plugin menus (before the right-side
   project controls), and `onClose?: () => void` rendering the panel close (X)
   control at the far right. Standalone toolbar unaffected (props optional).
2. **Catalog** (`domainNavCatalog.ts`): the `map` entry now lists the MITS
   views as peer items — `stations` (Station Location Map), `mudaAreaPlan`,
   `qualitySystem` (MADA Quality System), `contactUs` — each `opensPagePanel`.
3. **`DomainToolbar`**: refactored to export `DomainToolbarItem` /
   `DomainToolbarItemList` so the MITS items can render inline inside the
   Toolbar row without the `flex-1` wrapper; added icons for the new map
   items (`MapPinned`, `ShieldCheck`, `Contact`).
4. **`DomainSecondaryPanel`**: when `mapTools` is present (the Map panel) it
   renders only the embedded toolbar — no separate item row beneath it, no
   duplicate close button (the Toolbar's `onClose` provides it). Other panels
   keep the toolbar + X row.
5. **`DesktopShell`**: the Map `TopToolbar` instance gets `onClose` (closes the
   panel) and `trailingItems` = `<DomainToolbarItemList navId="map">` wrapped
   in a subtle `border-s` divider group. `showProjectInfo` stays false.
6. **i18n**: `en.json` gains `domainNav.map.{mudaAreaPlan,qualitySystem,
   contactUs}` (English labels per the brief).
7. **Tests**: `tests/domain-nav.test.ts` asserts the four `map` items and that
   `map.stations` / `map.contactUs` now resolve as page items.
8. Verify: `npx tsc -b apps/geolibre-desktop`, eslint on touched files,
   `tests/domain-nav.test.ts`.

## Verification

- `npx tsc -b apps/geolibre-desktop`: clean.
- eslint on touched files: 0 errors (2 pre-existing TopToolbar warnings remain
  in untouched code).
- `node --import tsx --test tests/domain-nav.test.ts`: 7/7 pass.