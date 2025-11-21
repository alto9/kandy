---
story_id: add-dashboard-tree-item
session_id: dashboard-customer-path
feature_id: [free-dashboard, operated-dashboard]
spec_id: [tree-view-spec, dashboard-webview-spec]
diagram_id: [dashboard-architecture]
status: completed
priority: high
estimated_minutes: 25
---

## Objective

Add "Dashboard" menu item as the first item under each cluster in the tree view.

## Context

Both Free and Operated dashboards share the same tree menu item appearance. The Dashboard item should appear first in the categories list, before Reports and all other categories. This is the entry point for users to access cluster dashboards.

## Implementation Steps

1. Open `src/tree/ClusterTreeProvider.ts`
2. In the `getCategories()` method, add Dashboard as the first item in the categories array
3. Create a Dashboard tree item with type 'dashboard'
4. Set icon to 'dashboard' or appropriate codicon
5. Set collapsible state to `vscode.TreeItemCollapsibleState.None` (not expandable)
6. Add command `'kube9.openDashboard'` to the Dashboard tree item
7. Pass cluster element as command argument so dashboard knows which cluster to display
8. Ensure Dashboard appears before all other categories (Reports, Nodes, etc.)

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Add Dashboard item to getCategories()
- `src/tree/TreeItemTypes.ts` - Add 'dashboard' to TreeItemType enum if needed

## Acceptance Criteria

- [ ] Dashboard menu item appears first under each expanded cluster
- [ ] Dashboard item has appropriate dashboard icon
- [ ] Dashboard item is clickable (not expandable)
- [ ] Dashboard item triggers `kube9.openDashboard` command with cluster context
- [ ] Dashboard appears before Reports and all other categories
- [ ] Works for all clusters regardless of operator status

## Dependencies

- None - This is a foundational change to the tree view

