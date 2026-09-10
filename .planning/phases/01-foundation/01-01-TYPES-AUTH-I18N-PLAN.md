---
plan: 01-01
phase: 1
name: Types, Constants, Auth, i18n
wave: 1
autonomous: true
type: foundation
objective: Create the TypeScript type definitions, plugin constants, simplified 2-user RBAC auth module, and bilingual i18n dictionaries for the MITS plugin.
tasks:
  - Create packages/plugins/src/plugins/mits/types.ts with all interfaces
  - Create packages/plugins/src/plugins/mits/constants.ts with plugin ID, layer IDs, storage keys
  - Create packages/plugins/src/plugins/mits/auth.ts with 2-user RBAC
  - Create packages/plugins/src/plugins/mits/i18n.ts with full EN/MS dictionaries
must_haves:
  - types.ts exports all MitsStation, MitsDam, MitsRealtime, MitsRegulator, MitsWebcam, MitsSession, MitsUserRole interfaces
  - auth.ts exports login, getSession, saveSession, clearSession, hasPermission
  - i18n.ts exports t(key, locale) function with ~250 EN keys and ~250 MS keys
  - constants.ts exports MITS_PLUGIN_ID, STATION_COLORS, LAYER_IDS, STORAGE_KEYS
files_created:
  - packages/plugins/src/plugins/mits/types.ts
  - packages/plugins/src/plugins/mits/constants.ts
  - packages/plugins/src/plugins/mits/auth.ts
  - packages/plugins/src/plugins/mits/i18n.ts
