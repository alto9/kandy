---
story_id: implement-ai-recommendations-panel
session_id: dashboard-customer-path
feature_id: [operated-dashboard]
spec_id: [free-operated-dashboard-spec]
diagram_id: [dashboard-architecture]
status: completed
priority: high
estimated_minutes: 30
---

## Objective

Implement the AI Recommendations panel UI that displays when the operator has an API key configured.

## Context

When the operator status is "enabled" (has API key), show the AI Recommendations panel with recommendation cards. Keep it simple and introductory - just display title and description for now.

## Implementation Steps

1. Create AI Recommendations panel HTML template in `operatedDashboardHtml.ts`
2. Add panel header with lightbulb icon and "AI Recommendations" title
3. Create recommendation card layout:
   - Title
   - Description
   - Card styling with VSCode colors
4. Implement function to query AI recommendations:
   - Query `kubectl get configmap kube9-ai-recommendations -n kube9-system -o json`
   - Parse recommendations array
5. Add JavaScript to render recommendations dynamically
6. Show "No recommendations available" if array is empty
7. Handle loading and error states for recommendations

## Files Affected

- `src/dashboard/operatedDashboardHtml.ts` - Add AI panel HTML
- `src/dashboard/AIRecommendationsQuery.ts` - Create query function
- `src/dashboard/OperatedDashboardPanel.ts` - Wire up AI panel

## Acceptance Criteria

- [x] AI Recommendations panel displays with lightbulb icon
- [x] Recommendations query kube9-ai-recommendations ConfigMap
- [x] Each recommendation shows as a card with title and description
- [x] Panel has distinct visual style
- [x] Handles empty recommendations gracefully
- [x] Loading state while fetching recommendations
- [x] Error handling if ConfigMap doesn't exist

## Dependencies

- create-operated-dashboard-webview (010)

