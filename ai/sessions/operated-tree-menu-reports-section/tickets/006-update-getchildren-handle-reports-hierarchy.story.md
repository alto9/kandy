---
story_id: update-getchildren-handle-reports-hierarchy
session_id: operated-tree-menu-reports-section
feature_id: [reports-menu]
spec_id: [tree-view-spec]
status: completed
priority: high
estimated_minutes: 25
---

## Objective

Update `ClusterTreeProvider.getChildren()` to handle the Reports menu hierarchy: Reports category → Compliance subcategory → Data Collection report item. This follows the same pattern as other category hierarchies (e.g., Workloads → Deployments → individual deployments).

## Context

The `getChildren()` method needs to handle three new cases:
1. When Reports category is expanded → return Compliance subcategory
2. When Compliance subcategory is expanded → return Data Collection report item
3. When Data Collection report item is clicked → handled by command (story 008)

The Reports hierarchy follows the same pattern as Workloads:
- Workloads category → Deployments subcategory → individual deployments
- Reports category → Compliance subcategory → Data Collection report

## Implementation Steps

1. Open `src/tree/ClusterTreeProvider.ts`
2. Import `ReportsCategory` from `./categories/ReportsCategory`
3. Import `ComplianceSubcategory` from `./categories/reports/ComplianceSubcategory`
4. In `getChildren()` method, add handling for Reports hierarchy:
   - Case: `element.type === 'reports'`:
     - Call `ReportsCategory.getReportsSubcategories(element.resourceData!)`
     - Return the subcategories array
   - Case: `element.type === 'compliance'`:
     - Call `ComplianceSubcategory.getComplianceReportItems(element.resourceData!)`
     - Return the report items array
   - Case: `element.type === 'dataCollection'`:
     - Return empty array (leaf item, no children)
5. Follow the same pattern used for Workloads category handling

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Update getChildren() to handle Reports hierarchy

## Acceptance Criteria

- [ ] Expanding Reports category shows Compliance subcategory
- [ ] Expanding Compliance subcategory shows Data Collection report item
- [ ] Data Collection report item has no children (empty array)
- [ ] Code follows the same pattern as Workloads category handling
- [ ] TypeScript compilation succeeds without errors
- [ ] No regressions in existing category handling

## Dependencies

- 002-create-reports-category-class (requires ReportsCategory)
- 003-create-compliance-subcategory-class (requires ComplianceSubcategory)
- 005-update-getcategories-conditional-reports (Reports category must exist in tree)

