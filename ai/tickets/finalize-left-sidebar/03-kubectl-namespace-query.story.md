---
story_id: kubectl-namespace-query
session_id: finalize-left-sidebar
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: []
status: pending
priority: high
estimated_minutes: 25
---

## Objective
Implement namespace querying using kubectl commands instead of Kubernetes API.

## Context
The tree view needs to list namespaces when a cluster is expanded. This should use `kubectl get namespaces --output=json` rather than direct API calls.

## Implementation Steps
1. Implement kubectl command execution for `kubectl get namespaces --output=json`
2. Parse the JSON output to extract namespace names
3. Sort namespaces alphabetically
4. Return namespace list to tree provider
5. Handle kubectl errors gracefully (e.g., connection failures, permission issues)

## Files Affected
- Tree data provider namespace query logic
- kubectl command execution utility

## Acceptance Criteria
- [ ] Namespaces are queried using kubectl command
- [ ] JSON output is correctly parsed
- [ ] Namespaces are sorted alphabetically
- [ ] kubectl errors are handled without crashing
- [ ] Error messages are clear when namespace listing fails

## Dependencies
- kubectl-cluster-connectivity

