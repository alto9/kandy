---
story_id: add-data-collection-placeholder-webview
session_id: operated-tree-menu-reports-section
feature_id: [reports-menu]
spec_id: [tree-view-spec]
status: completed
priority: medium
estimated_minutes: 20
---

## Objective

Add a placeholder webview that displays when users click on the Data Collection report item. The webview should show a "coming soon" message indicating that this feature is not yet implemented.

## Context

The Data Collection report item is a placeholder for future functionality. When clicked, it should open a webview panel (similar to how namespace items open webviews) that displays a simple message indicating the feature is coming soon.

This follows the pattern used by other tree items that open webviews (e.g., namespace items).

## Implementation Steps

1. Create a command handler for Data Collection report clicks (or use existing webview opening pattern)
2. Register the command in `package.json` under `commands` section:
   - Command ID: `kube9.openDataCollectionReport`
   - Title: "Open Data Collection Report"
3. In `ClusterTreeProvider.getChildren()` or command handler, detect clicks on `dataCollection` type items
4. Create a simple webview panel with placeholder content:
   - Title: "Data Collection Report"
   - Content: Simple HTML with message like "Data Collection report is coming soon. This feature will be available in a future release."
5. Follow the same webview creation pattern used for namespace webviews

## Files Affected

- `package.json` - Add command registration for Data Collection report
- `src/tree/ClusterTreeProvider.ts` or command handler - Add webview opening logic
- Possibly create `src/webviews/DataCollectionReportPanel.ts` - Simple webview panel class

## Acceptance Criteria

- [ ] Clicking Data Collection report item opens a webview panel
- [ ] Webview displays "coming soon" placeholder message
- [ ] Webview has appropriate title
- [ ] Code follows the same pattern as other webview implementations
- [ ] TypeScript compilation succeeds without errors

## Dependencies

- 003-create-compliance-subcategory-class (Data Collection item must exist)
- 006-update-getchildren-handle-reports-hierarchy (dataCollection type handling)

