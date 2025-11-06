---
story_id: define-workload-types
session_id: initial-namespace-profile-contents
feature_id: [namespace-detail-view]
spec_id: [namespace-workloads-table-spec]
model_id: [namespace-selection-state]
status: completed
priority: high
estimated_minutes: 20
---

## Objective

Create TypeScript type definitions for workload data structures including WorkloadEntry, WorkloadHealth, PodHealthSummary, and related interfaces needed throughout the workloads feature.

## Context

The namespace workloads table requires strongly-typed data structures to represent different workload types (Deployments, StatefulSets, DaemonSets, CronJobs) and their health information. These types will be shared between the extension backend and webview frontend, ensuring type safety across the codebase.

## Implementation Steps

1. Create new file `src/types/workloadData.ts`
2. Define `WorkloadType` union type with 4 values: 'Deployment', 'StatefulSet', 'DaemonSet', 'CronJob'
3. Define `HealthStatus` type with values: 'Healthy', 'Degraded', 'Unhealthy', 'Unknown'
4. Define `HealthCheckStats` interface with passed, failed, and unknown counts
5. Define `PodConditionSummary` interface with type, status, and count fields
6. Define `PodHealthSummary` interface containing totalPods, readyPods, healthChecks, and conditions
7. Define `WorkloadHealth` interface with status, podStatus, and lastChecked fields
8. Define `WorkloadEntry` interface with name, namespace, health, readyReplicas, desiredReplicas, selector, and creationTimestamp
9. Define `PillSelectorState` interface with selectedType and availableTypes
10. Define `WorkloadsTableData` interface with workloads array, lastUpdated, namespace, workloadType, and optional error
11. Export all interfaces and types

## Files Affected

- `src/types/workloadData.ts` - Create new file with all workload-related type definitions

## Acceptance Criteria

- [ ] WorkloadType union type includes all 4 workload types
- [ ] HealthStatus type includes all 4 health states
- [ ] HealthCheckStats interface tracks passed/failed/unknown counts
- [ ] PodConditionSummary interface captures pod condition aggregations
- [ ] PodHealthSummary interface contains complete pod health information
- [ ] WorkloadHealth interface includes status, pod summary, and timestamp
- [ ] WorkloadEntry interface contains all fields from spec (name, namespace, health, replicas, selector, timestamp)
- [ ] WorkloadsTableData interface wraps complete table state
- [ ] All types are properly exported for use in other modules
- [ ] TypeScript compiles without errors

## Dependencies

None - This is a foundational story that other stories depend on.

