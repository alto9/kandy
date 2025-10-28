---
story_id: display-clusters-in-tree
session_id: design-the-installation-and-setup-procedures-for-u
feature_id: [initial-configuration]
spec_id: [tree-view-spec]
model_id: []
status: pending
priority: high
estimated_minutes: 25
---

## Objective

Populate the tree view with detected clusters and contexts from the parsed kubeconfig.

## Context

Once the ClusterTreeProvider infrastructure exists and kubeconfig parsing works, we need to connect them. The tree provider should call the kubeconfig parser, receive cluster data, and display each cluster as a top-level tree item with its context name. This enables users to see all their configured clusters.

## Implementation Steps

1. Import KubeconfigParser in ClusterTreeProvider
2. Call parser in getChildren() when element is undefined (root level)
3. Create tree items for each cluster with:
   - Label showing cluster name
   - Context name as description or tooltip
   - Collapsible state
   - Appropriate icon
4. Handle empty cluster list (show "No clusters detected" message)
5. Handle parser errors (show error state in tree)
6. Call parser asynchronously to avoid blocking UI
7. Add refresh command to re-parse kubeconfig

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Add cluster data population
- `src/extension.ts` - Register refresh command

## Acceptance Criteria

- [ ] Tree view displays all clusters from kubeconfig
- [ ] Each cluster shows its name and context
- [ ] Current context is properly identified
- [ ] Empty cluster list shows helpful message
- [ ] Parser errors display error state in tree
- [ ] Tree loads asynchronously without blocking UI
- [ ] Refresh command re-reads kubeconfig and updates tree
- [ ] Multiple clusters are all visible

## Dependencies

- create-tree-provider
- implement-kubeconfig-parser

