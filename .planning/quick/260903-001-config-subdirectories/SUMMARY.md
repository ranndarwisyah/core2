# Quick Task 260903-001: Configuration Subdirectories — SUMMARY

**Status:** complete
**Commit:** `fad7f9dd`
**Date:** 2026-09-03

## What was done

Added the missing **Configuration** section to the Advance menus, listing exactly
the prototype's four subdirectories (`MITS_PROTOTYPE.html` lines 2468–2474):

1. Use Configuration (`adv_user_config`)
2. Users (`adv_users_group`)
3. Station Configuration (`adv_station_config`)
4. Map Configuration (`adv_map_config`)

The i18n keys existed in EN + MS but were used nowhere. No new keys needed.

- **Toolbar** (`buildToolbarMenu`): nested Configuration submenu under Advance.
  All four items open the login-gated admin panel (`openPanel('admin')`) —
  the prototype gates all four behind config RBAC, which maps to admin login.
- **Bottom tab bar**: Configuration renders as an inline expandable group
  (`▸/▾`) inside the Advance submenu; removed the now-redundant `adv-config`
  leaf that sat adjacent to the new group.
- **Bug fix**: the document capture-phase outside-click handler tore the
  submenu down before inner toggle clicks could run — now ignores clicks
  inside the bar/submenu.

## Verification

- `npx tsc -b` in `packages/plugins`: only pre-existing errors.
- Playwright vs dev server (`localhost:5173`), no page errors:
  - Toolbar: Home → Advance → Configuration → all 4 items (screenshot).
  - Tab bar: Advance → expandable Configuration group → all 4 items.
- Side finding (pre-existing, out of scope): the Home toolbar menu only
  appears once plugin registration settles after load; early queries can
  miss it. Fresh loads render it reliably.
