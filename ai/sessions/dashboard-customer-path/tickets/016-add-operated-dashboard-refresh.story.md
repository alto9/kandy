---
story_id: add-operated-dashboard-refresh
session_id: dashboard-customer-path
feature_id: [operated-dashboard]
spec_id: [dashboard-webview-spec, free-operated-dashboard-spec]
diagram_id: [dashboard-architecture]
status: completed
priority: medium
estimated_minutes: 20
---

## Objective

Add automatic and manual refresh for Operated Dashboard, including re-checking operator status and conditional content.

## Context

Operated Dashboard needs to refresh data every 30 seconds like Free Dashboard, but also re-check operator status to detect API key configuration changes.

## Implementation Steps

1. Reuse `DashboardRefreshManager` from Free Dashboard
2. Configure for Operated Dashboard with 30-second interval
3. On refresh:
   - Re-query operator status
   - Re-fetch operator dashboard data
   - Re-fetch conditional content (AI recommendations or upsell)
   - Update all sections in webview
4. Handle manual refresh button
5. Detect if conditional content type changed (upsell → AI)
6. Stop refresh on panel dispose

## Files Affected

- `src/dashboard/OperatedDashboardPanel.ts` - Add refresh logic
- `src/dashboard/RefreshManager.ts` - Extend if needed

## Acceptance Criteria

- [x] Auto-refresh works every 30 seconds
- [x] Manual refresh button works
- [x] Refresh re-checks operator status
- [x] Conditional content updates if API key configured
- [x] Dashboard switches from upsell to AI panel on key configuration
- [x] Refresh stops when panel disposed
- [x] Loading indicator shows during refresh

## Dependencies

- wire-operated-dashboard-data-flow (015)

