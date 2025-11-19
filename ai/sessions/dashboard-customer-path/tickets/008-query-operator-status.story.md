---
story_id: query-operator-status
session_id: dashboard-customer-path
feature_id: [operated-dashboard]
spec_id: [free-operated-dashboard-spec]
diagram_id: [dashboard-architecture]
status: pending
priority: high
estimated_minutes: 25
---

## Objective

Create function to query operator status ConfigMap and determine if operator is installed, and if it has an API key configured.

## Context

The Operated Dashboard needs to detect operator presence and API key configuration to determine which conditional content to show. Query the `kube9-operator-status` ConfigMap in `kube9-system` namespace.

## Implementation Steps

1. Create `src/dashboard/OperatorStatusQuery.ts`
2. Implement `getOperatorDashboardStatus(clusterContext): Promise<OperatorStatus>`
3. Query `kubectl get configmap kube9-operator-status -n kube9-system -o json`
4. Parse ConfigMap data.status JSON
5. Extract:
   - mode (operated/enabled/degraded)
   - hasApiKey boolean
   - tier (free/pro)
   - version
   - health
6. Return OperatorStatus object
7. Handle case where ConfigMap doesn't exist (return null/basic status)
8. Use existing OperatorStatusClient if available, or create new query

## Files Affected

- `src/dashboard/OperatorStatusQuery.ts` - Create query function
- `src/dashboard/types.ts` - Define OperatorStatus interface if needed

## Acceptance Criteria

- [ ] Function queries operator status ConfigMap successfully
- [ ] Parses mode, hasApiKey, tier, version, health correctly
- [ ] Returns null or basic status if ConfigMap doesn't exist
- [ ] Uses 5-second timeout for kubectl query
- [ ] Handles JSON parsing errors gracefully
- [ ] Returns structured OperatorStatus object

## Dependencies

- add-free-dashboard-refresh (007) - Can be developed in parallel

