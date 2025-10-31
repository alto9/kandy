---
story_id: daemonsets-subcategory
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: completed
priority: high
estimated_minutes: 25
---

# DaemonSets Subcategory Implementation

## Objective

Implement the DaemonSets subcategory to list all daemonsets, with each daemonset expandable to show its pods.

## Context

DaemonSets ensure that all (or some) nodes run a copy of a pod. Users need to see all daemonsets and drill down to their pods. Pod clicks should use placeholder handlers at this stage.

## Implementation Steps

1. Add logic to fetch daemonsets using `kubectl get daemonsets --all-namespaces --output=json`
2. Parse daemonsets and create tree items with status information (desired, ready, available)
3. Make each daemonset expandable
4. Add logic to fetch pods for a specific daemonset using label selectors
5. Implement placeholder click handlers for pod items (no-op)

## Files Affected

- `src/tree/categories/workloads/DaemonSetsSubcategory.ts` - New file for daemonsets logic
- `src/kubectl/WorkloadCommands.ts` - Add daemonset kubectl operations

## Acceptance Criteria

- [ ] Expanding DaemonSets shows all daemonsets across all namespaces
- [ ] DaemonSet items show node counts (e.g., "3/3 nodes")
- [ ] Each daemonset is expandable to show its pods
- [ ] Pod names and status are displayed correctly
- [ ] Clicking a pod performs no action (placeholder)
- [ ] kubectl errors are handled gracefully

## Dependencies

- workloads-category-structure

