---
story_id: implement-dashboard-cleanup
session_id: dashboard-customer-path
feature_id: [free-dashboard, operated-dashboard]
spec_id: [dashboard-webview-spec]
diagram_id: [dashboard-architecture]
status: pending
priority: medium
estimated_minutes: 15
---

## Objective

Ensure dashboards clean up resources properly when closed: stop refresh timers, cancel in-flight requests, dispose panels.

## Context

When users close a dashboard webview, all associated resources must be properly cleaned up to avoid memory leaks and orphaned processes.

## Implementation Steps

1. In both Free and Operated Dashboard panels, implement `dispose()` method
2. Stop auto-refresh timers via RefreshManager
3. Cancel any in-flight kubectl queries if possible
4. Clear any cached data for the cluster
5. Remove panel from activeDashboards map
6. Call panel.dispose() on the webview panel
7. Register dispose handler with panel.onDidDispose()
8. Test by opening and closing multiple dashboards

## Files Affected

- `src/dashboard/FreeDashboardPanel.ts` - Add cleanup
- `src/dashboard/OperatedDashboardPanel.ts` - Add cleanup
- `src/dashboard/DashboardManager.ts` - Handle disposal

## Acceptance Criteria

- [ ] Refresh timers stop when dashboard closes
- [ ] Resources are released on close
- [ ] No memory leaks from open/close cycles
- [ ] Panel removed from active dashboards map
- [ ] Dispose handler registered correctly
- [ ] Works for both Free and Operated dashboards
- [ ] Multiple open/close cycles work correctly

## Dependencies

- implement-dashboard-multi-panel-support (017)

