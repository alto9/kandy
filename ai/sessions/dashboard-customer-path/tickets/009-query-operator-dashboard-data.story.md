---
story_id: query-operator-dashboard-data
session_id: dashboard-customer-path
feature_id: [operated-dashboard]
spec_id: [free-operated-dashboard-spec]
diagram_id: [dashboard-architecture]
status: pending
priority: high
estimated_minutes: 25
---

## Objective

Create function to query operator-provided dashboard data from the `kube9-dashboard-data` ConfigMap.

## Context

When the operator is installed, dashboard statistics come from operator-managed ConfigMaps rather than direct kubectl queries. This provides aggregated and potentially cached data.

## Implementation Steps

1. Update `src/dashboard/DashboardDataProvider.ts`
2. Implement `getOperatorDashboardData(clusterContext): Promise<OperatorDashboardData>`
3. Query `kubectl get configmap kube9-dashboard-data -n kube9-system -o json`
4. Parse ConfigMap data.dashboard JSON
5. Extract:
   - namespaceCount
   - workloads (all 7 types)
   - nodes (totalNodes, readyNodes, cpuCapacity, memoryCapacity)
   - operatorMetrics (collectorsRunning, dataPointsCollected, lastCollectionTime)
6. Return structured data object
7. Handle case where ConfigMap doesn't exist (fallback or error)

## Files Affected

- `src/dashboard/DashboardDataProvider.ts` - Add operator data query
- `src/dashboard/types.ts` - Define OperatorDashboardData interface

## Acceptance Criteria

- [ ] Function queries operator dashboard data ConfigMap
- [ ] Parses namespace, workload, node, and operator metrics
- [ ] Returns structured OperatorDashboardData object
- [ ] Uses 5-second timeout
- [ ] Handles missing ConfigMap gracefully
- [ ] Handles JSON parsing errors

## Dependencies

- query-operator-status (008)

