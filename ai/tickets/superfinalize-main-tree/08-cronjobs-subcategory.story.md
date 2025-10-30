---
story_id: cronjobs-subcategory
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: pending
priority: high
estimated_minutes: 25
---

# CronJobs Subcategory Implementation

## Objective

Implement the CronJobs subcategory to list all cronjobs, with each cronjob expandable to show its pods.

## Context

CronJobs create jobs on a schedule. Users need to see all cronjobs and drill down to their running or completed pods. Pod clicks should use placeholder handlers at this stage.

## Implementation Steps

1. Add logic to fetch cronjobs using `kubectl get cronjobs --all-namespaces --output=json`
2. Parse cronjobs and create tree items with schedule and status information
3. Make each cronjob expandable
4. Add logic to fetch pods for jobs created by the cronjob
5. Implement placeholder click handlers for pod items (no-op)

## Files Affected

- `src/tree/categories/workloads/CronJobsSubcategory.ts` - New file for cronjobs logic
- `src/kubectl/WorkloadCommands.ts` - Add cronjob kubectl operations

## Acceptance Criteria

- [ ] Expanding CronJobs shows all cronjobs across all namespaces
- [ ] CronJob items show schedule (e.g., "*/5 * * * *")
- [ ] Each cronjob is expandable to show its pods
- [ ] Pod names from jobs are displayed correctly
- [ ] Clicking a pod performs no action (placeholder)
- [ ] kubectl errors are handled gracefully

## Dependencies

- workloads-category-structure

