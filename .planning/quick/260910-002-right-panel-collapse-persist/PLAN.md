---
slug: right-panel-collapse-persist
status: in-progress
date: 2026-09-10
branch: quick/nav-panel-fixes
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/plugins/src/types.ts
  - apps/geolibre-desktop/src/components/panels/PluginRightPanel.tsx
  - packages/plugins/src/plugins/mits/index.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "Clicking the X button on a persistent panel collapses it to the rail instead of fully closing it"
    - "The REAL-TIME rail entry remains visible after clicking X on the MITS stations panel"
    - "Clicking the rail entry re-expands the collapsed panel"
    - "Non-persistent panels (e.g. Browser) still close fully when X is clicked"
  artifacts:
    - path: "packages/plugins/src/types.ts"
      provides: "persistent flag on GeoLibreRightPanelRegistration"
      contains: "persistent"
    - path: "apps/geolibre-desktop/src/components/panels/PluginRightPanel.tsx"
      provides: "Host X button respects persistent flag"
      contains: "persistent"
    - path: "packages/plugins/src/plugins/mits/index.ts"
      provides: "MITS panel registered with persistent: true"
      contains: "persistent: true"
  key_links:
    - from: "apps/geolibre-desktop/src/components/panels/PluginRightPanel.tsx"
      to: "packages/plugins/src/types.ts"
      via: "getRightPanel(activeId)?.persistent"
      pattern: "getRightPanel.*persistent"
    - from: "packages/plugins/src/plugins/mits/index.ts"
      to: "packages/plugins/src/types.ts"
      via: "persistent: true in registration"
      pattern: "persistent: true"
---

<objective>
Fix the MITS real-time panel disappearing from the right rail when the user clicks the X (close) button or collapses it.

Purpose: When the user clicks the header X on the MITS stations panel, `closeRightPanel` deletes it from `visibleIds`, which unmounts the SharedSidebar entirely — the "REAL-TIME" rail entry vanishes and there is no way to reopen the panel. The fix adds a `persistent` flag to panel registrations: persistent panels have their X button remapped to `collapseRightPanel` instead of `closeRightPanel`, so they always remain reopenable from the rail.

Output: Three files changed — type definition, host panel behavior, MITS registration.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@apps/geolibre-desktop/src/components/panels/PluginRightPanel.tsx
@packages/plugins/src/types.ts
@packages/plugins/src/right-panel-registry.ts
@packages/plugins/src/plugins/mits/index.ts
@apps/geolibre-desktop/src/hooks/useRightPanels.ts
@apps/geolibre-desktop/src/components/panels/SharedSidebar.tsx

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from codebase. -->

From packages/plugins/src/types.ts (lines 934-997):
```typescript
export interface GeoLibreRightPanelRegistration {
  id: string;
  title: string | (() => string);
  dock?: GeoLibreRightPanelDock;
  icon?: string;
  defaultWidth?: number;
  deactivatePluginOnClose?: boolean;
  render: (container: HTMLElement) => void | (() => void);
  onOpen?: () => void;
  onCollapse?: () => void;
  onClose?: () => void;
  onExplicitClose?: () => void;
}
```

From packages/plugins/src/right-panel-registry.ts:
```typescript
export function getRightPanel(id: string): (GeoLibreRightPanelRegistration & { title: string }) | undefined;
export function collapseRightPanel(id: string): void;
export function closeRightPanel(id: string): void;
```

From apps/geolibre-desktop/src/components/panels/PluginRightPanel.tsx (lines 1-10, 288-311):
```typescript
import { closeRightPanel, collapseRightPanel, getRightPanel, ... } from "@geolibre/plugins";
// X button (line 302-311):
<Button ... onClick={() => closeRightPanel(activeId)}>
  <X className="h-4 w-4" />
</Button>
// Collapse chevron (line 288-301):
<Button ... onClick={() => collapseRightPanel(activeId)}>
  {isLayersSide ? <PanelLeftClose /> : <PanelRightClose />}
</Button>
```

From packages/plugins/src/plugins/mits/index.ts (lines 154-166):
```typescript
rightPanelDisposer = app.registerRightPanel?.({
  id: `${MITS_PLUGIN_ID}-stations`,
  title: () => t('realtime_head', getLocaleCode()),
  dock: 'replace-style',
  defaultWidth: 288,
  render: (container) => { ... },
}) ?? null;
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>task 1: Add persistent flag to GeoLibreRightPanelRegistration type</name>
  <files>packages/plugins/src/types.ts</files>
  <action>
Add a `persistent?: boolean` field to `GeoLibreRightPanelRegistration` (after `deactivatePluginOnClose`, before `render`). Documentation should read:

```typescript
/**
 * When true, the host's close control (the × button in the panel header)
 * collapses the panel to its rail entry instead of fully removing it, so the
 * panel always remains reopenable from the side rail. Use for panels whose
 * rail presence is the user's primary way of returning to them (e.g. a
 * real-time monitoring panel). Non-persistent panels close fully and their
 * rail entry is removed. Displacement by another panel is unaffected.
 */
