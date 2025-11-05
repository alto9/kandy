---
story_id: implement-button-state-logic
session_id: namespace-profile-selection-behavior
feature_id: [tree-view-navigation]
spec_id: [webview-spec]
model_id: [namespace-selection-state]
status: completed
priority: high
estimated_minutes: 30
---

# Implement Button State Logic in Webview

## Objective
Implement the JavaScript/TypeScript logic in the webview to manage the "Set as Default Namespace" button state based on the `isActive` flag from namespace context messages.

## Context
The button needs to show two distinct states: enabled (when viewing a non-active namespace) and disabled/selected (when viewing the active namespace). The visual state includes button text changes, checkmark icon visibility, and disabled attribute management.

## Implementation Steps
1. Locate the webview JavaScript/TypeScript file that handles UI interactions
2. Create a function `updateButtonState(isActive: boolean, namespaceName: string)` that:
   - Gets reference to the button element (`#set-default-namespace`)
   - Gets references to icon span (`.btn-icon`) and text span (`.btn-text`)
   - If `isActive` is true:
     - Set button `disabled` attribute to true
     - Show checkmark icon (remove hidden class or set display)
     - Set button text to "Default Namespace"
   - If `isActive` is false:
     - Remove button `disabled` attribute
     - Hide checkmark icon (add hidden class or hide)
     - Set button text to "Set as Default Namespace"
3. Add click event listener to the button that:
   - Reads the namespace name from the title element
   - Sends `setActiveNamespace` message to extension with namespace name
   - Prevents action if button is disabled
4. Call `updateButtonState` when initializing the webview with initial namespace data
5. Ensure namespace name is set in the title element when webview loads

## Files Affected
- Webview JavaScript/TypeScript file (e.g., `src/webview/namespace.js`, `src/webview/namespace.ts`, or similar)

## Acceptance Criteria
- [ ] `updateButtonState` function exists and correctly manages button state
- [ ] When `isActive` is true, button shows disabled state with checkmark and "Default Namespace" text
- [ ] When `isActive` is false, button shows enabled state without checkmark and "Set as Default Namespace" text
- [ ] Button click event sends `setActiveNamespace` message with correct namespace name
- [ ] Button click is prevented when button is disabled
- [ ] Namespace name is correctly displayed in the h1 title element
- [ ] Function is called on webview initialization

## Dependencies
- story_id: update-message-interfaces
- story_id: update-webview-html-structure

