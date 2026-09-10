# panels.md — Navigation & Panel Specification

**Version 0.3** (concise)

## 1. Primary Top Bar
- Sole navigation bar (bottom bar completely removed).
- Centered.
- Items: Home | About Us | Map | Dam | Rainfall | Water Level | Gate Opening | Web Cam | Services | Advance
- Only one secondary panel open at a time.
- Switching top-level item auto-closes the current secondary panel.

## 2. Secondary Panel Style
- Horizontal toolbar with icons (same style as current Map panel).
- No main title (remove “Map”, “Water Level”, “Rainfall”, etc. to save space).
- Close (X) button retained, placed cleanly without a full title bar.

## 3. Map Secondary Panel
Contains (all on the same level):
- Project
- Edit
- View
- Add Data
- Processing
- Controls
- Plugins
- Settings
- Help
- Station Location Map
- Muda Area Plan
- MADA Quality System
- Contact Us

Remove GeoLibre logo. No third-level bars.

## 4. Other Secondary Panels
- Dam, Rainfall, Water Level, Gate Opening, Web Cam, Services, Home, About Us  
  → Same horizontal icon toolbar style.
- Content follows existing application structure.
- Heavy content (tables, charts, data views) opens as a full **Page Panel** overlay.

## 5. Advance Secondary Panel
- Opens in the same horizontal toolbar style.
- Items: Data | Report | Info | Analysis | Configuration
- Nested options (e.g. under Analysis) open as a **dropdown inside the secondary panel**.

## 6. Page Panel (Full Overlay)
- Used for data-heavy views (Dam Data, graphs, etc.).
- Covers the map area.
- Map stays alive in the background.
- Closing the page panel returns to the map.

## 7. Persistent Elements
- Left Layers panel remains.
- Map stays fully interactive when no page panel is open.
