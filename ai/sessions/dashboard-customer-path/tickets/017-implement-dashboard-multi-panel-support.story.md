---
story_id: implement-dashboard-multi-panel-support
session_id: dashboard-customer-path
feature_id: [free-dashboard, operated-dashboard]
spec_id: [dashboard-webview-spec]
diagram_id: [dashboard-architecture]
status: completed
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

- [x] Multiple dashboards can be open simultaneously
- [x] One dashboard per cluster
- [x] Clicking Dashboard again reveals existing panel
- [x] Each dashboard shows data for its specific cluster
- [x] Panel disposal removes from map
- [x] State is independent per dashboard
- [x] Can switch between dashboard panels freely

## Implementation Notes

**Status**: This feature was already fully implemented during story 016 (add-operated-dashboard-refresh).

**Design Decision**: The story suggested creating a separate `DashboardManager.ts` file, but the actual implementation uses a superior approach:
- Each panel class (FreeDashboardPanel, OperatedDashboardPanel) manages its own instances via static `openPanels` Map
- This provides better type safety, encapsulation, and consistency with other webview classes (NamespaceWebview)
- Free and Operated dashboards have different PanelInfo structures (operatorStatus field), making separate Maps cleaner

**Implementation Details**:
- `FreeDashboardPanel.ts` (lines 27, 56-60, 80, 120): Multi-panel support with Map keyed by contextName
- `OperatedDashboardPanel.ts` (lines 32, 63-67, 87, 128): Identical pattern with operator-specific fields
- Each panel maintains independent state via its own DashboardRefreshManager
- Panel disposal properly cleans up from Map and stops refresh timers

All acceptance criteria verified and met by existing implementation.

## Dependencies

- add-operated-dashboard-refresh (016)

