

---

## Prompt for GeoLibre (bottom tab navigation)

**Goal**  
In the GeoLibre app (screenshot 1: globe map UI at `localhost:5173`), replace the current floating/right menu with a **bottom tab bar** that mirrors the **MITS MADA Telemetry** top navigation (screenshot 2), but presented in a **tab UI** (screenshot 3: tab labels on top of a content area, active tab highlighted, inactive tabs muted).

**Placement**  

- Put the navigation at the **bottom** of the GeoLibre viewport (not the top).  
- Keep GeoLibre’s existing top bar (Project / Edit / View / …) if it is part of the host shell; only relocate the **MITS-style domain nav** to the bottom.  
- Tabs should sit above the status/coords strip if one exists, or as a fixed bottom bar so the map remains usable.

**Interaction model (tab style)**  

- Primary items are **tabs** (like “Tab one / Tab two / Tab three”).  
- Active tab: solid/raised panel, stronger label color.  
- Inactive tabs: muted background.  
- Clicking a tab either:  
  - opens that feature’s **content panel** above the tab bar, or  
  - for items with submenus, opens a **submenu panel** (secondary list) above the tab bar, then choosing a sub-item opens the feature.  
- Only one primary tab active at a time.  
- Choosing another tab **closes** the previous panel/submenu and shows the new one.  
- Include a clear way to dismiss the content panel (× or clicking the active tab again) and return to the map.

**Primary tabs (same order as MITS top nav)**  

1. **Home**  
2. **About Us**  
3. **Map**  
4. **Dam**  
5. **Rainfall**  
6. **Water Level**  
7. **Gate Opening**  
8. **Web Cam**  
9. **Services**  
10. **Advance**  

(Optional right-side utilities, not necessarily tabs: language EN/BM, notifications, user/profile — keep if GeoLibre already has equivalents.)

**Subdirectories / submenu items (preserve this hierarchy)**  

**About Us**  

- SHT MADA Overview  
- Mesej GM / TPP(T)  
- MADA Quality System  
- Hubungi Kami  
- Pelan Kawasan Muda  

**Map**  

- Station Location Map  
- (other map views if present in MITS)

**Dam**  

- Dam Data  
- Data Storage Graph  
- Inflow / Outflow Graph  

**Rainfall**  

- Monthly Rainfall Chart  
- Daily Rainfall Chart  
- Inflow / Outflow Graph  
- Dam Rainfall Data and Chart  
- River Rainfall Data and Chart  
- Muda Area Rainfall (Overall / Region)  
- Rainfall Data — 7 Days  
- Hourly Rainfall Data  

**Water Level**  

- Catchment River Data & WL Graph  
- Multiple Water Level Graph  
- Water Level Graph  
- Water Level Data  

**Gate Opening**  

- Regulator Map  
- Regulator Data  
- Regulator Water Level  
- Water Distribution  

**Web Cam**  

- Station SHT  
- Ampang Jajar  
- SPAI  

**Services**  

- Announcement  
- Feedback  

**Advance** (grouped sections)  

- **Data:** Data Entry, Dam Data, Table BPAH, Water Source & Irrigation [Duty] Overall, Region Irrigation Duty, Discharge (Q), Data Table, Real-Time Data, Database Query  
- **Report:** Daily Water Management, Drought, Flood Operation, Daily Report  
- **Info:** Daily Report Record, Slide Show, Rotate View  
- **Analysis:** Rainfall Contour, Rainblock Map, Simulation Dam, Water Distribution, Operation Map, Flood Map  
- **Configuration:** Use Configuration, Users, Station Configuration, Map Configuration  

**Visual / UX requirements**  

- Bottom bar: compact height (~40–48px), full width, dark theme compatible with GeoLibre’s UI.  
- Tab labels single-line; horizontal scroll on small widths if needed.  
- Submenu / content panel opens **upward** from the tab bar (not a top mega-menu).  
- Panel should not cover the entire map permanently; max-height ~40–50vh with scroll for long lists.  
- Wire each item to the existing GeoLibre feature routes/handlers where they exist; stub or “coming soon” only if missing.  
- Do **not** copy MITS branding/topbar layout; only the **directory structure** and **tab interaction pattern**.

**Out of scope**  

- Do not move GeoLibre’s Project/Edit/View/Settings chrome.  
- Do not reimplement full MITS business logic unless already present in GeoLibre.

**Acceptance criteria**  

1. Bottom tab bar shows the 10 primary sections.  
2. Tabs look like the reference tab UI (active vs inactive).  
3. Submenus match the hierarchy above.  
4. Switching tabs closes the previous panel and shows the new one.  
5. Map remains visible behind/above the bottom chrome.

-
