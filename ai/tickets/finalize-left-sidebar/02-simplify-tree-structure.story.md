---
story_id: simplify-tree-structure
session_id: finalize-left-sidebar
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: []
status: completed
priority: high
estimated_minutes: 30
---

## Objective
Simplify the tree view structure from deep hierarchy (Cluster → Namespace → Resource Type → Resources) to 2-level structure (Cluster → Namespaces only).

## Context
The tree view is being simplified to show only clusters and namespaces. Resource navigation will be handled within webviews instead of the tree view.

## Implementation Steps
1. Update TreeItemData interface to only include 'cluster', 'namespace', and 'allNamespaces' types
2. Remove ResourceType and Resource tree item implementations
3. Update tree provider to return only namespace items under clusters
4. Remove resource grouping logic (workloads, network, storage, configuration groups)
5. Update tree item rendering to handle only cluster and namespace types

## Files Affected
- Tree item data type definitions
- Tree data provider implementation
- Tree item rendering logic

## Acceptance Criteria
- [ ] TreeItemData interface only includes cluster, namespace, and allNamespaces types
- [ ] Tree provider returns only namespace children under clusters
- [ ] Resource type and resource items are completely removed
- [ ] Tree view displays correctly with 2-level structure
- [ ] No resource grouping code remains

## Dependencies
- None

