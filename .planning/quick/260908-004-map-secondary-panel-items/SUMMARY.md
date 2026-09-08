# Quick Task 260908-004: Map secondary panel — single toolbar with all items — SUMMARY

**Status:** complete
**Date:** 2026-09-08
**Branch:** `quick/nav-panel-fixes`
**Commit:** `cab8f4db`

## What was done

The Map secondary panel is now ONE horizontal toolbar row. "Station Location
Map" no longer sits in a separate row below the panel; the MITS views were
moved up beside the GeoLibre menus.

- **`TopToolbar`** gained two optional props (standalone toolbar unaffected):
  - `trailingItems` — ReactNode rendered inside the header row after the
    built-in/external plugin menus, before the right-side project controls.
  - `onClose` — renders the panel close (X) control at the far right, carrying
    a `domainNav.closeSecondary` aria-label.
- **`DesktopShell`** Map-panel instance wires both: `onClose` closes the
  secondary panel, and `trailingItems` renders `DomainToolbarItemList(navId
  "map")` in a subtle `border-s` divider group — so the full target list sits
  on one line: Project · Edit · View · Add Data · Processing · Controls ·
  Plugins · Settings · Help · Station Location Map · Muda Area Plan · MADA
  Quality System · Contact Us.
- **`DomainSecondaryPanel`** renders only the embedded toolbar when `mapTools`
  is present (no extra row, no duplicate close); other panels keep their
  toolbar + X row unchanged.
- **Catalog** `map` entry lists the four MITS views as peer items, each
  `opensPagePanel` (they open the full-overlay page shell, consistent with the
  other domains). `en.json` gains three labels (Muda Area Plan, MADA Quality
  System, Contact Us).
- **`DomainToolbar`** refactored into `DomainToolbarItem` /
  `DomainToolbarItemList` (reused by the Map embedding) with icons for the new
  items.

## Verification

- `npx tsc -b apps/geolibre-desktop`: clean.
- eslint on touched files: 0 errors (2 pre-existing TopToolbar warnings in
  untouched code).
- `node --import tsx --test tests/domain-nav.test.ts`: 7/7 pass (incl. new
  assertions for the four `map` items).