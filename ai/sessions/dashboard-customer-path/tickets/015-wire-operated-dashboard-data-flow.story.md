---
story_id: wire-operated-dashboard-data-flow
session_id: dashboard-customer-path
feature_id: [operated-dashboard]
spec_id: [dashboard-webview-spec, free-operated-dashboard-spec]
diagram_id: [dashboard-architecture]
status: pending
priority: high
estimated_minutes: 25
---

## Objective

Connect all Operated Dashboard pieces: route command to create Operated Dashboard based on operator status, fetch and display data.

## Context

Update the `openDashboard` command to check operator status and route to either Free or Operated dashboard. Wire up complete data flow for Operated dashboard.

## Implementation Steps

1. Update `openDashboard` command handler in `extension.ts`
2. Check operator status:
   - If status === 'basic': create Free Dashboard
   - Otherwise: create Operated Dashboard
3. Pass operator status to Operated Dashboard creation
4. In Operated Dashboard, on 'requestData':
   - Fetch operator dashboard data
   - Fetch conditional content (AI recommendations or show upsell)
   - Send all data to webview
5. Handle loading and error states
6. Test complete flow: click Dashboard → check status → show correct dashboard

## Files Affected

- `src/extension.ts` - Update openDashboard routing logic
- `src/dashboard/OperatedDashboardPanel.ts` - Wire up data flow

## Acceptance Criteria

- [ ] Command checks operator status first
- [ ] Routes to Free Dashboard if status is 'basic'
- [ ] Routes to Operated Dashboard if operator installed
- [ ] Operated Dashboard fetches operator data successfully
- [ ] Conditional content displays based on API key
- [ ] Loading states work
- [ ] Error handling works
- [ ] Both dashboard types work end-to-end

## Dependencies

- implement-configure-api-key (014)

