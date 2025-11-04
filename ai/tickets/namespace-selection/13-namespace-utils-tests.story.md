---
story_id: namespace-utils-tests
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: [namespace-selection-state]
status: completed
priority: medium
estimated_minutes: 30
---

# Unit Tests for kubectl Context Utilities

## Objective

Create comprehensive unit tests for kubectl context reading and writing utilities.

## Context

The namespace selection utilities are critical infrastructure that directly execute kubectl commands. We need thorough unit tests to ensure correct behavior, error handling, and edge cases are covered.

## Implementation Steps

1. Create test file `tests/unit/kubectlContext.test.ts`
2. Mock child_process exec/spawn functions
3. Write tests for `getCurrentNamespace()`:
   - Returns namespace when set in context
   - Returns null when no namespace set
   - Handles kubectl command failures
   - Handles empty/malformed output
4. Write tests for `getContextInfo()`:
   - Returns complete context state
   - Parses JSON correctly
   - Handles missing fields gracefully
5. Write tests for `setNamespace()`:
   - Successfully sets namespace
   - Validates namespace parameter
   - Returns appropriate status
6. Write tests for `clearNamespace()`:
   - Successfully clears namespace
   - Returns appropriate status
7. Ensure all tests use proper mocking and don't execute real kubectl commands

## Files Affected

- `tests/unit/kubectlContext.test.ts` - New test file

## Acceptance Criteria

- [ ] All utility functions have unit tests
- [ ] Tests cover success cases
- [ ] Tests cover error cases
- [ ] Tests cover edge cases (empty input, malformed data)
- [ ] Tests use proper mocking
- [ ] All tests pass
- [ ] Test coverage > 90% for utilities

## Dependencies

- kubectl-context-reader
- kubectl-context-writer

