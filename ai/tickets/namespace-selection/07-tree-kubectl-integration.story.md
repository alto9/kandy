---
story_id: tree-kubectl-integration
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: [namespace-selection-state]
status: completed
priority: medium
estimated_minutes: 20
---

# Tree View kubectl Context Integration

## Objective

Integrate namespace context state into tree view data provider to automatically refresh when context changes.

## Context

The tree view needs to stay synchronized with kubectl context state. When the namespace changes (either through our extension or externally), the tree should automatically update to reflect the new active namespace.

## Implementation Steps

1. Add namespace context watcher to tree view provider
2. Subscribe to context change events from NamespaceContextWatcher
3. Trigger tree refresh when context changes
4. Update tree item data with current namespace state on each refresh
5. Handle external context changes gracefully
6. Clean up watchers on extension deactivation

## Files Affected

- `src/providers/treeViewProvider.ts` - Add watcher subscription and refresh logic
- `src/extension.ts` - Initialize watcher and clean up on deactivation

## Acceptance Criteria

- [ ] Tree view automatically refreshes when context changes
- [ ] External kubectl context changes are detected and reflected
- [ ] Tree shows correct active namespace indicator after changes
- [ ] Watchers are properly cleaned up on extension deactivation
- [ ] No memory leaks from event subscriptions

## Dependencies

- namespace-cache-implementation
- tree-namespace-indicator

