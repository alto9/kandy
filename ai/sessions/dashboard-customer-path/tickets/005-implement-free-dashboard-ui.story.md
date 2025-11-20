---
story_id: implement-free-dashboard-ui
session_id: dashboard-customer-path
feature_id: [free-dashboard]
spec_id: [free-nonoperated-dashboard-spec]
diagram_id: [dashboard-architecture]
status: pending
priority: high
estimated_minutes: 30
---

## Objective

Implement the Free Dashboard UI with stats cards, basic charts, and workload details table.

## Context

The Free Dashboard displays cluster statistics in an easy-to-read format with cards for key metrics (namespaces, pods, nodes) and simple charts for workload distribution. Keep it lightweight and introductory.

## Implementation Steps

1. Update `src/dashboard/dashboardHtml.ts` to include:
   - Stats cards HTML (4 cards: Namespaces, Deployments, Pods, Nodes)
   - Charts container (workload distribution, node health)
   - Workload details table
   - Refresh button in header
2. Add CSS styling for:
   - Stats cards grid layout (responsive)
   - Chart containers
   - Workload table styling
   - VSCode-compatible colors
3. Add JavaScript to handle data updates:
   - `updateDashboardData(data)` function
   - Update stats card values
   - Update workload table rows
   - Format timestamps and numbers
4. Keep charts simple (can use Chart.js or simple HTML/CSS bars)
5. Add manual refresh button with onclick handler

## Files Affected

- `src/dashboard/dashboardHtml.ts` - Update HTML template
- `src/dashboard/FreeDashboardPanel.ts` - Wire up data updates

## Acceptance Criteria

- [ ] Stats cards display namespace, deployment, pod, and node counts
- [ ] Charts visualize workload distribution
- [ ] Workload table shows all 7 workload types
- [ ] UI is responsive and uses VSCode theme colors
- [ ] Refresh button is visible and clickable
- [ ] Data updates reflect in UI immediately
- [ ] Layout is clean and easy to read

## Dependencies

- create-free-dashboard-webview (004)

