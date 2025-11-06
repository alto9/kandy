---
story_id: kubectl-workload-fetchers
session_id: initial-namespace-profile-contents
feature_id: [namespace-detail-view]
spec_id: [namespace-workloads-table-spec]
model_id: [namespace-selection-state]
status: completed
priority: high
estimated_minutes: 30
---

## Objective

Create kubectl command wrapper functions to fetch all four workload types (Deployments, StatefulSets, DaemonSets, CronJobs) from Kubernetes clusters with proper error handling and JSON parsing.

## Context

The workloads table needs to fetch different types of Kubernetes workload resources. Each workload type requires a separate kubectl command with appropriate resource type and output format. These functions will extract essential information like replica counts and label selectors needed for health calculations.

## Implementation Steps

1. Create new file `src/kubectl/WorkloadCommands.ts`
2. Import necessary types from `src/types/workloadData.ts`
3. Implement `getDeployments(namespace: string, kubeconfigPath: string, contextName: string): Promise<WorkloadEntry[]>`
   - Execute `kubectl get deployments --namespace=<namespace> --output=json`
   - Handle --all-namespaces flag when namespace is null
   - Parse JSON response and extract: name, namespace, spec.replicas, status.readyReplicas, spec.selector
4. Implement `getStatefulSets(namespace: string, kubeconfigPath: string, contextName: string): Promise<WorkloadEntry[]>`
   - Execute `kubectl get statefulsets --namespace=<namespace> --output=json`
   - Parse response similar to deployments
5. Implement `getDaemonSets(namespace: string, kubeconfigPath: string, contextName: string): Promise<WorkloadEntry[]>`
   - Execute `kubectl get daemonsets --namespace=<namespace> --output=json`
   - Extract numberReady and desiredNumberScheduled for replica counts
6. Implement `getCronJobs(namespace: string, kubeconfigPath: string, contextName: string): Promise<WorkloadEntry[]>`
   - Execute `kubectl get cronjobs --namespace=<namespace> --output=json`
   - CronJobs don't have replica counts - set both to 0
7. Add error handling for kubectl command failures
8. Convert label selector objects to strings (e.g., "app=nginx,version=v1")
9. Extract creationTimestamp from metadata

## Files Affected

- `src/kubectl/WorkloadCommands.ts` - Create new file with 4 fetch functions

## Acceptance Criteria

- [ ] getDeployments function executes correct kubectl command
- [ ] getStatefulSets function executes correct kubectl command
- [ ] getDaemonSets function executes correct kubectl command
- [ ] getCronJobs function executes correct kubectl command
- [ ] All functions handle --all-namespaces flag when namespace is null
- [ ] JSON parsing extracts name, namespace, and replica counts correctly
- [ ] Label selectors are converted to string format for pod queries
- [ ] CreationTimestamp is extracted from metadata
- [ ] Error handling wraps kubectl failures with meaningful messages
- [ ] Functions return WorkloadEntry arrays (health field can be null/undefined initially)
- [ ] Code follows existing kubectl command patterns in codebase

## Dependencies

- Story 01 (define-workload-types) - Requires WorkloadEntry type definition

