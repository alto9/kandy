---
story_id: implement-dismiss-logic
session_id: design-the-installation-and-setup-procedures-for-u
feature_id: [initial-configuration]
spec_id: [webview-spec]
model_id: []
status: completed
priority: high
estimated_minutes: 20
---

## Objective

Add "do not show again" checkbox functionality with state persistence so users can permanently dismiss the welcome screen.

## Context

Users should have control over whether the welcome screen appears on subsequent VS Code launches. The checkbox state must be captured and persisted using the GlobalState implementation. If unchecked, the welcome screen reappears; if checked, it's dismissed permanently.

## Implementation Steps

1. Add message handler in WelcomeWebview for "dismiss" and "close" events
2. Capture checkbox state from webview when user closes
3. Call GlobalState.setWelcomeScreenDismissed() with checkbox value
4. Modify activation logic to check GlobalState.getWelcomeScreenDismissed() before showing welcome
5. Handle both temporary dismiss (unchecked) and permanent dismiss (checked) scenarios
6. Add proper cleanup when webview is disposed

## Files Affected

- `src/webview/WelcomeWebview.ts` - Add dismiss message handlers
- `src/extension.ts` - Check state before showing welcome screen

## Acceptance Criteria

- [x] Clicking "Close" with checkbox unchecked closes webview but doesn't persist dismissal
- [x] Clicking "Close" with checkbox checked persists dismissal to GlobalState
- [x] Welcome screen reappears on next activation if not permanently dismissed
- [x] Welcome screen does not appear on next activation if permanently dismissed
- [x] State is properly saved and retrieved across VS Code restarts
- [x] Webview disposal is handled correctly

## Dependencies

- create-welcome-webview
- implement-global-state

