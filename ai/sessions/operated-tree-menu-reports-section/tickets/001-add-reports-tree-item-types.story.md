---
story_id: add-reports-tree-item-types
session_id: operated-tree-menu-reports-section
feature_id: [reports-menu]
spec_id: [tree-view-spec]
status: completed
priority: high
estimated_minutes: 15
---

## Objective

Add the new tree item types (`reports`, `compliance`, `dataCollection`) to the `TreeItemType` enum to support the Reports menu hierarchy.

## Context

The Reports menu requires three new tree item types:
- `reports`: Top-level Reports category
- `compliance`: Compliance subcategory under Reports
- `dataCollection`: Data Collection report item under Compliance

These types need to be added to the existing `TreeItemType` union type in `TreeItemTypes.ts` to match the pattern used by other categories and subcategories.

## Implementation Steps

1. Open `src/tree/TreeItemTypes.ts`
2. Add `'reports'`, `'compliance'`, and `'dataCollection'` to the `TreeItemType` union type
3. Update the JSDoc comment to document these new types:
   - Add `reports` to the "Category types" section
   - Add `compliance` to the "Category types" section (as a subcategory)
   - Add `dataCollection` to the "Individual resource types" section (as a report item)

## Files Affected

- `src/tree/TreeItemTypes.ts` - Add new tree item types to the enum

## Acceptance Criteria

- [ ] `TreeItemType` includes `'reports'` type
- [ ] `TreeItemType` includes `'compliance'` type
- [ ] `TreeItemType` includes `'dataCollection'` type
- [ ] JSDoc comments document the new types appropriately
- [ ] TypeScript compilation succeeds without errors

## Dependencies

- None (foundational change)

