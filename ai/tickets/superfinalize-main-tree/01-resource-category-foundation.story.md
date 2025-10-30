---
story_id: resource-category-foundation
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: pending
priority: high
estimated_minutes: 25
---

# Resource Category Foundation

## Objective

Implement the 7 top-level resource categories that appear when a cluster is expanded in the tree view: Nodes, Namespaces, Workloads, Storage, Helm, Configuration, and Custom Resources.

## Context

This story implements the foundation for the expanded tree navigation structure. Previously, the tree showed only namespaces under clusters. Now it will show 7 resource categories in a specific order, which users can expand to navigate different types of Kubernetes resources.

## Implementation Steps

1. Update the `ClusterTreeProvider` to return 7 category tree items when a cluster is expanded
2. Create tree item type definitions for each category (Nodes, Namespaces, Workloads, Storage, Helm, Configuration, Custom Resources)
3. Ensure categories appear in the exact order specified in the feature
4. Add appropriate icons for each category using VS Code's icon library
5. Set up the tree item structure so categories can have children (but don't implement the children yet)

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Add category generation logic
- `src/tree/TreeItemTypes.ts` - Add category type definitions
- `src/tree/TreeItemFactory.ts` - Add factory methods for category items

## Acceptance Criteria

- [ ] When a cluster is expanded, exactly 7 categories are displayed
- [ ] Categories appear in order: Nodes, Namespaces, Workloads, Storage, Helm, Configuration, Custom Resources
- [ ] Each category has an appropriate icon
- [ ] Categories are expandable (showing placeholder or empty state until child implementations)
- [ ] No errors in VS Code extension host when expanding clusters

## Dependencies

- None (foundation story)

