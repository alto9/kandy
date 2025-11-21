---
story_id: implement-conditional-content-logic
session_id: dashboard-customer-path
feature_id: [operated-dashboard]
spec_id: [free-operated-dashboard-spec, dashboard-webview-spec]
diagram_id: [dashboard-architecture]
status: completed
priority: high
estimated_minutes: 25
---

## Objective

Implement logic to show correct conditional content (AI recommendations OR upsell CTA) based on operator API key status.

## Context

The Operated Dashboard needs to detect API key presence and show the appropriate panel. If hasApiKey && mode==='enabled', show AI recommendations. Otherwise, show upsell CTA.

## Implementation Steps

1. In `OperatedDashboardPanel.ts`, implement `determineConditionalContent(operatorStatus)` function
2. Check operatorStatus.hasApiKey and operatorStatus.mode
3. Return 'ai-recommendations' or 'upsell-cta' content type
4. When rendering webview HTML, include the appropriate panel
5. Send operator status to webview so it knows which content to show
6. Add CSS to show/hide panels based on content type
7. Test both scenarios: with API key (AI) and without (upsell)

## Files Affected

- `src/dashboard/OperatedDashboardPanel.ts` - Implement conditional logic
- `src/dashboard/operatedDashboardHtml.ts` - Wire up conditional display

## Acceptance Criteria

- [x] With API key: AI recommendations panel displays
- [x] Without API key: Upsell CTA panel displays
- [x] Only one panel displays at a time
- [x] Logic correctly interprets operator status
- [x] Content switches if status changes
- [x] Both panels work in their respective scenarios

## Dependencies

- implement-upsell-cta-panel (012)

