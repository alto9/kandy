---
story_id: update-namespace-html-structure
session_id: initial-namespace-profile-contents
feature_id: [namespace-detail-view]
spec_id: [webview-spec, namespace-workloads-table-spec]
model_id: []
status: pending
priority: medium
estimated_minutes: 20
---

## Objective

Update the namespace.html webview template to replace the placeholder content with the new workloads section structure including pill selectors, table, and empty state elements.

## Context

The webview spec shows a complete redesign of the namespace profile view. The old placeholder content with "Resource navigation coming soon" needs to be replaced with the workloads section that includes horizontal pill selectors and a data table for displaying workload resources.

## Implementation Steps

1. Open `src/webview/namespace.html`
2. Locate the `<div class="content">` section with placeholder content
3. Replace the entire content div with workloads section structure:
   - `<div class="workloads-section">` container
   - `<h2>Workloads</h2>` header
   - `<div class="workload-type-pills">` container with 4 pill buttons:
     - Deployments button (class="pill-selector active" data-workload-type="deployments")
     - StatefulSets button (class="pill-selector" data-workload-type="statefulsets")
     - DaemonSets button (class="pill-selector" data-workload-type="daemonsets")
     - CronJobs button (class="pill-selector" data-workload-type="cronjobs")
   - `<div class="table-container">` with `<table class="workloads-table">`
   - Table structure: thead with columns (Name, Namespace, Health, Ready/Desired)
   - tbody with id="workloads-tbody" for dynamic row insertion
   - `<div class="empty-state">` with message and icon (initially hidden)
   - `<p class="table-note">` with text "Workload items are currently non-interactive."
4. Ensure proper semantic HTML with appropriate ARIA attributes
5. Add data-workload-type attributes to pill buttons for JavaScript targeting

## Files Affected

- `src/webview/namespace.html` - Replace placeholder content section with workloads HTML structure

## Acceptance Criteria

- [ ] Old placeholder content div is completely removed
- [ ] Workloads section container exists with class "workloads-section"
- [ ] "Workloads" h2 header is present
- [ ] Four pill selector buttons are present in workload-type-pills div
- [ ] Deployments pill has "active" class by default
- [ ] Each pill has correct data-workload-type attribute
- [ ] Table has correct structure with thead and tbody
- [ ] Table columns are: Name, Namespace, Health, Ready/Desired
- [ ] tbody has id="workloads-tbody" for JavaScript access
- [ ] Empty state div is present with appropriate styling hooks
- [ ] Table note paragraph is present with non-interactive message
- [ ] HTML is valid and properly nested

## Dependencies

None - This story can be completed independently of backend stories

