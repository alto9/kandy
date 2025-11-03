---
story_id: webview-namespace-selector
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [webview-spec]
model_id: [namespace-selection-state]
status: pending
priority: high
estimated_minutes: 30
---

# Webview Namespace Selector UI Component

## Objective

Create a namespace selector dropdown component in the webview UI with a clear button and warning label.

## Context

Users need to be able to select namespaces directly from the webview panel. The UI should include a dropdown populated with all namespaces, a clear button, and a warning that changes affect kubectl globally.

## Implementation Steps

1. Add HTML structure for namespace selector bar:
   - Label "Active Namespace:"
   - Dropdown select element populated with namespaces
   - Clear button (enabled only when namespace is selected)
   - Warning text: "(Changes kubectl context globally)"
2. Add CSS styling following VS Code theme variables:
   - Flex layout for selector bar
   - Dropdown styling with VS Code colors
   - Button styling for secondary action
   - Info text styling
3. Implement JavaScript to:
   - Populate dropdown with namespaces from extension
   - Set current selection based on context state
   - Enable/disable clear button based on selection
4. Position selector bar at top of webview content

## Files Affected

- `src/webview/namespaceSelector.html` - HTML template for selector
- `src/webview/namespaceSelector.css` - Styles for selector component
- `src/webview/main.js` - JavaScript for selector behavior

## Acceptance Criteria

- [ ] Dropdown shows all available namespaces plus "All Namespaces" option
- [ ] Current namespace is pre-selected in dropdown
- [ ] Clear button is enabled only when specific namespace is selected
- [ ] Clear button is disabled when "All Namespaces" is selected
- [ ] Warning label is clearly visible
- [ ] Styling matches VS Code theme
- [ ] Component is positioned at top of webview

## Dependencies

- kubectl-context-reader (to get namespace list and current selection)

