# Quick Task 260901-007: Fix Plugin Activation

## Status: COMPLETED

## Problem
`activeByDefault: true` in the MITS plugin registration was insufficient. The plugin manager's `register()` method added `activeByDefault` plugins to the `active` set, but never called `activate(app)` because the app API was unavailable at registration time. Later, `restoreProjectState` skipped activation because the plugin was already in `this.active`.

## Root Cause
`PluginManager.register()` at line 46: `this.active.add(plugin.id)` — this put the plugin in the active set without invoking `activate()`. When `restoreProjectState` ran, it saw `this.active.has(id)` and skipped the activation loop.

## Fix
Removed `this.active.add(plugin.id)` from `register()`. Now `register()` only adds to `defaultActive`, and `restoreProjectState` properly invokes `plugin.activate(app)` with the real app API.

**File changed:** `packages/plugins/src/plugin-manager.ts:42-50`

## Commit
`8f09e10e` — `fix: activate activeByDefault plugins in restoreProjectState`

## Verification
- TypeScript compilation passed
- Vite build succeeded (PWA service worker size limit error is pre-existing)
- Dev server restarted on http://localhost:5173

## Impact
This fix applies to ALL `activeByDefault` plugins, not just MITS. Any future plugin with `activeByDefault: true` will now be properly activated when the app loads.
