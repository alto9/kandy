---
story_id: update-message-interfaces
session_id: namespace-profile-selection-behavior
feature_id: [tree-view-navigation]
spec_id: [webview-spec]
model_id: [namespace-selection-state]
status: pending
priority: high
estimated_minutes: 20
---

# Update Message Interfaces for Namespace Button

## Objective
Update TypeScript message interfaces to support the new button-based namespace selection UI by adding the `isActive` flag and removing the `clearActiveNamespace` command.

## Context
The webview is transitioning from a dropdown-based namespace selector to a button that shows enabled/disabled states based on whether the displayed namespace matches the active kubectl context. The message interfaces need to reflect this change by providing the `isActive` boolean flag in context change notifications and removing the now-unused clear command.

## Implementation Steps
1. Locate the TypeScript interface definitions for webview messages (likely in a types or interfaces file)
2. Find the `NamespaceContextChangedMessage` interface
3. Add `isActive: boolean` field to the `data` object with a comment explaining it indicates whether the webview's namespace matches the active context
4. Find the `WebviewMessage` interface with the `command` union type
5. Remove `'clearActiveNamespace'` from the command union type (keeping `'applyRecommendation' | 'editYaml' | 'refreshData' | 'setActiveNamespace'`)
6. Update any JSDoc comments to reflect the interface changes

## Files Affected
- TypeScript interface/types file for webview messages (e.g., `src/types/webview.ts`, `src/webview/types.ts`, or similar)
- May need to update corresponding interface in extension-side code if separate

## Acceptance Criteria
- [ ] `NamespaceContextChangedMessage.data.isActive` field exists as a boolean type
- [ ] Interface includes comment explaining `isActive` indicates if webview's namespace is the active one
- [ ] `clearActiveNamespace` command is removed from `WebviewMessage` command union
- [ ] TypeScript compilation succeeds with no type errors
- [ ] All existing code using these interfaces compiles (may have errors to fix in later stories)

## Dependencies
- None - this is a foundational change

