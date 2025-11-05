---
story_id: update-e2e-tests
session_id: namespace-profile-selection-behavior
feature_id: [tree-view-navigation]
spec_id: [webview-spec, tree-view-spec]
model_id: [namespace-selection-state]
status: completed
priority: medium
estimated_minutes: 30
---

# Update E2E Tests for New Namespace Button UI

## Objective
Update end-to-end tests to validate the complete workflow of the new button-based namespace selection interface, from tree view clicks to button interactions and external context changes.

## Context
E2E tests need to verify the full user journey with the new UI, ensuring that clicking namespaces in the tree view opens webviews with the correct title and button state, and that button clicks properly update the namespace context.

## Implementation Steps
1. Locate E2E test files for tree view navigation and webview interactions
2. Remove or update tests that reference dropdown-based namespace selection
3. Add test: "Opening namespace webview shows namespace name as title"
   - Click namespace in tree view
   - Verify webview opens with namespace name as h1 title
   - Verify no dropdown exists
4. Add test: "Webview button enabled for non-active namespace"
   - Set "staging" as active namespace
   - Open "production" namespace webview
   - Verify button is enabled and shows "Set as Default Namespace"
   - Verify no checkmark icon is visible
5. Add test: "Webview button disabled for active namespace"
   - Set "production" as active namespace
   - Open "production" namespace webview
   - Verify button is disabled and shows "Default Namespace"
   - Verify checkmark icon is visible
6. Add test: "Setting namespace as default from webview button"
   - Open non-active namespace webview
   - Click "Set as Default Namespace" button
   - Verify kubectl context updates
   - Verify button changes to disabled state
   - Verify tree view shows checkmark on namespace
7. Add test: "Button state updates when context changes externally"
   - Open webview for namespace A
   - Change context to namespace A using kubectl CLI simulation
   - Verify button updates to disabled state
   - Verify notification displays
8. Add test: "Multiple webviews show correct button states"
   - Set "production" as active
   - Open both "production" and "staging" webviews
   - Verify correct states in both
   - Click button in "staging" webview
   - Verify both webviews update states correctly

## Files Affected
- E2E test files (e.g., `src/test/e2e/*.test.ts`, `test/integration/*.spec.ts`)

## Acceptance Criteria
- [ ] Test for namespace title display passes
- [ ] Test for button enabled state (non-active namespace) passes
- [ ] Test for button disabled state (active namespace) passes
- [ ] Test for button click setting namespace passes
- [ ] Test for external context changes updating button passes
- [ ] Test for multiple webviews with different states passes
- [ ] All E2E tests pass successfully
- [ ] Tests cover the scenarios listed in tree-view-navigation.feature.md

## Dependencies
- story_id: update-message-interfaces
- story_id: update-webview-html-structure
- story_id: implement-button-state-logic
- story_id: update-extension-message-handler
- story_id: update-webview-css-styling
- story_id: handle-external-context-changes

