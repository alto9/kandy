---
story_id: health-calculator
session_id: initial-namespace-profile-contents
feature_id: [namespace-detail-view]
spec_id: [namespace-workloads-table-spec]
model_id: []
status: completed
priority: high
estimated_minutes: 25
---

## Objective

Implement the health status calculation algorithm that determines whether a workload is Healthy, Degraded, Unhealthy, or Unknown based on replica counts and pod health check results.

## Context

The health calculation logic is the core of the workloads feature. It must follow the exact algorithm specified in the namespace-workloads-table spec to ensure consistent health reporting. The algorithm considers both replica readiness and pod-level health checks to determine the overall status.

## Implementation Steps

1. Create new file `src/kubernetes/HealthCalculator.ts`
2. Import types from `src/types/workloadData.ts` (HealthStatus, PodHealthSummary)
3. Implement `calculateHealthStatus(readyReplicas: number, desiredReplicas: number, podSummary: PodHealthSummary): HealthStatus`
4. Implement health logic following spec rules:
   - **Healthy**: All replicas ready AND no failed health checks
     - `readyReplicas === desiredReplicas && podSummary.healthChecks.failed === 0 && desiredReplicas > 0`
   - **Unhealthy**: No replicas ready OR all health checks failing
     - `readyReplicas === 0 || (podSummary.healthChecks.passed === 0 && podSummary.healthChecks.failed > 0)`
   - **Degraded**: Some replicas ready OR some health checks failing
     - `(readyReplicas < desiredReplicas && readyReplicas > 0) || (podSummary.healthChecks.failed > 0 && podSummary.healthChecks.passed > 0)`
   - **Unknown**: Unable to determine or desiredReplicas is 0
     - `desiredReplicas === 0 || (podSummary.healthChecks.unknown > 0 && podSummary.healthChecks.passed === 0 && podSummary.healthChecks.failed === 0)`
5. Add JSDoc comments explaining each condition
6. Add unit test cases for each health state scenario
7. Export function for use in workload fetching logic

## Files Affected

- `src/kubernetes/HealthCalculator.ts` - Create new file with calculateHealthStatus function

## Acceptance Criteria

- [ ] Function signature matches spec: (readyReplicas, desiredReplicas, podSummary) → HealthStatus
- [ ] Returns 'Healthy' when all replicas ready and no failed checks
- [ ] Returns 'Unhealthy' when no replicas ready or all checks failing
- [ ] Returns 'Degraded' when some replicas ready or some checks failing
- [ ] Returns 'Unknown' when replicas are 0 or only unknown health checks exist
- [ ] Logic exactly matches algorithm from namespace-workloads-table spec
- [ ] Edge cases handled: 0 desired replicas, no health check data
- [ ] JSDoc comments explain each condition clearly
- [ ] Function is pure (no side effects)
- [ ] TypeScript types are properly annotated

## Dependencies

- Story 01 (define-workload-types) - Requires HealthStatus and PodHealthSummary types

