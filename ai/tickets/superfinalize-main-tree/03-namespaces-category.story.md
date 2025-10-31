---
story_id: namespaces-category
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: completed
priority: high
estimated_minutes: 20
---

# Namespaces Category Implementation

## Objective

Implement the Namespaces category to display all namespaces when expanded, with webview opening on click.

## Context

The Namespaces category lists all namespaces in the cluster. Clicking on a namespace should open a webview panel for that namespace, allowing detailed resource navigation. This maintains existing functionality but within the new category structure.

## Implementation Steps

1. Add logic to fetch namespaces using `kubectl get namespaces --output=json`
2. Parse the JSON response and sort namespaces alphabetically
3. Create tree items for each namespace with appropriate icons
4. Implement click handler that opens namespace webview panel
5. Add namespace status indicators (Active, Terminating, etc.)

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Add namespaces fetching logic
- `src/tree/categories/NamespacesCategory.ts` - New file for namespace-specific logic
- `src/webview/WebviewPanelFactory.ts` - Ensure namespace webview integration works

## Acceptance Criteria

- [ ] Expanding the Namespaces category shows all cluster namespaces
- [ ] Namespaces are sorted alphabetically
- [ ] Clicking a namespace opens its webview panel
- [ ] Namespace status is displayed correctly
- [ ] kubectl errors are handled gracefully

## Dependencies

- resource-category-foundation

