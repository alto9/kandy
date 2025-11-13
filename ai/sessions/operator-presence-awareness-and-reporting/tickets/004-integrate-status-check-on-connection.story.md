---
story_id: integrate-status-check-on-connection
session_id: operator-presence-awareness-and-reporting
feature_id: [operator-presence-awareness]
spec_id: [operator-status-api-spec]
status: completed
priority: high
estimated_minutes: 25
---

## Objective

Integrate operator status checking into `ClusterTreeProvider` so that operator status is checked when clusters are first displayed.

## Context

When clusters are displayed in the tree view, the extension should check for operator presence and status. This happens asynchronously after cluster connectivity is checked, and the status should be cached per cluster context.

## Implementation Steps

1. Open `src/tree/ClusterTreeProvider.ts`
2. Import `OperatorStatusClient` from `../services/OperatorStatusClient`
3. Import `OperatorStatusMode` from `../kubernetes/OperatorStatusTypes`
4. Add private property `operatorStatusClient: OperatorStatusClient` initialized in constructor
5. In `getClusters()` method, after creating cluster items, call `checkOperatorStatus()` for each cluster asynchronously
6. Create private async method `checkOperatorStatus(item: ClusterTreeItem)`:
   - Get kubeconfig path from Settings
   - Get context name from item.resourceData
   - Call `operatorStatusClient.getStatus()` with kubeconfig path and context name
   - Update item.operatorStatus with the mode from cached status
   - Update item.operatorStatusDetails with full status if available
   - Call `updateTreeItemAppearance()` to refresh icon and tooltip
   - Fire `_onDidChangeTreeData` event to refresh tree view
7. Ensure status check happens asynchronously and doesn't block tree rendering
8. Handle errors gracefully - if status check fails, leave operatorStatus undefined

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Add operator status checking on cluster display

## Acceptance Criteria

- [ ] OperatorStatusClient is instantiated in ClusterTreeProvider
- [ ] Operator status is checked when clusters are displayed
- [ ] Status check happens asynchronously without blocking tree rendering
- [ ] ClusterTreeItem.operatorStatus is set with the correct mode
- [ ] ClusterTreeItem.operatorStatusDetails is set with full status data
- [ ] Errors during status check are handled gracefully
- [ ] Tree view refreshes after status is determined

## Dependencies

- 001-create-operator-status-client (needs OperatorStatusClient)
- 002-add-get-configmap-method (needs getConfigMap method)
- 003-create-operator-status-types (needs OperatorStatusMode type)

