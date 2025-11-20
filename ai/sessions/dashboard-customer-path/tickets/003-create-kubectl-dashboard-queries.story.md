---
story_id: create-kubectl-dashboard-queries
session_id: dashboard-customer-path
feature_id: [free-dashboard]
spec_id: [free-nonoperated-dashboard-spec]
diagram_id: [dashboard-architecture]
status: pending
priority: high
estimated_minutes: 30
---

## Objective

Create utility functions for querying kubectl to gather Free Dashboard statistics (namespace count, workload counts, node info).

## Context

The Free Dashboard queries the cluster directly using kubectl. We need reusable functions to fetch namespacecount, workload counts by type (deployments, statefulsets, daemonsets, pods, etc.), and node health information.

## Implementation Steps

1. Create `src/dashboard/DashboardDataProvider.ts`
2. Implement `getNamespaceCount(clusterContext: string): Promise<number>`
   - Use existing NamespaceCommands pattern
   - Execute `kubectl get namespaces --output=json`
   - Parse and return items.length
3. Implement `getWorkloadCounts(clusterContext: string): Promise<WorkloadCounts>`
   - Query deployments, statefulsets, daemonsets, replicasets, jobs, cronjobs, pods
   - Use Promise.all() to execute queries in parallel
   - Return counts object with all workload types
4. Implement `getNodeInfo(clusterContext: string): Promise<NodeInfo>`
   - Use existing NodeCommands pattern
   - Parse node ready/not-ready status
   - Calculate total CPU and memory capacity
5. Add timeout handling (5 seconds) for all queries
6. Handle errors gracefully (return 0 or default values on failure)

## Files Affected

- `src/dashboard/DashboardDataProvider.ts` - Create new data provider class
- `src/dashboard/types.ts` - Define WorkloadCounts and NodeInfo interfaces

## Acceptance Criteria

- [ ] getNamespaceCount() returns accurate namespace count
- [ ] getWorkloadCounts() returns counts for all 7 workload types
- [ ] getNodeInfo() returns node health and capacity data
- [ ] All queries execute in parallel for performance
- [ ] Queries timeout after 5 seconds
- [ ] Errors return default values instead of crashing
- [ ] Functions follow existing kubectl command patterns

## Dependencies

- register-dashboard-command (002)

