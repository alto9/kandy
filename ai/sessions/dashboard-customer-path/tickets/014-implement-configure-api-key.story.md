---
story_id: implement-configure-api-key
session_id: dashboard-customer-path
feature_id: [operated-dashboard]
spec_id: [free-operated-dashboard-spec]
status: pending
priority: medium
estimated_minutes: 20
---

## Objective

Implement the "Configure API Key" button functionality to prompt users for their API key and update the operator.

## Context

When users click "Configure API Key" in the upsell panel, prompt them for their kube9 API key using VSCode input box, then configure it in the operator (placeholder for now).

## Implementation Steps

1. In `OperatedDashboardPanel.ts`, handle 'configureApiKey' message from webview
2. Show VSCode input box:
   - Prompt: "Enter your kube9 API key"
   - Password input for security
   - Validate non-empty
3. If user enters key:
   - Store key securely (use VSCode secret storage if available)
   - Show success message
   - Refresh dashboard to show AI recommendations
4. If user cancels, do nothing
5. Log action for debugging

## Files Affected

- `src/dashboard/OperatedDashboardPanel.ts` - Implement API key prompt
- `src/extension.ts` - Add message handler if needed

## Acceptance Criteria

- [ ] Clicking button shows VSCode input box
- [ ] Input box uses password mode
- [ ] Non-empty validation works
- [ ] User can cancel without error
- [ ] API key stored securely (placeholder OK for now)
- [ ] Success message shown after configuration
- [ ] Dashboard refreshes to show AI panel

## Dependencies

- implement-conditional-content-logic (013)

