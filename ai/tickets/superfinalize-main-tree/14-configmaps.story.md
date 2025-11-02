---
story_id: configmaps
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: completed
priority: medium
estimated_minutes: 20
---

# ConfigMaps Implementation

## Objective

Implement the ConfigMaps subcategory to list all configmaps across all namespaces with placeholder click handlers.

## Context

ConfigMaps store configuration data as key-value pairs. Users need to see all configmaps in the cluster. At this stage, clicking a configmap should not perform any action.

## Implementation Steps

1. Add logic to fetch configmaps using `kubectl get configmaps --all-namespaces --output=json`
2. Parse configmaps and create tree items with namespace information
3. Display number of data keys in the configmap
4. Show namespace context in the tree item label
5. Implement placeholder click handler (no-op)

## Files Affected

- `src/tree/categories/configuration/ConfigMapsSubcategory.ts` - New file for configmap logic
- `src/kubectl/ConfigurationCommands.ts` - New file for configuration kubectl operations

## Acceptance Criteria

- [ ] Expanding ConfigMaps shows all configmaps across all namespaces
- [ ] ConfigMap names include namespace context (e.g., "default/app-config")
- [ ] Number of data keys is displayed (e.g., "5 keys")
- [ ] Clicking a configmap performs no action (placeholder)
- [ ] kubectl errors are handled gracefully

## Dependencies

- configuration-category-structure

