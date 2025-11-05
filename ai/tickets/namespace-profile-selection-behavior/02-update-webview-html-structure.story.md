---
story_id: update-webview-html-structure
session_id: namespace-profile-selection-behavior
feature_id: [tree-view-navigation]
spec_id: [webview-spec]
model_id: [namespace-selection-state]
status: completed
priority: high
estimated_minutes: 25
---

# Update Webview HTML Structure for Namespace Button

## Objective
Replace the namespace dropdown selector with a namespace title (h1) and "Set as Default Namespace" button in the webview HTML template.

## Context
The webview UI is changing from a dropdown-based namespace selector to a simpler, clearer interface where the namespace name is displayed as the page title with a button to set it as the default. This provides better visual hierarchy and clearer user intent.

## Implementation Steps
1. Locate the webview HTML template file(s) that contain the namespace selector UI
2. Find the `.namespace-selector-bar` div containing the dropdown and clear button
3. Replace the entire section with the new `.namespace-header` structure:
   - Remove `<select id="namespace-select">` and all its `<option>` elements
   - Remove `<button id="clear-namespace">` 
   - Remove the dropdown label
4. Add new header structure:
   - Add `<h1 class="namespace-title">` to display namespace name
   - Add `<button id="set-default-namespace" class="default-namespace-btn">` with checkmark icon span and button text span
   - Keep the warning label `<span class="namespace-info">`
5. Update the resource header to use `<h2>` instead of `<h1>` for resource names
6. Ensure proper IDs and classes are set for JavaScript interaction

## Files Affected
- Webview HTML template file (e.g., `src/webview/namespace.html`, `src/webview/templates/namespace.html`, or similar)
- May be multiple webview templates if different views exist

## Acceptance Criteria
- [ ] Namespace dropdown (`<select>` element) is completely removed
- [ ] "Clear" button is completely removed  
- [ ] New `<h1 class="namespace-title">` element exists in header
- [ ] New `<button id="set-default-namespace" class="default-namespace-btn">` exists
- [ ] Button contains `<span class="btn-icon">✓</span>` for checkmark
- [ ] Button contains `<span class="btn-text">` for button text
- [ ] Warning label remains: "(Changes kubectl context globally)"
- [ ] Resource names now use `<h2>` instead of `<h1>`
- [ ] HTML structure matches the spec in webview-spec.spec.md

## Dependencies
- None - this is a foundational change

