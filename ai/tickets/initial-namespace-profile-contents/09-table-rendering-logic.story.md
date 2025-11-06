---
story_id: table-rendering-logic
session_id: initial-namespace-profile-contents
feature_id: [namespace-detail-view]
spec_id: [namespace-workloads-table-spec]
model_id: []
status: pending
priority: high
estimated_minutes: 30
---

## Objective

Implement JavaScript functions to render the workloads table with data received from the extension, including workload rows with name, namespace, health indicators, and replica counts.

## Context

When the extension sends workload data to the webview, the JavaScript needs to dynamically generate table rows displaying each workload's information. Health indicators must use the correct color classes, and replica counts must be formatted properly.

## Implementation Steps

1. Open `src/webview/main.js`
2. Add function `renderWorkloadsTable(data: WorkloadsTableData)`
   - Clear existing table rows from tbody#workloads-tbody
   - Check if data.workloads array is empty → call showEmptyState and return
   - Hide empty state div if visible
   - Show table container
   - Loop through data.workloads array
   - For each workload, call createWorkloadRow
   - Append each row to tbody
3. Add function `createWorkloadRow(workload: WorkloadEntry): HTMLTableRowElement`
   - Create tr element with class 'workload-row'
   - Add data attributes: data-workload-name, data-workload-type
   - Create td for name with class 'workload-name'
   - Create td for namespace with class 'workload-namespace'
   - Create td for health with class 'workload-health'
     - Add span.health-indicator with health status class (healthy/degraded/unhealthy/unknown)
     - Add span.health-text with status text
     - Use Unicode bullet character (●) for indicator
   - Create td for replicas with class 'workload-replicas'
     - Format as "readyReplicas/desiredReplicas"
   - Return completed row element
4. Add function `getHealthIndicatorClass(status: HealthStatus): string`
   - Map 'Healthy' → 'healthy', 'Degraded' → 'degraded', etc.
   - Return appropriate CSS class name
5. Handle edge cases: missing data, null values, undefined fields

## Files Affected

- `src/webview/main.js` - Add table rendering functions

## Acceptance Criteria

- [ ] renderWorkloadsTable clears existing rows before rendering
- [ ] Empty workloads array triggers empty state display
- [ ] Table rows are generated for all workloads in array
- [ ] Each row displays: name, namespace, health indicator, replica count
- [ ] Health indicators use correct CSS classes (healthy/degraded/unhealthy/unknown)
- [ ] Health indicator includes both colored dot (●) and status text
- [ ] Replica count formatted as "ready/desired" (e.g., "3/3")
- [ ] Rows have proper data attributes for semantic markup
- [ ] Table rendering is performant for 50+ workloads
- [ ] No JavaScript errors when rendering table
- [ ] Health indicator colors match CSS: green/yellow/red/gray

## Dependencies

- Story 05 (update-namespace-html-structure) - Requires table tbody element
- Story 06 (add-workloads-css-styling) - Requires CSS for health indicator classes

