---
story_id: create-reports-category-class
session_id: operated-tree-menu-reports-section
feature_id: [reports-menu]
spec_id: [tree-view-spec]
status: pending
priority: high
estimated_minutes: 20
---

## Objective

Create the `ReportsCategory` class following the same pattern as other category classes (e.g., `WorkloadsCategory`, `StorageCategory`). This class will provide the structure for the Reports category and its Compliance subcategory.

## Context

The Reports category needs to follow the same pattern as existing categories. It should:
- Be a static class with methods to get subcategories
- Return the Compliance subcategory when expanded
- Use VS Code ThemeIcon for icons
- Follow the same structure as `WorkloadsCategory.getWorkloadSubcategories()`

## Implementation Steps

1. Create `src/tree/categories/ReportsCategory.ts` file
2. Import necessary dependencies (`vscode`, `ClusterTreeItem`, `TreeItemData`)
3. Create `ReportsCategory` class with static methods:
   - `getReportsSubcategories(resourceData: TreeItemData): ClusterTreeItem[]` - Returns Compliance subcategory
   - `createComplianceSubcategory(resourceData: TreeItemData): ClusterTreeItem` - Creates Compliance subcategory item
4. Configure Compliance subcategory:
   - Label: "Compliance"
   - Type: `'compliance'`
   - CollapsibleState: `Collapsed`
   - Icon: Use appropriate VS Code ThemeIcon (e.g., `'shield'` or `'verified'`)
   - Tooltip: "View compliance reports"

## Files Affected

- `src/tree/categories/ReportsCategory.ts` - Create new file with ReportsCategory class

## Acceptance Criteria

- [ ] `ReportsCategory` class exists with static methods
- [ ] `getReportsSubcategories()` returns array with Compliance subcategory
- [ ] Compliance subcategory has correct label, type, and icon
- [ ] Compliance subcategory is collapsible
- [ ] Code follows the same pattern as `WorkloadsCategory`
- [ ] TypeScript compilation succeeds without errors

## Dependencies

- 001-add-reports-tree-item-types (requires `compliance` type to exist)

