---
story_id: statefulsets-subcategory
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: completed
priority: high
estimated_minutes: 25
---

# StatefulSets Subcategory Implementation

## Objective

Implement the StatefulSets subcategory to list all statefulsets, with each statefulset expandable to show its pods.

## Context

StatefulSets manage stateful applications with stable network identities. Users need to see all statefulsets and drill down to their pods. Pod clicks should use placeholder handlers at this stage.

## Implementation Steps

1. Add logic to fetch statefulsets using `kubectl get statefulsets --all-namespaces --output=json`
2. Parse statefulsets and create tree items with status information (ready replicas, total replicas)
3. Make each statefulset expandable
4. Add logic to fetch pods for a specific statefulset using label selectors
5. Implement placeholder click handlers for pod items (no-op)

## Files Affected

- `src/tree/categories/workloads/StatefulSetsSubcategory.ts` - New file for statefulsets logic
- `src/kubectl/WorkloadCommands.ts` - Add statefulset kubectl operations

## Acceptance Criteria

- [ ] Expanding StatefulSets shows all statefulsets across all namespaces
- [ ] StatefulSet items show replica counts (e.g., "2/2 ready")
- [ ] Each statefulset is expandable to show its pods
- [ ] Pod names are displayed in order (statefulset-0, statefulset-1, etc.)
- [ ] Clicking a pod performs no action (placeholder)
- [ ] kubectl errors are handled gracefully

## Dependencies

- workloads-category-structure

