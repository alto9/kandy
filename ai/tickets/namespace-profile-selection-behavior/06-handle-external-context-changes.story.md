---
story_id: handle-external-context-changes
session_id: namespace-profile-selection-behavior
feature_id: [tree-view-navigation]
spec_id: [webview-spec]
model_id: [namespace-selection-state]
status: completed
priority: high
estimated_minutes: 25
---

# Handle External Context Changes in Webview

## Objective
Update the webview's `namespaceContextChanged` message handler to respond to the new `isActive` flag and update the button state accordingly when namespace context changes externally.

## Context
When the namespace context changes externally (via kubectl CLI or other tools), the extension detects this and notifies all open webviews. Each webview needs to update its button state based on whether its displayed namespace is now the active one.

## Implementation Steps
1. Locate the webview's message handler for `namespaceContextChanged` messages
2. Update the handler to extract the `isActive` flag from the message data
3. Call the `updateButtonState` function (created in story 03) with the `isActive` value
4. If the message includes a notification about external changes:
   - Display a notification to the user: "Namespace context changed externally to: <namespace>"
   - Use VS Code notification API or webview notification UI
5. Handle the transition cases:
   - When button changes from enabled to disabled (namespace became active)
   - When button changes from disabled to enabled (different namespace became active)
6. Ensure the handler doesn't trigger unnecessary resource refreshes
7. Test that multiple webviews can handle the same message appropriately

## Files Affected
- Webview JavaScript/TypeScript file with message handlers (e.g., `src/webview/namespace.js`, `src/webview/namespace.ts`)

## Acceptance Criteria
- [ ] `namespaceContextChanged` handler reads the `isActive` flag from message data
- [ ] Handler calls `updateButtonState` with correct `isActive` value
- [ ] Button state transitions correctly: enabled ↔ disabled/selected
- [ ] Visual feedback (checkmark, text) updates correctly on state change
- [ ] User notification appears for external changes (when source is 'external')
- [ ] No unnecessary resource refreshes are triggered
- [ ] Multiple webviews can handle context changes independently

## Dependencies
- story_id: update-message-interfaces
- story_id: implement-button-state-logic
- story_id: update-extension-message-handler

