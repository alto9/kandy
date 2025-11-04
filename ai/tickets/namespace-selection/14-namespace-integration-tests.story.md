---
story_id: namespace-integration-tests
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
model_id: [namespace-selection-state]
status: completed
priority: low
estimated_minutes: 30
---

# Integration Tests for Namespace Selection Flow

## Objective

Create end-to-end integration tests for the complete namespace selection workflow across tree view and webview.

## Context

We need integration tests to verify that the complete namespace selection flow works correctly from user interaction through kubectl context changes to UI updates. These tests ensure all components work together properly.

## Implementation Steps

1. Create test file `tests/integration/namespaceSelection.test.ts`
2. Set up test environment with mock kubectl context
3. Write integration tests for tree view flow:
   - Right-click namespace in tree, set as active
   - Verify kubectl context updated
   - Verify tree view shows checkmark indicator
   - Verify status bar updates
4. Write integration tests for webview flow:
   - Select namespace from dropdown
   - Verify kubectl context updated
   - Verify webview refreshes resources
   - Verify notification appears for external changes
5. Write integration tests for external changes:
   - Simulate external kubectl context change
   - Verify tree view updates
   - Verify webview updates
   - Verify notification appears
6. Write tests for cache behavior:
   - Verify cache reduces kubectl calls
   - Verify cache expires correctly
   - Verify manual cache invalidation

## Files Affected

- `tests/integration/namespaceSelection.test.ts` - New integration test file

## Acceptance Criteria

- [ ] Tree view namespace selection flow is tested end-to-end
- [ ] Webview namespace selection flow is tested end-to-end
- [ ] External context change detection is tested
- [ ] Cache behavior is verified
- [ ] Tests use realistic kubectl mocks
- [ ] All tests pass
- [ ] Tests run in reasonable time (< 10 seconds total)

## Dependencies

- All previous stories (this tests the complete feature)

