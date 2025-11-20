---
story_id: create-free-dashboard-webview
session_id: dashboard-customer-path
feature_id: [free-dashboard]
spec_id: [dashboard-webview-spec, free-nonoperated-dashboard-spec]
diagram_id: [dashboard-architecture]
status: pending
priority: high
estimated_minutes: 30
---

## Objective

Create the webview panel for Free Dashboard with basic HTML structure, VSCode styling, and message passing setup.

## Context

The Free Dashboard webview displays cluster statistics in a VSCode-themed UI. It needs bidirectional message passing between the extension host and webview, and should use VSCode CSS variables for theming.

## Implementation Steps

1. Create `src/dashboard/FreeDashboardPanel.ts`
2. Implement `createFreeDashboardPanel(context, clusterContext, clusterName)` function
3. Create webview panel with ID 'kube9FreeDashboard'
4. Set title to `Dashboard: ${clusterName}`
5. Enable scripts and set retainContextWhenHidden: true
6. Create HTML template with:
   - VSCode CSS variables (--vscode-font-family, --vscode-foreground, etc.)
   - Dashboard container div
   - Loading spinner HTML
   - Error message container
7. Add webview message handler for 'requestData', 'refresh' messages
8. Add extension->webview messages for 'updateData', 'loading', 'error'
9. Implement `acquireVsCodeApi()` setup in webview script
10. Store panel reference for later disposal

## Files Affected

- `src/dashboard/FreeDashboardPanel.ts` - Create webview panel
- `src/dashboard/dashboardHtml.ts` - HTML template generation

## Acceptance Criteria

- [ ] Webview panel opens with correct title
- [ ] Panel uses VSCode theme colors
- [ ] Message passing works bidirectionally
- [ ] Loading spinner displays correctly
- [ ] Panel retains state when hidden
- [ ] Scripts are enabled for interactivity
- [ ] Panel disposes cleanly when closed

## Dependencies

- create-kubectl-dashboard-queries (003)

