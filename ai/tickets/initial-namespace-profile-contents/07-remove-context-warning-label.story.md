---
story_id: remove-context-warning-label
session_id: initial-namespace-profile-contents
feature_id: [namespace-detail-view]
spec_id: [webview-spec]
model_id: []
status: completed
priority: low
estimated_minutes: 10
---

## Objective

Remove the "(Changes kubectl context globally)" warning label from the namespace button area to clean up the UI based on the updated webview spec.

## Context

The git diff for webview-spec shows that the `<span class="namespace-info">` element containing "(Changes kubectl context globally)" has been removed from the design. This simplifies the namespace header area and makes the button section less cluttered.

## Implementation Steps

1. Open `src/webview/namespace.html`
2. Locate the `.namespace-header` div section
3. Find the `<span class="namespace-info">` element with text "(Changes kubectl context globally)"
4. Delete the entire span element
5. Verify the namespace header layout still looks correct without the warning
6. Remove the `.namespace-info` CSS rule from the style section if no longer needed elsewhere

## Files Affected

- `src/webview/namespace.html` - Remove namespace-info span element and optionally its CSS rule

## Acceptance Criteria

- [ ] namespace-info span element is completely removed from HTML
- [ ] "(Changes kubectl context globally)" text no longer appears in UI
- [ ] Namespace header div contains only h1 title and button
- [ ] Button layout and spacing remain intact
- [ ] CSS rule for .namespace-info can be removed if unused
- [ ] Webview renders correctly without the warning label

## Dependencies

None - This is a simple cleanup story that can be done independently

