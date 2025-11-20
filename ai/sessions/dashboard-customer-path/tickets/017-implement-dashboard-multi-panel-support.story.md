---
story_id: implement-dashboard-multi-panel-support
session_id: dashboard-customer-path
feature_id: [free-dashboard, operated-dashboard]
spec_id: [dashboard-webview-spec]
diagram_id: [dashboard-architecture]
status: pending
priority: medium
estimated_minutes: 25
---

## Objective

Enable multiple dashboard panels to be open simultaneously (one per cluster) with proper state management.

## Context

Users should be able to open dashboards for multiple clusters at once. Each dashboard maintains its own state and doesn't interfere with others. Clicking Dashboard again for an already-open cluster should reveal that panel.

## Implementation Steps

1. Create `activeDashboards` Map in extension.ts or dashboard manager
2. Map structure: `Map<clusterContext, WebviewPanel>`
3. In `openDashboard` command:
   - Check if dashboard already exists for this cluster
   - If exists: reveal existing panel
   - If not: create new panel and add to map
4. On panel dispose: remove from map
5. Ensure each panel has unique state
6. Test opening multiple dashboards for different clusters

## Files Affected

- `src/dashboard/DashboardManager.ts` - Create manager for multi-panel support
- `src/extension.ts` - Use dashboard manager

## Acceptance Criteria

- [ ] Multiple dashboards can be open simultaneously
- [ ] One dashboard per cluster
- [ ] Clicking Dashboard again reveals existing panel
- [ ] Each dashboard shows data for its specific cluster
- [ ] Panel disposal removes from map
- [ ] State is independent per dashboard
- [ ] Can switch between dashboard panels freely

## Dependencies

- add-operated-dashboard-refresh (016)

