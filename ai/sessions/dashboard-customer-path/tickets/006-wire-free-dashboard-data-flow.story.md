---
story_id: wire-free-dashboard-data-flow
session_id: dashboard-customer-path
feature_id: [free-dashboard]
spec_id: [dashboard-webview-spec, free-nonoperated-dashboard-spec]
diagram_id: [dashboard-architecture]
status: completed
priority: high
estimated_minutes: 25
---

## Objective

Connect the Free Dashboard data fetching to the webview UI, implementing the complete data flow from kubectl queries to UI display.

## Context

This story connects all the pieces: when the webview requests data, fetch it via kubectl queries and send it to the webview for display. Handle loading states and errors.

## Implementation Steps

1. In `FreeDashboardPanel.ts`, handle 'requestData' message from webview
2. When requestData received:
   - Send 'loading' message to webview
   - Call DashboardDataProvider to fetch all data in parallel
   - Send 'updateData' message with fetched data
   - Or send 'error' message if fetch fails
3. Implement error handling for kubectl failures
4. Format data appropriately before sending to webview
5. Test end-to-end flow: open dashboard → loading → data display

## Files Affected

- `src/dashboard/FreeDashboardPanel.ts` - Implement message handling
- `src/extension.ts` - Update openDashboard command to create Free Dashboard panel

## Acceptance Criteria

- [ ] Opening dashboard shows loading spinner
- [ ] Data fetches successfully via kubectl
- [ ] Data displays in webview UI after loading
- [ ] Loading spinner disappears when data arrives
- [ ] Error message shows if kubectl fails
- [ ] Dashboard displays current cluster statistics
- [ ] Multiple dashboards can be opened (one per cluster)

## Dependencies

- implement-free-dashboard-ui (005)

