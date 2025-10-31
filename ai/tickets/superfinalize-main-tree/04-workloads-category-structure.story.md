---
story_id: workloads-category-structure
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: completed
priority: high
estimated_minutes: 15
---

# Workloads Category Structure

## Objective

Implement the Workloads category structure with 4 subcategories: Deployments, StatefulSets, DaemonSets, and CronJobs.

## Context

The Workloads category is a container for different types of workload resources. It doesn't fetch data itself but provides structure for its 4 subcategories. Each subcategory will be implemented in separate stories.

## Implementation Steps

1. Add logic to expand the Workloads category into 4 subcategory tree items
2. Create tree item definitions for each subcategory type
3. Ensure subcategories appear in order: Deployments, StatefulSets, DaemonSets, CronJobs
4. Add appropriate icons for each subcategory
5. Make subcategories expandable (ready for future implementation)

## Files Affected

- `src/tree/categories/WorkloadsCategory.ts` - New file for workloads category
- `src/tree/TreeItemTypes.ts` - Add subcategory type definitions

## Acceptance Criteria

- [ ] Expanding Workloads category shows exactly 4 subcategories
- [ ] Subcategories appear in correct order: Deployments, StatefulSets, DaemonSets, CronJobs
- [ ] Each subcategory has an appropriate icon
- [ ] Subcategories are expandable (may show empty state until implemented)
- [ ] No errors when expanding Workloads category

## Dependencies

- resource-category-foundation

