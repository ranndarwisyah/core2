# Quick Task 260908-003: Remove secondary panel title bars — SUMMARY

**Status:** complete
**Date:** 2026-09-08
**Branch:** `quick/nav-panel-fixes`
**Commit:** `51f40486`

## What was done

- **`DomainSecondaryPanel`**: removed the section-name header (`<h2>` +
  its row). The panel now starts directly with the horizontal icon/toolbar
  row. The close (X) button moved onto that same row, aligned to the panel's
  right edge (`ms-auto shrink-0`), keeping its icon and close aria-label. The
  Map `mapTools` slot (embedded GeoLibre TopToolbar) still renders above the
  row. The section keeps only an `aria-label` for the heading semantics.
- **`DomainToolbar`**: lost its own padding and became the flex-1 scrolling
  row (`min-w-0 flex-1`, `md:overflow-x-auto`) inside the panel's single
  padded row, so items + close button share one line and the tall title bar
  is gone.

## Verification

- `npx tsc -b apps/geolibre-desktop`: clean.
- eslint on the two touched files: 0 errors.
- `node --import tsx --test tests/domain-nav.test.ts`: 7/7 pass.