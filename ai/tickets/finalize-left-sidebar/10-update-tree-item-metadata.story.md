---
story_id: update-tree-item-metadata
session_id: finalize-left-sidebar
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: []
status: pending
priority: low
estimated_minutes: 15
---

## Objective
Update TreeItemData metadata structure to only include cluster context information.

## Context
The TreeItemData metadata should now only store context (kubeconfig context name) and cluster information, removing any resource-specific metadata.

## Implementation Steps
1. Update TreeItemData interface metadata property
2. Remove resource-specific metadata fields
3. Keep only context and cluster fields in metadata
4. Update tree item creation to populate simplified metadata
5. Update any code that reads metadata from tree items

## Files Affected
- TreeItemData type definition
- Tree item creation logic
- Code that reads tree item metadata

## Acceptance Criteria
- [ ] TreeItemData metadata only includes context and cluster fields
- [ ] Resource-specific metadata fields are removed
- [ ] Tree items are created with correct metadata
- [ ] No compilation errors from metadata changes
- [ ] Metadata is accessible when needed for webview opening

## Dependencies
- simplify-tree-structure

