---
slug: 260910-001-fix-right-panel-visibility
status: complete
date: 2026-09-10
branch: quick/nav-panel-fixes
---

# Fix MITS Right Panel Rail Not Visible on Load

## Root Cause

The MITS plugin registers its right panel (`dock: 'replace-style'`) in `activate` but never calls `app.openRightPanel`, so the panel never enters `visibleIds`. `useReplaceStylePanelId` returns null, `SharedSidebar` never mounts, and the 44px "REAL-TIME" rail is absent.

## Task 1: Open + collapse the right panel on activate

**File:** `packages/plugins/src/plugins/mits/index.ts`

After the existing `registerRightPanel` call (line ~166), add:

```ts
const rightPanelId = `${MITS_PLUGIN_ID}-stations`;
app.openRightPanel?.(rightPanelId);
app.collapseRightPanel?.(rightPanelId);
```

This follows the established pattern used by `maplibre-a5`, `maplibre-dggrid`, `maplibre-arcgis-hub`, and others: open to enter `visibleIds` (which makes `useReplaceStylePanelId` return non-null → `SharedSidebar` mounts), then collapse so the panel starts at the 44px rail.

Also change the panel title from `t('realtime_head', ...)` to `t('realtime_rail', ...)` so the rail label reads "REAL-TIME" explicitly (the `uppercase` CSS would achieve the same from "Real-Time", but using the dedicated key is clearer).

**Verify:**
```bash
npx tsc -b apps/geolibre-desktop/tsconfig.json
npx eslint packages/plugins/src/plugins/mits/index.ts
```

**Done:**
- `activate` calls `openRightPanel` then `collapseRightPanel` after registration
- Panel title uses `realtime_rail` key ("REAL-TIME")
- TypeScript compiles, ESLint passes

## Task 2: Verify deactivation cleanup

**No code changes expected** — existing `deactivate` already:
1. `closeAllPanels()` → calls `app.closeRightPanel` for `station-list` → removes from `visibleIds`
2. `rightPanelDisposer?.()` → unregisters from registry

Just confirm by inspection that the two-step cleanup is correct and no double-close or stale-reference issue exists.

**Verify:**
```bash
npx tsc -b apps/geolibre-desktop/tsconfig.json
```

**Done:**
- Deactivation removes panel from `visibleIds` and registry without errors

## Verification

```bash
# Type-check
npx tsc -b apps/geolibre-desktop/tsconfig.json

# Lint touched file
npx eslint packages/plugins/src/plugins/mits/index.ts

# Frontend tests (if any cover right-panel activation)
npm run test:frontend
```

**Manual:**
1. `npm run dev` → load app → right rail ("REAL-TIME") visible, collapsed (44px)
2. Click rail → panel expands to 288px with Stations / Alerts tabs
3. Click X or rail again → collapses back to 44px rail
4. Deactivate MITS plugin → rail disappears, no console errors
