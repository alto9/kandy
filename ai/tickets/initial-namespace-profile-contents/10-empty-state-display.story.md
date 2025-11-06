---
story_id: empty-state-display
session_id: initial-namespace-profile-contents
feature_id: [namespace-detail-view]
spec_id: [namespace-workloads-table-spec]
model_id: []
status: completed
priority: medium
estimated_minutes: 15
---

## Objective

Implement JavaScript functions to display workload-type-specific empty state messages when no resources of the selected type exist in the namespace.

## Context

When a namespace has no workloads of the selected type (e.g., no Deployments), the table should be hidden and an empty state message should appear. The message must be specific to the selected workload type, such as "No deployments found in this namespace."

## Implementation Steps

1. Open `src/webview/main.js`
2. Add function `showEmptyState(workloadType: string)`
   - Hide table container
   - Show empty state div (remove display: none)
   - Set empty state message based on workloadType:
     - 'Deployment' → "No deployments found in this namespace"
     - 'StatefulSet' → "No statefulsets found in this namespace"
     - 'DaemonSet' → "No daemonsets found in this namespace"
     - 'CronJob' → "No cronjobs found in this namespace"
   - Update message in #empty-message element
   - Ensure empty state icon is visible
3. Add function `hideEmptyState()`
   - Hide empty state div
   - Show table container
4. Update renderWorkloadsTable to call showEmptyState when workloads array is empty
5. Ensure empty state displays with proper styling (centered, icon, message)
6. Make message text lowercase for workload type in message for consistency

## Files Affected

- `src/webview/main.js` - Add empty state display functions

## Acceptance Criteria

- [ ] showEmptyState function hides table and shows empty state div
- [ ] Empty state message is specific to selected workload type
- [ ] Message format: "No {type} found in this namespace" (lowercase type)
- [ ] Empty state displays centered with icon and message
- [ ] hideEmptyState function shows table and hides empty state
- [ ] renderWorkloadsTable calls showEmptyState when array is empty
- [ ] Empty state is hidden when table has data to display
- [ ] Empty state icon (📦) is visible
- [ ] Empty state respects VS Code theme colors
- [ ] Transition between table and empty state is smooth

## Dependencies

- Story 05 (update-namespace-html-structure) - Requires empty state div element
- Story 09 (table-rendering-logic) - Called from renderWorkloadsTable function

