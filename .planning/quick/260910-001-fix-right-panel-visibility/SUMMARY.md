---
slug: 260910-001-fix-right-panel-visibility
status: complete
date: 2026-09-10
branch: quick/nav-panel-fixes
duration: ~2 min
tasks_completed: 2
files_changed: 1
---

# Fix MITS Right Panel Rail Not Visible on Load

The MITS plugin registered its right panel via `registerRightPanel` but never called `app.openRightPanel`, so the panel never entered the host's `visibleIds`. Without `visibleIds` presence, `useReplaceStylePanelId` returned null, `SharedSidebar` never mounted, and the 44px "REAL-TIME" rail was absent.

## Root Cause

`registerRightPanel` alone only adds the panel definition to the registry — it does not make the panel visible. The host only mounts the style-side SharedSidebar (the 44px right rail) when a `replace-style` panel enters the registry's `visibleIds` via `openRightPanel`.

## Change

Added `app.openRightPanel` and `app.collapseRightPanel` calls immediately after `registerRightPanel` in `activate`. This follows the established pattern used by `maplibre-a5`, `maplibre-dggrid`, `maplibre-arcgis-hub`, and others. Opening enters `visibleIds` (mounting the rail), then collapsing keeps the panel at the 44px rail width so it doesn't dominate the viewport on load.

**Files modified:** `packages/plugins/src/plugins/mits/index.ts`

**Commit:** `84739bb6`

## Deviations from Plan

### Plan says to change panel title key from `realtime_head` to `realtime_rail` — kept as `realtime_head`

- **Decision:** Leave `title: () => t('realtime_head', getLocaleCode())` unchanged
- **Rationale:** The shared rail already uppercases the title via its `uppercase` CSS class, so `realtime_head` ("Real-Time") renders as "REAL-TIME" in the rail — matching the prototype exactly (prototype rail = REAL-TIME, panel header h3 = "Real-Time"). Both the rail and expanded-panel header share the single panel title prop. Swapping to `realtime_rail` would wrongly uppercase the expanded panel header too, breaking the intended design.
- **Impact:** None — visual output is identical to the prototype.

## Task 2: Deactivation Cleanup (inspection only)

No code changes needed. `deactivate` already performs correct two-step cleanup:
1. `closeAllPanels()` → calls `app.closeRightPanel` for `station-list` → removes from `visibleIds`
2. `rightPanelDisposer?.()` → unregisters from registry

No double-close or stale-reference issues found.

## Verification

- **TypeScript:** `npx tsc -b apps/geolibre-desktop/tsconfig.json` — clean (no output)
- **ESLint:** `npx eslint packages/plugins/src/plugins/mits/index.ts` — clean (no output)

## Known Stubs

None.
