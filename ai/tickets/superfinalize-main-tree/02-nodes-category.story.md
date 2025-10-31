---
story_id: nodes-category
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: completed
priority: high
estimated_minutes: 20
---

# Nodes Category Implementation

## Objective

Implement the Nodes category to display all cluster nodes when expanded, with placeholder click handlers.

## Context

The Nodes category should list all nodes in the cluster. This provides visibility into the cluster's infrastructure. At this stage, clicking on a node should not perform any action.

## Implementation Steps

1. Add logic to fetch nodes using `kubectl get nodes --output=json`
2. Parse the JSON response to extract node information (name, status, roles)
3. Create tree items for each node with appropriate icons
4. Add status indicators (Ready, NotReady, etc.) to node items
5. Implement placeholder click handler (no-op) for node items

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Add nodes fetching logic
- `src/tree/categories/NodesCategory.ts` - New file for nodes-specific logic
- `src/kubectl/NodeCommands.ts` - kubectl wrapper for node operations

## Acceptance Criteria

- [ ] Expanding the Nodes category shows all cluster nodes
- [ ] Node names are displayed correctly
- [ ] Node status is visible (Ready/NotReady)
- [ ] Clicking on a node performs no action (placeholder)
- [ ] kubectl errors are handled gracefully with error messages

## Dependencies

- resource-category-foundation

