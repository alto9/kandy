---
story_id: register-dashboard-command
session_id: dashboard-customer-path
feature_id: [free-dashboard, operated-dashboard]
spec_id: [dashboard-webview-spec]
diagram_id: [dashboard-architecture]
status: completed
priority: high
estimated_minutes: 20
---

## Objective

Register the `kube9.openDashboard` command that will be triggered when users click the Dashboard tree item.

## Context

This command needs to be registered in the extension activation and will serve as the entry point for opening dashboards. It determines operator status and routes to the appropriate dashboard type.

## Implementation Steps

1. Open `src/extension.ts`
2. In the `registerCommands()` function, add registration for `kube9.openDashboard`
3. Create a handler that accepts `ClusterTreeItem` as parameter
4. Extract cluster context and name from the tree item
5. Call `getOperatorStatus()` to determine dashboard type
6. Create placeholder dashboard opening logic (will be implemented in next stories)
7. Add command to `package.json` if needed for discoverability

## Files Affected

- `src/extension.ts` - Register dashboard command
- `package.json` - Add command to contributions (if needed)

## Acceptance Criteria

- [x] `kube9.openDashboard` command is registered successfully
- [x] Command accepts ClusterTreeItem parameter
- [x] Command extracts cluster context correctly
- [x] Command checks operator status
- [x] Command is properly disposed on deactivation
- [x] Clicking Dashboard tree item triggers the command

## Dependencies

- add-dashboard-tree-item (001)

