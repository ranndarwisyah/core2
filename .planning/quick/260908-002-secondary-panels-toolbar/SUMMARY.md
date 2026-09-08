# Quick Task 260908-002: Secondary panels use horizontal toolbar style — SUMMARY

**Status:** complete
**Date:** 2026-09-08
**Branch:** `quick/nav-panel-fixes`
**Commit:** `c8702b5e`

## What was done

Restyled every domain secondary panel from the vertical list to the Map
panel's horizontal toolbar look (rule 3). One new component drives all panels:

- **`DomainToolbar`** (`domain-nav/DomainToolbar.tsx`): renders a top-level
  domain's sub-items as a horizontal row of ghost icon+label buttons, matching
  the Map secondary panel's buttons. Icons come from a per-item map keyed
  `navId:itemId` (so the several shared item ids like `data`/`overview` get
  section-appropriate icons) with a `CircleHelp` fallback.
  - **Leaves** (Dam, Rainfall, Water Level, Gate, Webcam, Services, …): click
    opens the page panel when `opensPagePanel`; items with no registered page
    render disabled — present but not messy.
  - **Groups (Advance):** Data / Report / Info / Analysis / Configuration
    render as toolbar buttons; their nested options appear only when clicked,
    as a dropdown inside the same panel (rule 5).
- **`DomainSecondaryPanel`** rewritten to always render `<DomainToolbar>`
  instead of the vertical `<ul>` + accordion (`ChevronDown`, `ROW_BUTTON_CLASS`
  and the accordion state are gone). Header, close control, and the Map
  `mapTools` slot (the full GeoLibre TopToolbar with `hideBrand`) are
  unchanged (rules 4, 6).
- Dropped the old per-item `opensPagePanel →` affordance into the dropdown
  items and kept the disabled-leaf affordance for placeholder sub-items.

## Verification

- `npx tsc -b apps/geolibre-desktop`: clean.
- `npx eslint` on the touched files: 0 errors.
- `node --import tsx --test tests/domain-nav.test.ts`: 7/7 pass.
- Rules 6 still hold structurally: `nextSecondaryId` (single-open + auto-close
  on switch) untouched, Layers panel untouched, page panel overlay keeps the
  map mounted behind it.