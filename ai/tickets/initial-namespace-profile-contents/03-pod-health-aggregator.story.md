---
story_id: pod-health-aggregator
session_id: initial-namespace-profile-contents
feature_id: [namespace-detail-view]
spec_id: [namespace-workloads-table-spec]
model_id: []
status: completed
priority: high
estimated_minutes: 30
---

## Objective

Implement pod health analysis functions that fetch pods for a workload using label selectors, analyze individual pod health checks, and aggregate health information across all pods in a workload.

## Context

Workload health status is derived from the health of its underlying pods. We need to query pods using the workload's label selector, extract readiness conditions and container statuses from each pod, and aggregate this information to calculate overall workload health.

## Implementation Steps

1. Create new file `src/kubernetes/PodHealthAnalyzer.ts`
2. Import types from `src/types/workloadData.ts`
3. Import Pod types from Kubernetes client or define minimal pod interface
4. Implement `getPodsForWorkload(workload: WorkloadEntry, namespace: string, kubeconfigPath: string, contextName: string): Promise<Pod[]>`
   - Execute `kubectl get pods --namespace=<namespace> --selector=<workload.selector> --output=json`
   - Parse JSON and return array of Pod objects
5. Implement `analyzePodHealth(pod: Pod): PodHealthResult`
   - Extract conditions array from pod.status.conditions
   - Find 'Ready' condition and check if status === 'True'
   - Extract containerStatuses from pod.status.containerStatuses
   - For each container, check if container.ready is true
   - Count containers: ready → passed, waiting/terminated → failed, else → unknown
   - Return object with isReady flag, healthChecks stats, and conditions array
6. Implement `aggregatePodHealth(pods: Pod[]): PodHealthSummary`
   - Count total pods in array
   - Count ready pods using analyzePodHealth results
   - Sum healthChecks.passed/failed/unknown across all pods
   - Aggregate conditions into PodConditionSummary array (group by type:status)
   - Return PodHealthSummary with all aggregated data
7. Add proper error handling for empty pod lists and missing fields

## Files Affected

- `src/kubernetes/PodHealthAnalyzer.ts` - Create new file with 3 analysis functions

## Acceptance Criteria

- [ ] getPodsForWorkload executes kubectl with correct label selector
- [ ] analyzePodHealth correctly identifies pod Ready condition
- [ ] analyzePodHealth counts container health checks (passed/failed/unknown)
- [ ] analyzePodHealth extracts all pod conditions with type and status
- [ ] aggregatePodHealth counts total and ready pods correctly
- [ ] aggregatePodHealth sums health check stats across all pods
- [ ] aggregatePodHealth groups conditions by type:status combination
- [ ] Functions handle edge cases (empty pods, missing fields) gracefully
- [ ] Returns PodHealthSummary matching spec interface
- [ ] Code includes TypeScript type annotations

## Dependencies

- Story 01 (define-workload-types) - Requires PodHealthSummary and related types

