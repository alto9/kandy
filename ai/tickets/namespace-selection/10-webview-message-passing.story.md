---
story_id: webview-message-passing
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [webview-spec]
model_id: [namespace-selection-state]
status: completed
priority: high
estimated_minutes: 25
---

# Webview Message Passing for Namespace Selection

## Objective

Implement message passing protocol between webview and extension for namespace selection actions.

## Context

The webview needs to communicate namespace selection changes to the extension, and the extension needs to notify the webview when context changes. This requires a bidirectional message passing system.

## Implementation Steps

1. Define TypeScript message interfaces:
   - `SetActiveNamespaceMessage` (webview to extension)
   - `ClearActiveNamespaceMessage` (webview to extension)
   - `NamespaceContextChangedMessage` (extension to webview)
2. Implement webview-side message sending:
   - Send message when dropdown selection changes
   - Send message when clear button is clicked
3. Implement extension-side message handlers:
   - Handle `setActiveNamespace` command
   - Handle `clearActiveNamespace` command
   - Call appropriate kubectl context functions
4. Implement extension-to-webview notifications:
   - Send `namespaceContextChanged` when context updates
   - Include namespace and source (extension or external)

## Files Affected

- `src/types/webviewMessages.ts` - New message type definitions
- `src/webview/main.js` - Send messages on user actions
- `src/webview/webviewProvider.ts` - Handle incoming messages, send notifications

## Acceptance Criteria

- [ ] Webview sends correct message when namespace is selected
- [ ] Webview sends correct message when clear is clicked
- [ ] Extension receives and processes messages correctly
- [ ] Extension sends notifications to webview on context changes
- [ ] Messages include all required data fields
- [ ] Type safety is maintained with TypeScript interfaces

## Dependencies

- kubectl-context-writer
- webview-namespace-selector

