---
story_id: kubectl-cluster-connectivity
session_id: finalize-left-sidebar
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: []
status: pending
priority: high
estimated_minutes: 25
---

## Objective
Update the tree data provider to use kubectl commands for cluster connectivity verification instead of Kubernetes API.

## Context
The tree view is being simplified to use kubectl commands rather than direct Kubernetes API access. This story implements the cluster connectivity check using `kubectl cluster-info`.

## Implementation Steps
1. Locate the tree data provider implementation
2. Replace any Kubernetes API connectivity checks with kubectl command execution
3. Implement `kubectl cluster-info` command execution to verify cluster accessibility
4. Update cluster status indicators to show "connected" or "disconnected" based on kubectl result
5. Ensure kubectl errors are captured and handled gracefully

## Files Affected
- Tree data provider (likely in `src/` or `extension/` directory)
- Any Kubernetes API client initialization code

## Acceptance Criteria
- [ ] Tree provider uses `kubectl cluster-info` to check cluster connectivity
- [ ] Cluster status shows "connected" when kubectl succeeds
- [ ] Cluster status shows "disconnected" when kubectl fails
- [ ] No Kubernetes API calls are made for connectivity checks
- [ ] kubectl errors are captured and don't crash the extension

## Dependencies
- None

