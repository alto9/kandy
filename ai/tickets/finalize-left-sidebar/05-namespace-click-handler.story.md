---
story_id: namespace-click-handler
session_id: finalize-left-sidebar
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
model_id: []
status: pending
priority: high
estimated_minutes: 30
---

## Objective
Implement click handler for namespace tree items that opens a webview panel for namespace navigation.

## Context
When a user clicks on a namespace (or "All Namespaces") in the tree view, a webview should open showing resource navigation for that namespace or cluster-wide view.

## Implementation Steps
1. Add tree item click event handler
2. Extract namespace and cluster information from clicked tree item
3. Call webview factory with namespace context
4. Handle "All Namespaces" differently from regular namespaces
5. Ensure only one webview per namespace (reuse existing if already open)

## Files Affected
- Tree view command registration
- Tree item click handler
- Webview factory integration

## Acceptance Criteria
- [ ] Clicking a namespace opens a webview panel
- [ ] Clicking "All Namespaces" opens cluster-wide webview
- [ ] Webview receives correct namespace and cluster context
- [ ] Clicking same namespace again focuses existing webview
- [ ] No errors occur when namespace is clicked

## Dependencies
- all-namespaces-item
- update-webview-factory-namespace (can be implemented in parallel)

