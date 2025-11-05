---
story_id: update-extension-message-handler
session_id: namespace-profile-selection-behavior
feature_id: [tree-view-navigation]
spec_id: [webview-spec]
model_id: [namespace-selection-state]
status: completed
priority: high
estimated_minutes: 25
---

# Update Extension Message Handler for isActive Flag

## Objective
Update the extension's message handler to calculate and include the `isActive` boolean flag when sending `namespaceContextChanged` messages to webviews, and remove the `clearActiveNamespace` command handler.

## Context
When the namespace context changes (either from user action or external kubectl changes), the extension needs to inform each open webview whether that webview's displayed namespace is now the active one. This requires comparing the webview's namespace with the current kubectl context namespace.

## Implementation Steps
1. Locate the extension code that sends `namespaceContextChanged` messages to webviews
2. Find where the current kubectl context namespace is read (likely using kubectl config view command)
3. When constructing `namespaceContextChanged` messages:
   - Get the current active namespace from kubectl context
   - Get the webview's displayed namespace
   - Calculate `isActive = (webviewNamespace === activeNamespace)`
   - Include `isActive` in the message data object
4. Find the message handler for `clearActiveNamespace` command
5. Remove the `clearActiveNamespace` command handler completely
6. Update any references to clearing namespace (if they exist elsewhere)
7. Ensure all code paths that send namespace change notifications include the `isActive` flag

## Files Affected
- Extension message handler file (e.g., `src/extension/webviewHandler.ts`, `src/extension/messageHandler.ts`, or similar)
- Extension namespace context management file

## Acceptance Criteria
- [ ] `namespaceContextChanged` messages include `isActive: boolean` in data object
- [ ] `isActive` is calculated by comparing webview's namespace with kubectl context namespace
- [ ] All code paths sending namespace change notifications include `isActive`
- [ ] `clearActiveNamespace` command handler is completely removed
- [ ] Extension compiles without TypeScript errors
- [ ] Logic correctly handles null/undefined namespaces (e.g., "All Namespaces" view)

## Dependencies
- story_id: update-message-interfaces

