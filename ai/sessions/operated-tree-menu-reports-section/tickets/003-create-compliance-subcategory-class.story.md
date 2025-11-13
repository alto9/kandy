---
story_id: create-compliance-subcategory-class
session_id: operated-tree-menu-reports-section
feature_id: [reports-menu]
spec_id: [tree-view-spec]
status: pending
priority: high
estimated_minutes: 20
---

## Objective

Create the `ComplianceSubcategory` class following the same pattern as other subcategory classes (e.g., `DeploymentsSubcategory`). This class will provide the Data Collection report item when the Compliance subcategory is expanded.

## Context

The Compliance subcategory needs to follow the same pattern as existing subcategories. It should:
- Be a static class with methods to get report items
- Return the Data Collection report item (placeholder) when expanded
- Use VS Code ThemeIcon for icons
- Follow the same structure as `DeploymentsSubcategory.getDeploymentItems()` but simpler (no kubectl calls needed for placeholder)

## Implementation Steps

1. Create `src/tree/categories/reports/ComplianceSubcategory.ts` file (note: nested in `reports/` folder)
2. Import necessary dependencies (`vscode`, `ClusterTreeItem`, `TreeItemData`)
3. Create `ComplianceSubcategory` class with static method:
   - `getComplianceReportItems(resourceData: TreeItemData): ClusterTreeItem[]` - Returns Data Collection report item
   - `createDataCollectionReport(resourceData: TreeItemData): ClusterTreeItem` - Creates Data Collection report item
4. Configure Data Collection report item:
   - Label: "Data Collection"
   - Type: `'dataCollection'`
   - CollapsibleState: `None` (leaf item, not expandable)
   - Icon: Use appropriate VS Code ThemeIcon (e.g., `'database'` or `'file-text'`)
   - Tooltip: "Data Collection report (coming soon)"
   - Command: Set `command` property to open placeholder webview (will be implemented in story 008)

## Files Affected

- `src/tree/categories/reports/ComplianceSubcategory.ts` - Create new file with ComplianceSubcategory class

## Acceptance Criteria

- [ ] `ComplianceSubcategory` class exists with static methods
- [ ] `getComplianceReportItems()` returns array with Data Collection report item
- [ ] Data Collection report item has correct label, type, and icon
- [ ] Data Collection report item is not collapsible (leaf item)
- [ ] Code follows the same pattern as other subcategory classes
- [ ] TypeScript compilation succeeds without errors

## Dependencies

- 001-add-reports-tree-item-types (requires `dataCollection` type to exist)
- 002-create-reports-category-class (Compliance subcategory referenced by ReportsCategory)