persistent?: boolean;
```

This is a pure type addition — no runtime behavior changes yet.
  </action>
  <verify>
    <automated>npx tsc -b apps/geolibre-desktop/tsconfig.json</automated>
  </verify>
  <done>`persistent` field exists on GeoLibreRightPanelRegistration with correct JSDoc, TypeScript compiles cleanly.</done>
</task>

<task type="auto">
  <name>task 2: Host panel X button respects persistent flag; MITS registers with persistent: true</name>
  <files>apps/geolibre-desktop/src/components/panels/PluginRightPanel.tsx, packages/plugins/src/plugins/mits/index.ts</files>
  <action>
**PluginRightPanel.tsx — X button behavior change:**

In the X (close) button's `onClick` handler (line 308), replace the unconditional `closeRightPanel(activeId)` with logic that checks the active panel's `persistent` flag:

```tsx
onClick={() => {
  const panel = getRightPanel(activeId);
  if (panel?.persistent) {
    collapseRightPanel(activeId);
  } else {
    closeRightPanel(activeId);
  }
}}
```

Keep the existing `title` and `aria-label` attributes as-is — both "Close panel" tooltip text remains semantically correct (the user is dismissing the expanded panel, whether via collapse or close). Do NOT add a new i18n key for this.

**mits/index.ts — registration change:**

Add `persistent: true` to the `registerRightPanel` call (around line 154-166):

```typescript
rightPanelDisposer = app.registerRightPanel?.({
  id: `${MITS_PLUGIN_ID}-stations`,
  title: () => t('realtime_head', getLocaleCode()),
  dock: 'replace-style',
  defaultWidth: 288,
  persistent: true,   // ← add this
  render: (container) => { ... },
}) ?? null;
```

No other MITS panel registrations need this flag (they are floating panels, not right panels).
  </action>
  <verify>
    <automated>npx tsc -b apps/geolibre-desktop/tsconfig.json; node --import tsx --test tests/right-panel-registry.test.ts</automated>
  </verify>
  <done>TypeScript compiles; existing right-panel registry tests pass. The X button on a persistent panel calls `collapseRightPanel` instead of `closeRightPanel`; non-persistent panels still close fully. MITS stations panel registered with `persistent: true`.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Panel registration → Host rendering | Plugin-provided `persistent` flag is trusted; host reads it at render time |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-002-01 | Tampering | `persistent` flag on panel registration | accept | Flag is read-only at render time; a malicious plugin setting `persistent: true` only affects its own panel's close behavior — no security impact |
</threat_model>

<verification>
1. **TypeScript:** `npx tsc -b apps/geolibre-desktop/tsconfig.json` — no errors
2. **Existing tests:** `node --import tsx --test tests/right-panel-registry.test.ts` — all pass
3. **ESLint:** `npx eslint packages/plugins/src/types.ts apps/geolibre-desktop/src/components/panels/PluginRightPanel.tsx packages/plugins/src/plugins/mits/index.ts`
4. **Manual verification:**
   - Launch app (`npm run dev` or `npm run tauri:dev`)
   - MITS panel opens and collapses to the "REAL-TIME" rail entry on the right
   - Click the rail entry to expand the panel
   - Click the × button in the panel header → panel collapses to the rail (does NOT disappear)
   - Click the rail entry again → panel re-expands
   - Verify the collapse chevron (arrow icon) also collapses to the rail (existing behavior, unchanged)
   - If Browser panel is available, click its × button → panel closes fully (rail entry removed) — non-persistent behavior preserved
</verification>

<success_criteria>
- `persistent?: boolean` added to `GeoLibreRightPanelRegistration` with JSDoc
- PluginRightPanel X button checks `getRightPanel(activeId)?.persistent` and calls `collapseRightPanel` instead of `closeRightPanel` when true
- MITS stations panel registered with `persistent: true`
- TypeScript compiles, existing tests pass, no regressions
- Manual: X button on MITS panel → rail entry persists → clicking rail re-expands
</success_criteria>

<output>
After completion, create `.planning/quick/260910-002-right-panel-collapse-persist/260910-002-SUMMARY.md`
</output>
