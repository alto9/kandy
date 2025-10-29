---
story_id: manual-refresh-command
session_id: finalize-left-sidebar
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: []
status: pending
priority: high
estimated_minutes: 25
---

## Objective
Implement a manual refresh command that users can trigger to update the tree view and reconnect to clusters.

## Context
Since automatic updates are removed, users need a way to manually refresh the tree view and check cluster connectivity.

## Implementation Steps
1. Create a new VS Code command for manual refresh (e.g., `kandy.refreshTreeView`)
2. Register the command in package.json and extension activation
3. Implement refresh handler that re-queries clusters and namespaces
4. Add refresh button/icon to tree view toolbar
5. Show status message when refresh completes or fails

## Files Affected
- package.json (command registration)
- Extension activation code
- Tree view command handlers
- Tree view toolbar configuration

## Acceptance Criteria
- [ ] Refresh command is registered and callable
- [ ] Command re-queries cluster connectivity using kubectl
- [ ] Command re-queries namespaces for connected clusters
- [ ] Refresh icon appears in tree view toolbar
- [ ] User sees status message after refresh completes
- [ ] Errors during refresh are displayed to user

## Dependencies
- kubectl-cluster-connectivity
- kubectl-namespace-query
- remove-watch-logic

