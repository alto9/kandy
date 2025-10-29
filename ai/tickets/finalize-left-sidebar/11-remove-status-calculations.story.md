---
story_id: remove-status-calculations
session_id: finalize-left-sidebar
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: []
status: pending
priority: low
estimated_minutes: 15
---

## Objective
Remove resource status calculation logic (ready/pending/failed) since resources are no longer shown in tree view.

## Context
With the simplified tree structure, we only need cluster connection status, not detailed resource status indicators.

## Implementation Steps
1. Remove resource health status calculation functions
2. Remove resource usage monitoring code
3. Keep only cluster connectivity status (connected/disconnected)
4. Remove status-related icons and indicators for resources
5. Clean up any event monitoring code for resource status changes

## Files Affected
- Status calculation utilities
- Resource health monitoring code
- Status indicator display logic

## Acceptance Criteria
- [ ] Resource status calculation code is removed
- [ ] Resource usage monitoring is removed
- [ ] Only cluster connectivity status remains
- [ ] Status icons for resources are removed
- [ ] No compilation errors from removed status code

## Dependencies
- simplify-tree-structure
- remove-watch-logic

