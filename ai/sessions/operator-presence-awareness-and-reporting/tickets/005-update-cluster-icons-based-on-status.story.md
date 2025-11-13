---
story_id: update-cluster-icons-based-on-status
session_id: operator-presence-awareness-and-reporting
feature_id: [operator-presence-awareness]
spec_id: [operator-status-api-spec]
status: completed
priority: high
estimated_minutes: 20
---

## Objective

Update `updateTreeItemAppearance()` method in `ClusterTreeProvider` to display different icons based on operator status mode.

## Context

The cluster tree items should display different icons based on operator status (basic, operated, enabled, degraded) as specified in the operator-status-api-spec. The icon should reflect operator status, not just connectivity status.

## Implementation Steps

1. Open `src/tree/ClusterTreeProvider.ts`
2. Modify `updateTreeItemAppearance()` method signature to accept optional `operatorStatus?: OperatorStatusMode` parameter
3. Update icon selection logic:
   - If operatorStatus is defined, use operator status icons:
     - `basic`: `circle-outline` (default color)
     - `operated`: `shield` (default color)
     - `enabled`: `verified` with `testing.iconPassed` color
     - `degraded`: `warning` with `editorWarning.foreground` color
   - If operatorStatus is undefined, fall back to existing connectivity-based icons
4. Import `OperatorStatusMode` from `../kubernetes/OperatorStatusTypes`
5. Import `vscode.ThemeIcon` if not already imported
6. Update all calls to `updateTreeItemAppearance()` to pass operatorStatus parameter
7. Ensure icon selection prioritizes operator status over connectivity status when operator status is available

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Update updateTreeItemAppearance() method

## Acceptance Criteria

- [ ] Icons display correctly for basic status (circle-outline)
- [ ] Icons display correctly for operated status (shield)
- [ ] Icons display correctly for enabled status (verified with green color)
- [ ] Icons display correctly for degraded status (warning with warning color)
- [ ] Icons fall back to connectivity-based icons when operator status is undefined
- [ ] Icon selection logic is clear and maintainable
- [ ] All calls to updateTreeItemAppearance() pass operatorStatus parameter

## Dependencies

- 003-create-operator-status-types (needs OperatorStatusMode enum)
- 004-integrate-status-check-on-connection (needs operatorStatus to be set on items)

