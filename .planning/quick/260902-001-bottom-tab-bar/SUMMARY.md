# Quick Task 260902-001: Bottom Tab Bar

**Status:** COMPLETE
**Commit:** `ee7aadb3` + `2d761dd9`

## What was done

1. Added a `BottomTabControl` class implementing maplibre-gl `IControl` in `packages/plugins/src/plugins/mits/index.ts`
2. Renders a dark-themed navigation bar at the bottom of the map with 10 primary tabs:
   - Home, About Us, Map, Dam, Rainfall, Water Level, Gate Opening, Webcam, Services, Advance
3. Each tab with submenus opens an upward-expanding dropdown
4. Active tab highlighted in cyan (#22d3ee) with bold weight
5. Registered in `activate()` and cleaned up in `deactivate()`
6. Fixed `import('chart.js')` → `import('chart.js/auto')` in `charts.ts` to resolve Chart.js v4 scale registration error
7. Removed leftover debug console.log statements from PluginToolbarMenus.tsx

## Files changed

- `packages/plugins/src/plugins/mits/index.ts` — BottomTabControl class + register/unregister in activate/deactivate
- `packages/plugins/src/plugins/mits/panels/charts.ts` — chart.js/auto import fix
- `apps/geolibre-desktop/src/components/layout/toolbar/PluginToolbarMenus.tsx` — debug log cleanup

## Verification

- TypeScript compilation: passes (no new errors)
- Dev server: running on port 5173, responds 200
