---
story_id: add-reports-factory-methods
session_id: operated-tree-menu-reports-section
feature_id: [reports-menu]
spec_id: [tree-view-spec]
status: pending
priority: high
estimated_minutes: 15
---

## Objective

Add factory methods to `TreeItemFactory` for creating Reports category items, following the same pattern as existing category factory methods (e.g., `createNodesCategory`, `createWorkloadsCategory`).

## Context

The `TreeItemFactory` class provides consistent factory methods for creating all category tree items. We need to add:
- `createReportsCategory()` - Creates the top-level Reports category item
- This method should follow the same pattern as other category factory methods

## Implementation Steps

1. Open `src/tree/TreeItemFactory.ts`
2. Import `ReportsCategory` class
3. Add static method `createReportsCategory(resourceData: TreeItemData): ClusterTreeItem`:
   - Label: "Reports"
   - Type: `'reports'`
   - CollapsibleState: `Collapsed`
   - Icon: Use appropriate VS Code ThemeIcon (e.g., `'graph'` or `'file-text'`)
   - Tooltip: "View cluster reports and compliance information"
4. Follow the same pattern as `createNodesCategory()` or `createWorkloadsCategory()`

## Files Affected

- `src/tree/TreeItemFactory.ts` - Add createReportsCategory factory method

## Acceptance Criteria

- [ ] `createReportsCategory()` method exists in `TreeItemFactory`
- [ ] Method returns properly configured `ClusterTreeItem` with type `'reports'`
- [ ] Reports category has appropriate icon and tooltip
- [ ] Code follows the same pattern as other category factory methods
- [ ] TypeScript compilation succeeds without errors

## Dependencies

- 001-add-reports-tree-item-types (requires `reports` type to exist)
- 002-create-reports-category-class (may reference ReportsCategory)

