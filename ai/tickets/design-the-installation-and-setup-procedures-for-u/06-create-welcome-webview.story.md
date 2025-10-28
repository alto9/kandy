---
story_id: create-welcome-webview
session_id: design-the-installation-and-setup-procedures-for-u
feature_id: [initial-configuration]
spec_id: [webview-spec]
model_id: []
status: pending
priority: high
estimated_minutes: 25
---

## Objective

Build the welcome screen webview with HTML structure and content including quick start guide, authentication instructions, and dismissal options.

## Context

The welcome screen is shown on first launch to help users understand the extension's capabilities and optional authentication setup. It needs to clearly explain core features (cluster viewing, resource navigation, AI recommendations) and provide links to the portal and documentation.

## Implementation Steps

1. Create `src/webview/WelcomeWebview.ts` class
2. Implement method to create webview panel with proper configuration
3. Create HTML template with:
   - Kandy logo and title
   - Quick start guide explaining core features
   - Authentication section explaining API keys are optional for AI features
   - Link to portal.kandy.dev
   - Instructions for configuring API key in settings
   - Link to full documentation
   - "Do not show this again" checkbox
   - "Get Started" or "Close" button
4. Add message handler for webview-to-extension communication
5. Implement logic to show webview on first activation

## Files Affected

- `src/webview/WelcomeWebview.ts` - Create welcome webview class
- `src/extension.ts` - Trigger welcome webview on first activation

## Acceptance Criteria

- [ ] Welcome webview opens automatically on first activation
- [ ] Webview displays Kandy logo and title
- [ ] Quick start guide lists cluster viewing, resource navigation, and AI recommendations
- [ ] Authentication section clarifies API keys are optional and only for AI features
- [ ] Link to portal.kandy.dev is present and functional
- [ ] Instructions for configuring API key are clear
- [ ] Checkbox and close button are rendered properly
- [ ] Webview can communicate with extension host

## Dependencies

- setup-extension-activation

