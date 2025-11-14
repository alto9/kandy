---
session_id: operated-tree-menu-reports-section
start_time: '2025-11-13T15:32:31.441Z'
status: completed
problem_statement: operated tree menu reports section
changed_files:
  - path: ai/features/navigation/reports-menu.feature.md
    change_type: added
    scenarios_added:
      - Reports menu appears when operator is installed (operated mode)
      - Reports menu appears when operator is installed (enabled mode)
      - Reports menu appears when operator is installed (degraded mode)
      - Reports menu does not appear when operator is not installed (basic mode)
      - Expanding Reports category shows Compliance subcategory
      - Expanding Compliance subcategory shows Data Collection report
      - Clicking Data Collection report shows placeholder
      - Reports menu updates when operator status changes
      - Reports menu disappears when operator is removed
      - Multiple clusters show Reports independently based on operator status
      - Reports category has appropriate icon
      - Compliance subcategory has appropriate icon
      - Data Collection report item has appropriate icon
start_commit: bba804574ee9b9c20793f02e241f71d24d44a3d3
end_time: '2025-11-13T15:40:46.266Z'
---
## Problem Statement

Add a Reports menu section to the kube9-vscode tree menu that appears when a cluster is in any mode other than 'basic' (i.e., when the operator is installed and functioning). The Reports menu should be injected at the top of the tree menu and include a hierarchical structure with empty placeholder pages for future functionality.

## Goals

1. **Conditional Reports Menu Display**
   - Inject a "Reports" menu at the top of the tree when cluster operator status is NOT 'basic'
   - Reports menu should appear for clusters with status: 'operated', 'enabled', or 'degraded'
   - Reports menu should NOT appear for clusters with status: 'basic' (no operator installed)

2. **Reports Menu Structure**
   - Build out the complete menu hierarchy:
     - Reports (top-level category)
       - Compliance (subcategory/folder)
         - Data Collection (empty report page)
   - All menu items should be non-functional placeholders for now
   - Structure should be expandable and ready for future implementation

3. **Integration with Existing Tree**
   - Reports menu should appear as the first category when a cluster is expanded
   - Existing categories (Nodes, Namespaces, Workloads, Storage, Helm, Configuration, Custom Resources) should follow after Reports
   - Maintain consistency with existing category patterns and styling

## Approach

1. **Feature Definition**
   - Create a new feature file for Reports menu functionality
   - Define Gherkin scenarios for conditional display based on operator status
   - Document the menu hierarchy structure and placeholder behavior

2. **Specification Updates**
   - Update tree-view-spec to include Reports category in the tree structure
   - Document the conditional logic for Reports menu visibility
   - Define the Reports menu hierarchy structure

3. **Implementation Planning**
   - Add 'reports' and 'compliance' to TreeItemType enum
   - Create ReportsCategory class following existing category patterns
   - Create ComplianceSubcategory class for nested structure
   - Create DataCollectionReport item as placeholder
   - Update ClusterTreeProvider.getCategories() to conditionally include Reports at the top
   - Add factory methods in TreeItemFactory for Reports category items
   - Ensure operator status check determines Reports visibility

## Key Decisions

1. **Conditional Display Logic**
   - **Decision**: Reports menu appears when `operatorStatus !== OperatorStatusMode.Basic`
   - **Rationale**: Reports functionality requires operator presence, so it should only appear when operator is installed (operated, enabled, or degraded modes)

2. **Menu Position**
   - **Decision**: Reports menu appears at the top of the category list (before Nodes)
   - **Rationale**: Reports are a high-level feature that should be prominently displayed when available

3. **Hierarchical Structure**
   - **Decision**: Use nested structure: Reports > Compliance > Data Collection
   - **Rationale**: Allows for future expansion with multiple report types and categories

4. **Non-Functional Placeholders**
   - **Decision**: All Reports menu items are non-functional placeholders for now
   - **Rationale**: Establishes the structure and UI without requiring backend implementation yet

5. **Category Pattern Consistency**
   - **Decision**: Follow existing category/subcategory patterns (like Workloads > Deployments)
   - **Rationale**: Maintains consistency with existing codebase structure and user experience

## Notes

- The operator status is already tracked per cluster via `ClusterTreeItem.operatorStatus`
- The existing `getCategories()` method in ClusterTreeProvider returns categories in a fixed order
- Need to modify `getCategories()` to conditionally prepend Reports category based on operator status
- Reports category should follow the same expandable pattern as other categories
- Empty report pages should display placeholder content indicating future functionality
- Consider icon selection for Reports and Compliance categories (use VS Code ThemeIcon for theme compatibility)
- Future implementation will need to connect these menu items to actual report webviews or functionality
