---
story_id: webview-external-notifications
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [webview-spec]
model_id: [namespace-selection-state]
status: pending
priority: low
estimated_minutes: 20
---

# Webview External Context Change Notifications

## Objective

Display user-friendly notifications in webview when namespace context changes externally (via kubectl CLI).

## Context

When users change the namespace context using kubectl CLI outside of VS Code, the webview should detect this change and notify the user so they understand why the resources changed.

## Implementation Steps

1. Add notification UI component to webview:
   - Toast/banner style notification
   - Shows message about external change
   - Auto-dismisses after 5 seconds
   - Manual dismiss button
2. Handle `namespaceContextChanged` messages with source field:
   - If source is 'external', show notification
   - If source is 'extension', skip notification (user initiated)
3. Display appropriate message:
   - "Namespace context changed externally to: <namespace>"
   - "Namespace context cleared externally"
4. Style notification to match VS Code info notifications

## Files Affected

- `src/webview/notification.html` - Notification component template
- `src/webview/notification.css` - Notification styling
- `src/webview/main.js` - Show notification on external changes

## Acceptance Criteria

- [ ] Notification appears when external context change detected
- [ ] Notification shows correct namespace name
- [ ] Notification does not appear for extension-initiated changes
- [ ] Notification auto-dismisses after 5 seconds
- [ ] User can manually dismiss notification
- [ ] Notification styling matches VS Code theme

## Dependencies

- webview-context-integration
- namespace-cache-implementation (for external change detection)

