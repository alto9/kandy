---
story_id: pill-selector-interaction
session_id: initial-namespace-profile-contents
feature_id: [namespace-detail-view]
spec_id: [namespace-workloads-table-spec]
model_id: []
status: pending
priority: high
estimated_minutes: 25
---

## Objective

Implement JavaScript event handlers for pill selector interactions that update the active pill state and request workload data from the extension when a pill is clicked.

## Context

The pill selectors allow users to switch between viewing different workload types (Deployments, StatefulSets, DaemonSets, CronJobs). When a user clicks a pill, the UI needs to update the visual state and request fresh data for that workload type from the extension backend.

## Implementation Steps

1. Open `src/webview/main.js`
2. Add function `selectWorkloadType(workloadType: string)`
   - Remove 'active' class from all pill selector buttons
   - Add 'active' class to clicked pill button
   - Store selected workload type in state variable
   - Send message to extension: `{ command: 'fetchWorkloads', data: { workloadType } }`
3. Add event listeners to all pill selector buttons on page load
   - Query all elements with class 'pill-selector'
   - Add click event listener to each button
   - Extract workloadType from data-workload-type attribute
   - Call selectWorkloadType with the workload type
4. Ensure only one pill can be selected at a time (single selection behavior)
5. Initialize with Deployments pill selected on page load
6. Add visual feedback during loading state (optional)

## Files Affected

- `src/webview/main.js` - Add pill selector click handling logic

## Acceptance Criteria

- [ ] selectWorkloadType function updates pill active states correctly
- [ ] Only one pill has 'active' class at any time
- [ ] Clicking a pill removes 'active' from previous pill and adds to clicked pill
- [ ] Clicking active pill does nothing (keeps it active)
- [ ] fetchWorkloads message is sent to extension with correct workloadType
- [ ] Deployments pill is selected by default on page load
- [ ] Event listeners are properly attached to all 4 pill buttons
- [ ] data-workload-type attribute is correctly read from buttons
- [ ] JavaScript has no console errors
- [ ] Pill interaction feels responsive

## Dependencies

- Story 05 (update-namespace-html-structure) - Requires pill button elements
- Story 06 (add-workloads-css-styling) - Requires CSS for active state

