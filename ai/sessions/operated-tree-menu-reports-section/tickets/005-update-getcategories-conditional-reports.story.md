---
story_id: update-getcategories-conditional-reports
session_id: operated-tree-menu-reports-section
feature_id: [reports-menu]
spec_id: [tree-view-spec]
status: pending
priority: high
estimated_minutes: 20
---

## Objective

Update `ClusterTreeProvider.getCategories()` to conditionally prepend the Reports category at the top of the category list when the cluster's operator status is NOT `Basic`. Reports should appear before Nodes when visible.

## Context

The `getCategories()` method currently returns a fixed array of 7 categories. We need to:
- Check the cluster's `operatorStatus` property
- If `operatorStatus !== OperatorStatusMode.Basic`, prepend Reports category
- If `operatorStatus === OperatorStatusMode.Basic`, don't include Reports category
- Reports should be the first category when present (before Nodes)

The operator status is already available on `ClusterTreeItem` via the `operatorStatus` property.

## Implementation Steps

1. Open `src/tree/ClusterTreeProvider.ts`
2. Import `TreeItemFactory` (if not already imported)
3. Import `OperatorStatusMode` from `../kubernetes/OperatorStatusTypes`
4. Modify `getCategories()` method:
   - Check `clusterElement.operatorStatus`
   - If `operatorStatus !== OperatorStatusMode.Basic`:
     - Create Reports category using `TreeItemFactory.createReportsCategory()`
     - Prepend it to the categories array
   - Return the categories array (with or without Reports based on condition)
5. Update the JSDoc comment to reflect conditional Reports category

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Update getCategories() method to conditionally include Reports

## Acceptance Criteria

- [ ] `getCategories()` checks `operatorStatus` property
- [ ] Reports category is prepended when `operatorStatus !== OperatorStatusMode.Basic`
- [ ] Reports category is NOT included when `operatorStatus === OperatorStatusMode.Basic`
- [ ] Reports appears as first category (before Nodes) when visible
- [ ] Existing 7 categories still appear in correct order after Reports
- [ ] TypeScript compilation succeeds without errors

## Dependencies

- 001-add-reports-tree-item-types (requires `reports` type)
- 004-add-reports-factory-methods (requires `createReportsCategory()` method)

