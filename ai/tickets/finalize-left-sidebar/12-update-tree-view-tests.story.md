---
story_id: update-tree-view-tests
session_id: finalize-left-sidebar
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: []
status: completed
priority: medium
estimated_minutes: 30
---

## Objective
Update tree view tests to reflect the new 2-level structure and kubectl-based approach.

## Context
Existing tests likely cover the deep hierarchy and Kubernetes API interactions. These need to be updated or replaced to test the simplified tree structure and kubectl commands.

## Implementation Steps
1. Update tree provider tests to expect 2-level structure only
2. Update or remove tests for resource type and resource items
3. Add tests for kubectl command execution
4. Add tests for "All Namespaces" special item
5. Add tests for namespace click opening webview
6. Update tests for manual refresh behavior
7. Add tests for kubectl error handling

## Files Affected
- Tree provider test files
- Tree item test files
- kubectl execution test files

## Acceptance Criteria
- [ ] Tests verify 2-level tree structure
- [ ] Tests verify kubectl commands are used
- [ ] Tests verify "All Namespaces" appears first
- [ ] Tests verify namespace clicks open webviews
- [ ] Tests verify manual refresh behavior
- [ ] Tests verify kubectl error handling
- [ ] All tests pass

## Dependencies
- All previous implementation stories should be completed first

