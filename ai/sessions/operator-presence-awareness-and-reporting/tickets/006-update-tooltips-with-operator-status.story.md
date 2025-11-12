---
story_id: update-tooltips-with-operator-status
session_id: operator-presence-awareness-and-reporting
feature_id: [operator-presence-awareness]
spec_id: [operator-status-api-spec]
status: pending
priority: medium
estimated_minutes: 20
---

## Objective

Update cluster tree item tooltips to display operator status information including mode, tier, version, health, and error messages.

## Context

When users hover over cluster tree items, they should see detailed operator status information. The tooltip should follow the format specified in the operator-status-api-spec.

## Implementation Steps

1. Open `src/tree/ClusterTreeProvider.ts`
2. Create private method `buildOperatorStatusTooltip(item: ClusterTreeItem): string`:
   - Start with cluster name and connection status (existing tooltip base)
   - If operatorStatus is defined, add operator status section:
     - "Operator Status: <mode>" (basic/operated/enabled/degraded)
     - "Tier: <tier>" (if available from operatorStatusDetails)
     - "Version: <version>" (if available)
     - "Health: <health>" (if available)
     - "Last Update: <timestamp>" (if available, formatted nicely)
     - "Error: <error-message>" (if degraded/unhealthy and error exists)
   - Format tooltip with proper line breaks
3. Update `updateTreeItemAppearance()` method to call `buildOperatorStatusTooltip()` and set item.tooltip
4. Ensure tooltip includes both connectivity status and operator status when both are available
5. Format timestamps in a human-readable format (e.g., "2 minutes ago" or ISO date)

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Add tooltip building logic with operator status

## Acceptance Criteria

- [ ] Tooltip displays operator status mode (basic/operated/enabled/degraded)
- [ ] Tooltip displays tier information when available
- [ ] Tooltip displays version when available
- [ ] Tooltip displays health status when available
- [ ] Tooltip displays last update timestamp when available
- [ ] Tooltip displays error messages when status is degraded/unhealthy
- [ ] Tooltip maintains existing connectivity status information
- [ ] Tooltip formatting is clean and readable
- [ ] Timestamps are formatted in a human-readable way

## Dependencies

- 003-create-operator-status-types (needs OperatorStatus interface)
- 004-integrate-status-check-on-connection (needs operatorStatusDetails to be set)

