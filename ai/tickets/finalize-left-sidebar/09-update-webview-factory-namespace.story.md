---
story_id: update-webview-factory-namespace
session_id: finalize-left-sidebar
feature_id: [tree-view-navigation]
spec_id: [webview-spec]
model_id: []
status: pending
priority: high
estimated_minutes: 30
---

## Objective
Update the webview factory to create namespace-specific webviews instead of resource-specific webviews.

## Context
Webviews should now be opened for namespaces rather than individual resources. The factory needs to support two types: namespace webviews and "All Namespaces" cluster-wide webviews.

## Implementation Steps
1. Update webview factory to accept namespace context instead of resource context
2. Create namespace webview template that will show resource navigation
3. Create "All Namespaces" webview template for cluster-wide view
4. Update webview panel creation to pass namespace and cluster information
5. Implement webview panel lifecycle management (reuse existing panels)

## Files Affected
- Webview panel factory implementation
- Webview template files
- Webview panel manager

## Acceptance Criteria
- [ ] Factory accepts namespace context (namespace name, cluster context)
- [ ] Factory creates namespace-specific webview panels
- [ ] Factory creates "All Namespaces" webview for cluster-wide view
- [ ] Webview panels receive correct namespace and cluster context
- [ ] Existing webview panels are reused when same namespace is clicked
- [ ] Webview templates are properly initialized

## Dependencies
- None (can be developed in parallel with namespace-click-handler)

