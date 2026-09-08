---
slug: 260908-003-remove-secondary-panel-titles
status: complete
date: 2026-09-08
branch: quick/nav-panel-fixes
---

# Quick Task 260908-003: Remove secondary panel title bars

## Objective

Keep the current horizontal-toolbar secondary panel style exactly as is. Only
change: drop the section-name header (the "Water Level" / "Map" / "Rainfall" /
"Advance" title row) so the panel starts directly with the icon row, and keep
the close (X) control, placed elegantly on the same row instead of a full
title bar.

## Plan

1. `DomainSecondaryPanel`: delete the header `<div>` with the `<h2>` title and
   the row it occupied; the panel now begins with the toolbar. Move the close
   button into the toolbar row, aligned to the panel's right edge
   (`ms-auto`, `me`-free, `shrink-0`), keeping its existing `X` icon and close
   aria-label. Keep the Map `mapTools` slot above the row.
2. `DomainToolbar`: drop its own `px-2 py-1.5` padding and become the
   flex-1 scrolling row (`min-w-0 flex-1`) inside the panel's padded
   `flex items-center` row so items + X share one line.
3. Section keeps its `aria-label` (title text was purely visual — no a11y
   regression; close button keeps its own aria-label).
4. Verify: `npx tsc -b apps/geolibre-desktop`, eslint on touched files,
   `tests/domain-nav.test.ts`.

## Verification

- `npx tsc -b apps/geolibre-desktop` — clean.
- eslint on the two touched files — 0 errors.
- `node --import tsx --test tests/domain-nav.test.ts` — 7/7 pass.