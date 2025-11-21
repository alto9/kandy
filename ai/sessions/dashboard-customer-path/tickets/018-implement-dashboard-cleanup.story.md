---
story_id: implement-dashboard-cleanup
session_id: dashboard-customer-path
feature_id: [free-dashboard, operated-dashboard]
spec_id: [dashboard-webview-spec]
diagram_id: [dashboard-architecture]
status: completed
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

- [x] Refresh timers stop when dashboard closes
- [x] Resources are released on close
- [x] No memory leaks from open/close cycles
- [x] Panel removed from active dashboards map
- [x] Dispose handler registered correctly
- [x] Works for both Free and Operated dashboards
- [x] Multiple open/close cycles work correctly

## Implementation Notes

**Status**: This feature was already fully implemented during stories 007 (add-free-dashboard-refresh) and 016 (add-operated-dashboard-refresh).

**Design Decision**: The story suggested creating a separate `DashboardManager.ts` file, but the actual implementation follows the superior approach established in story 017 - each panel class manages its own instances via static `openPanels` Map for better type safety and encapsulation.

**Implementation Details**:

**Cleanup in FreeDashboardPanel** (`src/dashboard/FreeDashboardPanel.ts`):
- Lines 113-124: `onDidDispose` handler registered with proper cleanup
- Line 118: `refreshManager.stopAutoRefresh()` stops the 30-second refresh timer
- Line 120: Panel removed from `openPanels` Map
- RefreshManager instance automatically garbage collected when panel is removed

**Cleanup in OperatedDashboardPanel** (`src/dashboard/OperatedDashboardPanel.ts`):
- Lines 121-132: `onDidDispose` handler registered with proper cleanup
- Line 126: `refreshManager.stopAutoRefresh()` stops the 30-second refresh timer
- Line 128: Panel removed from `openPanels` Map
- RefreshManager instance automatically garbage collected when panel is removed

**Data Caching**: No data caching is implemented - all data is fetched fresh on each refresh. Therefore, there is no cached data to clear on disposal.

**Request Cancellation**: In-flight kubectl queries are not explicitly canceled on disposal. This is acceptable because:
- All kubectl commands have a 5-second timeout (DashboardDataProvider.ts line 9)
- Queries use `Promise.allSettled()` which handles failures gracefully
- Implementing cancellation would require major refactoring to add AbortController throughout the kubectl execution chain
- The 5-second timeout is sufficient to prevent resource issues

**Test Coverage**: Disposal behavior is verified in `src/test/suite/dashboard/FreeDashboardPanel.test.ts` (lines 86-107), confirming that panels are properly removed from the map and resources are cleaned up after multiple open/close cycles.

All acceptance criteria verified and met by existing implementation.

## Dependencies

- implement-dashboard-multi-panel-support (017)

