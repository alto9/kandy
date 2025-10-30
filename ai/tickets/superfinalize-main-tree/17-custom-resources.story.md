---
story_id: custom-resources
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: pending
priority: medium
estimated_minutes: 25
---

# Custom Resources Implementation

## Objective

Implement the Custom Resources category to list all Custom Resource Definitions (CRDs) with placeholder click handlers.

## Context

Custom Resource Definitions allow users to extend Kubernetes with custom resource types. Users need to see all CRDs installed in the cluster. At this stage, clicking a CRD should not perform any action.

## Implementation Steps

1. Add logic to fetch CRDs using `kubectl get crds --output=json`
2. Parse CRDs and create tree items with group and kind information
3. Display CRD group and version (e.g., "apps.example.com/v1")
4. Show the resource kind (e.g., "MyCustomResource")
5. Implement placeholder click handler (no-op)

## Files Affected

- `src/tree/categories/CustomResourcesCategory.ts` - New file for CRD logic
- `src/kubectl/CustomResourceCommands.ts` - New file for CRD kubectl operations

## Acceptance Criteria

- [ ] Expanding Custom Resources shows all CRDs in the cluster
- [ ] CRD names display the kind (e.g., "MyCustomResource")
- [ ] Group and version are visible (e.g., "apps.example.com/v1")
- [ ] Clicking a CRD performs no action (placeholder)
- [ ] kubectl errors are handled gracefully

## Dependencies

- resource-category-foundation

