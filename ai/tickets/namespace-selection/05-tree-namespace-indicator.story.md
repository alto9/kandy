---
story_id: tree-namespace-indicator
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: [namespace-selection-state]
status: completed
priority: high
estimated_minutes: 25
---

# Active Namespace Indicator in Tree View

## Objective

Add visual checkmark indicator to show which namespace is currently active in kubectl context within the tree view.

## Context

Users need clear visual feedback about which namespace is set as active in kubectl. The tree view should display a checkmark icon next to the active namespace and update when the context changes.

## Implementation Steps

1. Update TreeItem interface to include `isActiveNamespace: boolean` property
2. Modify tree item creation logic to:
   - Call `getCurrentNamespace()` to get active namespace
   - Set `isActiveNamespace: true` for matching namespace items
   - Set appropriate icon based on isActiveNamespace flag
3. Use VS Code's built-in "check" icon for active indicator
4. Update `contextValue` to include namespace state (for context menu conditions)
5. Ensure tree refreshes when namespace context changes

## Files Affected

- `src/providers/treeViewProvider.ts` - Update tree item creation
- `src/types/treeItem.ts` - Add isActiveNamespace property

## Acceptance Criteria

- [ ] Active namespace shows checkmark icon in tree view
- [ ] Inactive namespaces show no checkmark
- [ ] Only one namespace shows checkmark at a time
- [ ] Tree updates when context changes
- [ ] contextValue includes namespace state for menu conditions

## Dependencies

- kubectl-context-reader
- namespace-cache-implementation

