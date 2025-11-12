---
story_id: create-operator-status-types
session_id: operator-presence-awareness-and-reporting
feature_id: [operator-presence-awareness]
spec_id: [operator-status-api-spec]
status: completed
priority: medium
estimated_minutes: 15
---

## Objective

Create TypeScript types and enums for operator status tracking, and extend `ClusterTreeItem` to store operator status.

## Context

The extension needs to track operator status separately from cluster connectivity status. We need a new enum for operator status modes (basic, operated, enabled, degraded) and extend ClusterTreeItem to store this information.

## Implementation Steps

1. Create `src/kubernetes/OperatorStatusTypes.ts` file
2. Define `OperatorStatusMode` enum with values: `Basic`, `Operated`, `Enabled`, `Degraded`
3. Define `OperatorStatus` interface matching the spec:
   ```typescript
   interface OperatorStatus {
     mode: "operated" | "enabled";
     tier: "free" | "pro";
     version: string;
     health: "healthy" | "degraded" | "unhealthy";
     lastUpdate: string;
     registered: boolean;
     error: string | null;
     clusterId?: string;
   }
   ```
4. Export types for use in other modules
5. Open `src/tree/ClusterTreeItem.ts`
6. Add optional `operatorStatus?: OperatorStatusMode` property to ClusterTreeItem class
7. Add optional `operatorStatusDetails?: OperatorStatus` property to store full status details for tooltip
8. Import OperatorStatusMode and OperatorStatus types

## Files Affected

- `src/kubernetes/OperatorStatusTypes.ts` - Create new file with types and enum
- `src/tree/ClusterTreeItem.ts` - Add operatorStatus and operatorStatusDetails properties

## Acceptance Criteria

- [ ] OperatorStatusMode enum created with Basic, Operated, Enabled, Degraded values
- [ ] OperatorStatus interface matches spec exactly
- [ ] ClusterTreeItem has operatorStatus property
- [ ] ClusterTreeItem has operatorStatusDetails property
- [ ] Types are properly exported and can be imported elsewhere
- [ ] Code follows existing project patterns

## Dependencies

- None (can be done in parallel with other stories)

