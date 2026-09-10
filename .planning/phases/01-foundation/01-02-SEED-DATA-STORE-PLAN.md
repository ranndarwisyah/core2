---
plan: 01-02
phase: 1
name: Seed Data, Store, Mock
wave: 1
autonomous: true
type: foundation
objective: Port all seed data from the MITS prototype (144 stations, 3 dams, 2 regulators, 3 webcams, rivers, canals), create localStorage CRUD helpers, and mock data generators.
tasks:
  - Create packages/plugins/src/plugins/mits/data/seed.ts with all seed constants
  - Create packages/plugins/src/plugins/mits/data/store.ts with localStorage CRUD
  - Create packages/plugins/src/plugins/mits/data/mock.ts with mock generators
must_haves:
  - seed.ts exports SEED_DAMS (3), SEED_STATIONS (~144), SEED_REALTIME (~144), SEED_REGULATORS (2), SEED_WEBCAMS (3), RID_SEED (6), DSG_MAIN_CONVEYANCE, RC_RIVERLINE_DATA, MP_HTML_B64
  - store.ts exports loadEntityStore and saveEntityStore functions
  - mock.ts exports mockStationReading, resolveStationStatus, explainAlertReason functions
files_created:
  - packages/plugins/src/plugins/mits/data/seed.ts
  - packages/plugins/src/plugins/mits/data/store.ts
  - packages/plugins/src/plugins/mits/data/mock.ts
