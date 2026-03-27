# Archived Vanilla JS POS Components

These files were archived from the vanilla JS terminal frontend (`frontend/src/`)
when consolidating to the canonical React terminal (`KINDpos-site/terminal/`).

They contain UI patterns and logic not yet ported to React. Use as reference
when implementing these features in the React terminal.

## Components

- `house-charts.js` — SVG chart primitives: sales sparkline, labor gauge (semicircle with needle), server balance bars, floor heat grid
- `approvals-queue.js` — Manager approval cards (discount, void, OT warning) with APPROVE/DENY actions
- `staff-monitoring.js` — Labor monitoring cards with hours, progress bars, OT warnings, role-based variants
- `closing-pipeline.js` — Close-day UI: server readiness tiles, batch settlement progress
- `hex.js` — Hexagon rendering with clip-path CSS
- `hex-cluster.js` — 3x3 honeycomb cluster layout

## Stores

- `menu-store.js` — Full modifier library (TEMP, SIDE, ADD, NO, SUB) and menu hierarchy
- `snapshot-store.js` — Centralized mock data (tables, shifts, messages, hardware)

## Utils

- `hex-math.js` — Pure geometry: hex points, face positions, bloom ordering, collision detection
