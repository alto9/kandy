---
story_id: implement-upsell-cta-panel
session_id: dashboard-customer-path
feature_id: [operated-dashboard]
spec_id: [free-operated-dashboard-spec]
diagram_id: [dashboard-architecture]
status: pending
priority: high
estimated_minutes: 25
---

## Objective

Implement the Upsell CTA panel UI that displays when the operator is installed but has no API key configured.

## Context

When operator status is "operated" (no API key), show an upsell panel encouraging users to configure an API key to unlock AI recommendations. Keep it friendly and non-intrusive.

## Implementation Steps

1. Create Upsell CTA panel HTML template in `operatedDashboardHtml.ts`
2. Add panel header with star icon and "Enhance Your Dashboard" title
3. Create CTA content:
   - Headline: "Unlock AI-Powered Cluster Insights"
   - Benefits list (4-5 items with checkmarks)
   - "Configure API Key" button
   - Helpful subtext
4. Style panel to be inviting but not annoying
5. Add click handler for "Configure API Key" button
   - Send 'configureApiKey' message to extension
6. Use VSCode theme colors with subtle gradient/accent

## Files Affected

- `src/dashboard/operatedDashboardHtml.ts` - Add upsell panel HTML
- `src/dashboard/OperatedDashboardPanel.ts` - Wire up CTA button

## Acceptance Criteria

- [ ] Upsell panel displays with star icon
- [ ] Headline is clear and compelling
- [ ] Benefits list shows 4-5 clear advantages
- [ ] "Configure API Key" button is prominent
- [ ] Button triggers configureApiKey message
- [ ] Panel design is inviting not pushy
- [ ] Uses VSCode theme colors appropriately

## Dependencies

- implement-ai-recommendations-panel (011)

