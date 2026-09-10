# right-panel.md — Real-time Right Panel Specification

**Version 0.1**

## 1. Right Panel (persistent)

- Collapsible side panel on the right of the map.
- Default: collapsed.
- Width when open: ~288px.
- Contains two tabs:

### 1.1 Stations tab
- Live list of all telemetry stations.
- Each row shows:
  - Status dot (green / amber / red)
  - Station name
  - Latest value + unit
  - Relative time (e.g. “2 min ago”)
  - Status text
- Clicking a station:
  - Highlights / flies to it on the map
  - Opens the Floating Station Panel

### 1.2 Alerts tab
- Same row style as Stations.
- Shows only stations currently in Alert / Warning / Danger.
- Badge on the tab displays the current alert count.

## 2. Floating Station Panel

- Appears on the right side of the map (overlay, not inside the right panel).
- Shows detailed live data for the selected station.
- Close via × button, click outside, or Escape.
- Keep existing actions (Center map, Open full data, etc.).

## 3. Public Summary Table (full overlay)

- Opened from secondary panels or a dedicated control.
- Full-width table with columns:
  - Station
  - District
  - Type
  - Latest value
  - Status
  - Updated
- Filters: Type dropdown + Search box.
- Export buttons: CSV and PDF.
- Status pills: Normal / Alert / Warning / Danger.
- Note for public users: “Public view shows status labels only. Sign in for charts and operational tools.”

## 4. Rules

- Right panel and Floating Station Panel can be open at the same time.
- Map remains interactive underneath.
- Left Layers panel behaviour is unchanged.
