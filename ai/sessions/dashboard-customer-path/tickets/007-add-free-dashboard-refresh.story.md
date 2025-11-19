---
story_id: add-free-dashboard-refresh
session_id: dashboard-customer-path
feature_id: [free-dashboard]
spec_id: [dashboard-webview-spec, free-nonoperated-dashboard-spec]
diagram_id: [dashboard-architecture]
status: pending
priority: medium
estimated_minutes: 20
---

## Objective

Implement automatic (every 30 seconds) and manual refresh mechanisms for the Free Dashboard.

## Context

The Free Dashboard should auto-refresh data every 30 seconds to keep statistics current. Users should also be able to manually refresh via a button.

## Implementation Steps

1. Create `DashboardRefreshManager` class in `src/dashboard/RefreshManager.ts`
2. Implement `startAutoRefresh(panel, clusterContext)` method
   - Set interval to 30 seconds
   - Only refresh if panel is visible
   - Use setInterval()
3. Implement `stopAutoRefresh()` method to clear interval
4. Handle manual refresh message from webview
5. Call stopAutoRefresh() on panel dispose
6. Add refresh button handler in webview HTML
7. Show loading indicator during refresh (but don't block UI)

## Files Affected

- `src/dashboard/RefreshManager.ts` - Create refresh manager
- `src/dashboard/FreeDashboardPanel.ts` - Use refresh manager
- `src/dashboard/dashboardHtml.ts` - Add refresh button handler

## Acceptance Criteria

- [ ] Dashboard auto-refreshes every 30 seconds
- [ ] Manual refresh button works
- [ ] Refresh shows loading indicator
- [ ] Auto-refresh stops when panel is not visible
- [ ] Auto-refresh stops when panel is disposed
- [ ] Refresh doesn't disrupt user interaction
- [ ] Multiple refreshes don't stack up

## Dependencies

- wire-free-dashboard-data-flow (006)

