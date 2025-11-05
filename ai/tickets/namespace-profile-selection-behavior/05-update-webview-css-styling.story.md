---
story_id: update-webview-css-styling
session_id: namespace-profile-selection-behavior
feature_id: [tree-view-navigation]
spec_id: [webview-spec]
model_id: [namespace-selection-state]
status: pending
priority: medium
estimated_minutes: 20
---

# Update Webview CSS Styling for Namespace Button

## Objective
Update the webview CSS to remove old dropdown styles and add new button-based header styling according to the specification.

## Context
The UI is changing from dropdown-based to button-based selection, requiring removal of old styles and addition of new ones that provide proper visual hierarchy, hover states, and disabled button styling.

## Implementation Steps
1. Locate the webview CSS file(s)
2. Remove old styles:
   - `.namespace-selector-bar` - delete entire rule
   - `.namespace-dropdown` - delete entire rule
   - `.clear-btn` - delete entire rule
3. Add new `.namespace-header` styles:
   - `display: flex`
   - `align-items: center`
   - `gap: 15px`
   - `padding: 15px`
   - `background-color: var(--vscode-editor-background)`
   - `border-bottom: 2px solid var(--vscode-panel-border)`
4. Add `.namespace-title` styles:
   - `flex: 1`
   - `margin: 0`
   - `font-size: 1.5em`
   - `font-weight: 600`
   - `color: var(--vscode-foreground)`
5. Add `.default-namespace-btn` styles for enabled state and hover
6. Add `.default-namespace-btn:disabled` styles for disabled state
7. Add `.btn-icon` and `.btn-text` styles
8. Add rule to hide icon when button is not disabled: `.default-namespace-btn:not(:disabled) .btn-icon { display: none; }`
9. Update `.namespace-info` styles as specified

## Files Affected
- Webview CSS file (e.g., `src/webview/styles.css`, `src/webview/namespace.css`, or similar)

## Acceptance Criteria
- [ ] All old dropdown-related CSS rules are removed
- [ ] New `.namespace-header` styles match specification
- [ ] New `.namespace-title` styles match specification
- [ ] Button styles for enabled, hover, and disabled states are implemented
- [ ] Checkmark icon is hidden when button is enabled
- [ ] Checkmark icon is visible when button is disabled
- [ ] All styles use VS Code CSS variables for theming
- [ ] Visual appearance matches the specification in webview-spec.spec.md

## Dependencies
- story_id: update-webview-html-structure

