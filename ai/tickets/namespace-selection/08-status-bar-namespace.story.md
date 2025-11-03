---
story_id: status-bar-namespace
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: [namespace-selection-state]
status: pending
priority: medium
estimated_minutes: 20
---

# Status Bar Namespace Indicator

## Objective

Add a status bar item that displays the currently active namespace or "All" if no namespace is set.

## Context

Users need a persistent visual indicator of the active namespace that's always visible. The status bar provides this at-a-glance information without requiring the tree view to be open.

## Implementation Steps

1. Create status bar item in extension activation
2. Set initial text based on current namespace context
3. Subscribe to namespace context change events
4. Update status bar text when context changes:
   - Show "Namespace: <namespace-name>" when namespace is set
   - Show "Namespace: All" when no namespace is set
5. Add tooltip with additional context information
6. Position status bar item appropriately (left side, priority 100)
7. Show/hide based on kubectl availability

## Files Affected

- `src/ui/statusBar.ts` - New file with status bar management
- `src/extension.ts` - Create and initialize status bar item

## Acceptance Criteria

- [ ] Status bar displays current namespace name when set
- [ ] Status bar displays "All" when no namespace is set
- [ ] Status bar updates automatically when context changes
- [ ] Tooltip shows helpful context information
- [ ] Status bar item is properly positioned and visible
- [ ] Status bar hides if kubectl is not available

## Dependencies

- namespace-cache-implementation
- tree-kubectl-integration

