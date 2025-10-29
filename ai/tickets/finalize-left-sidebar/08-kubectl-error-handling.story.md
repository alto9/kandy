---
story_id: kubectl-error-handling
session_id: finalize-left-sidebar
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: []
status: pending
priority: medium
estimated_minutes: 25
---

## Objective
Implement robust error handling for kubectl command failures with clear error messages and graceful degradation.

## Context
When kubectl commands fail (connection issues, missing kubectl binary, permission errors), the extension should handle these gracefully without crashing and provide clear feedback to users.

## Implementation Steps
1. Create kubectl error handling utility
2. Distinguish between different error types (connection, permission, binary not found)
3. Display appropriate error messages to users for each error type
4. Update cluster status to "disconnected" when kubectl fails
5. Ensure extension doesn't crash or continuously retry on failure

## Files Affected
- kubectl command execution utility
- Error message display logic
- Tree provider error handling

## Acceptance Criteria
- [ ] kubectl binary not found shows clear "kubectl not installed" message
- [ ] Connection failures show "Cannot connect to cluster" message
- [ ] Permission errors show appropriate access denied message
- [ ] Cluster status correctly shows "disconnected" on failures
- [ ] Extension does not crash on kubectl errors
- [ ] No automatic retry attempts after failures

## Dependencies
- kubectl-cluster-connectivity
- kubectl-namespace-query

