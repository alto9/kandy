---
story_id: create-operated-dashboard-webview
session_id: dashboard-customer-path
feature_id: [operated-dashboard]
spec_id: [dashboard-webview-spec, free-operated-dashboard-spec]
diagram_id: [dashboard-architecture]
status: pending
priority: high
estimated_minutes: 30
---

## Objective

Create the webview panel for Operated Dashboard with base UI structure, operator info display, and conditional content placeholder.

## Context

The Operated Dashboard is similar to Free Dashboard but adds operator metrics and a conditional content section (AI recommendations OR upsell CTA). Create the base structure now.

## Implementation Steps

1. Create `src/dashboard/OperatedDashboardPanel.ts`
2. Implement `createOperatedDashboardPanel(context, clusterContext, clusterName, operatorStatus)`
3. Create webview panel with ID 'kube9OperatedDashboard'
4. Set title to `Dashboard: ${clusterName}`
5. Create HTML template similar to Free Dashboard but add:
   - Operator status badge in header
   - Operator metrics section
   - Conditional content container (empty placeholder for now)
6. Add message handlers for 'requestData', 'refresh', 'configureApiKey'
7. Wire up basic data flow (will add conditional content in next stories)

## Files Affected

- `src/dashboard/OperatedDashboardPanel.ts` - Create webview panel
- `src/dashboard/operatedDashboardHtml.ts` - HTML template

## Acceptance Criteria

- [ ] Webview panel opens with correct title
- [ ] Operator status badge displays in header
- [ ] Operator metrics section is visible
- [ ] Conditional content container exists (empty for now)
- [ ] Message passing works
- [ ] Panel uses VSCode theme colors
- [ ] Panel similar to Free Dashboard with operator additions

## Dependencies

- query-operator-dashboard-data (009)

