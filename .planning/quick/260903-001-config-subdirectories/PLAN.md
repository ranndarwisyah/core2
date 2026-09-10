# Quick Task: Configuration Subdirectories

**Slug:** `config-subdirectories`
**Date:** 2026-09-03
**Status:** in-progress

## Problem

The Configuration section's subdirectory listing is wrong. Per the MITS prototype
(`MITS_PROTOTYPE.html` lines 2468–2474, Advance → Configuration column) it must be:

1. Use Configuration (`adv_user_config`)
2. Users (`adv_users_group`)
3. Station Configuration (`adv_station_config`)
4. Map Configuration (`adv_map_config`)

The i18n keys exist in both EN and MS dictionaries but are **used nowhere** — neither
the toolbar Advance submenu nor the bottom tab bar Advance submenu lists any
Configuration section.

## Fix

- **Toolbar** (`buildToolbarMenu` in `mits/index.ts`): add a nested `Configuration`
  submenu under Advance with the 4 items. Nesting is supported — the toolbar
  renderer (`PluginToolbarMenus.tsx`) renders submenus recursively.
- **Bottom tab bar** (`BottomTabControl` in `mits/index.ts`): extend submenu items
  with an optional nested `children` group; render Configuration as an inline
  expandable section inside the Advance submenu.
- **Click behavior:** all four items open the admin panel (`openPanel('admin')`),
  the login-gated configuration hub. The prototype gates all four behind config
  RBAC, which maps to our admin login. No new panels, no new i18n keys.

## Verification

- `npx tsc -b` in `packages/plugins` (only pre-existing errors)
- Playwright against dev server: toolbar dropdown shows Configuration →
  4 items; tab bar Advance submenu shows expandable Configuration group;
  clicking an item opens the admin panel.
