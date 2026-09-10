---
task: "Create bottom tab bar for MITS plugin navigation"
status: in-progress
created: 2026-09-02
---

# Plan: Bottom Tab Bar

## Goal
Replace the toolbar dropdown menu with a bottom tab bar that provides persistent navigation to all MITS features.

## Approach
1. Create `BottomTabBar.tsx` component in the MITS plugin
2. Register as a floating panel or map control in `activate()`
3. Style with dark theme, compact height, tab switching
4. Wire each tab to existing panel openers

## Steps
1. Create the BottomTabBar component with 10 primary tabs
2. Add submenu support for tabs with sub-items
3. Register in MITS plugin activate() as a map control (bottom-left position)
4. Style: dark background, active tab highlight, scrollable on small widths
5. Wire tab clicks to existing `openPanel()` calls
