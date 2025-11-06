---
story_id: workload-fetch-message-handler
session_id: initial-namespace-profile-contents
feature_id: [namespace-detail-view]
spec_id: [namespace-workloads-table-spec]
model_id: []
status: pending
priority: high
estimated_minutes: 30
---

## Objective

Add a message handler to NamespaceWebview.ts that responds to fetchWorkloads requests from the webview by fetching workload data, calculating health status, and sending results back to the webview.

## Context

The webview JavaScript sends fetchWorkloads messages when pills are clicked. The extension needs to handle these messages by calling the appropriate kubectl functions, fetching pod health data, calculating health status for each workload, and returning the complete WorkloadsTableData to the webview.

## Implementation Steps

1. Open `src/webview/NamespaceWebview.ts`
2. Import WorkloadCommands functions from `src/kubectl/WorkloadCommands.ts`
3. Import PodHealthAnalyzer functions from `src/kubernetes/PodHealthAnalyzer.ts`
4. Import calculateHealthStatus from `src/kubernetes/HealthCalculator.ts`
5. Import WorkloadsTableData type from `src/types/workloadData.ts`
6. Add 'fetchWorkloads' case to the onDidReceiveMessage switch statement
7. Implement fetchWorkloads handler:
   - Extract workloadType from message.data.workloadType
   - Get namespace from panel's namespaceContext
   - Call appropriate WorkloadCommands function based on workloadType
   - For each workload in results:
     - Call getPodsForWorkload to fetch pods
     - Call aggregatePodHealth to analyze pod health
     - Call calculateHealthStatus to determine health status
     - Build WorkloadEntry with health information
   - Construct WorkloadsTableData object with workloads array, namespace, workloadType, lastUpdated
   - Send message back to webview: `{ command: 'workloadsData', data: workloadsTableData }`
8. Add error handling for kubectl failures and pod fetch errors
9. Handle null namespace (All Namespaces view) by passing null to kubectl commands
10. Optimize by batching pod fetches if possible

## Files Affected

- `src/webview/NamespaceWebview.ts` - Add fetchWorkloads message handler in onDidReceiveMessage

## Acceptance Criteria

- [ ] fetchWorkloads message handler is added to switch statement
- [ ] Handler extracts workloadType from message data
- [ ] Handler calls correct WorkloadCommands function based on type
- [ ] Handler fetches pods for each workload using getPodsForWorkload
- [ ] Handler calculates health for each workload using aggregatePodHealth
- [ ] Handler determines health status using calculateHealthStatus
- [ ] Handler constructs complete WorkloadsTableData object
- [ ] Handler sends workloadsData message back to webview
- [ ] Error handling wraps kubectl failures gracefully
- [ ] Errors are logged and sent to webview in data.error field
- [ ] Null namespace is handled for All Namespaces view
- [ ] Message handler is async and uses proper Promise handling

## Dependencies

- Story 01 (define-workload-types) - Requires type definitions
- Story 02 (kubectl-workload-fetchers) - Requires WorkloadCommands functions
- Story 03 (pod-health-aggregator) - Requires PodHealthAnalyzer functions
- Story 04 (health-calculator) - Requires calculateHealthStatus function

