---
story_id: deployments-subcategory
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: completed
priority: high
estimated_minutes: 25
---

# Deployments Subcategory Implementation

## Objective

Implement the Deployments subcategory to list all deployments, with each deployment expandable to show its pods.

## Context

Deployments are a core Kubernetes workload type. Users need to see all deployments and be able to drill down to their pods. Pod clicks should use placeholder handlers at this stage.

## Implementation Steps

1. Add logic to fetch deployments using `kubectl get deployments --all-namespaces --output=json`
2. Parse deployments and create tree items with status information (ready replicas, total replicas)
3. Make each deployment expandable
4. Add logic to fetch pods for a specific deployment using label selectors
5. Implement placeholder click handlers for pod items (no-op)

## Files Affected

- `src/tree/categories/workloads/DeploymentsSubcategory.ts` - New file for deployments logic
- `src/kubectl/WorkloadCommands.ts` - kubectl wrappers for deployments and pods
- `src/tree/items/PodTreeItem.ts` - New file for pod tree item representation

## Acceptance Criteria

- [ ] Expanding Deployments shows all deployments across all namespaces
- [ ] Deployment items show replica counts (e.g., "3/3 ready")
- [ ] Each deployment is expandable to show its pods
- [ ] Pod names and status are displayed correctly
- [ ] Clicking a pod performs no action (placeholder)
- [ ] kubectl errors are handled gracefully

## Dependencies

- workloads-category-structure

