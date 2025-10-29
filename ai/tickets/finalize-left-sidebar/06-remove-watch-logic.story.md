---
story_id: remove-watch-logic
session_id: finalize-left-sidebar
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: []
status: pending
priority: medium
estimated_minutes: 20
---

## Objective
Remove automatic watch/refresh logic and Kubernetes API watch event handling from the tree provider.

## Context
The tree view should no longer automatically update based on cluster changes. All updates should be triggered manually by the user.

## Implementation Steps
1. Locate and remove any Kubernetes watch API usage
2. Remove automatic polling or background update timers
3. Remove event handlers for resource update events
4. Clean up any watch-related data structures or connections
5. Ensure tree provider only updates on explicit refresh calls

## Files Affected
- Tree data provider watch implementation
- Event handler registration
- Background update timers

## Acceptance Criteria
- [ ] No Kubernetes watch APIs are called
- [ ] No automatic polling or timers exist
- [ ] Tree view does not update automatically when cluster changes
- [ ] Resource update event handlers are removed
- [ ] Watch connections are properly disposed

## Dependencies
- kubectl-cluster-connectivity

