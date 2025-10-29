---
story_id: all-namespaces-item
session_id: finalize-left-sidebar
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: []
status: completed
priority: medium
estimated_minutes: 20
---

## Objective
Add "All Namespaces" as a special tree item that appears first under each cluster.

## Context
Each cluster should show "All Namespaces" as the first option, followed by individual namespaces alphabetically. This special item will open a cluster-wide webview.

## Implementation Steps
1. Create special TreeItemData entry with type 'allNamespaces'
2. Update tree provider to insert "All Namespaces" as first item under clusters
3. Ensure "All Namespaces" appears before alphabetically sorted namespace items
4. Add appropriate icon/label for the "All Namespaces" item
5. Store cluster context in metadata for later webview opening

## Files Affected
- Tree data provider namespace listing logic
- Tree item creation logic

## Acceptance Criteria
- [ ] "All Namespaces" appears as first item under each expanded cluster
- [ ] Individual namespaces appear after "All Namespaces" in alphabetical order
- [ ] "All Namespaces" has appropriate icon and label
- [ ] Tree item includes cluster context in metadata
- [ ] Item is visually distinct from regular namespace items

## Dependencies
- simplify-tree-structure
- kubectl-namespace-query

