---
story_id: persistent-volume-claims
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: completed
priority: medium
estimated_minutes: 20
---

# Persistent Volume Claims Implementation

## Objective

Implement the Persistent Volume Claims subcategory to list all PVCs across all namespaces with placeholder click handlers.

## Context

Persistent Volume Claims (PVCs) are namespace-scoped requests for storage. Users need to see all PVCs across the cluster. At this stage, clicking a PVC should not perform any action.

## Implementation Steps

1. Add logic to fetch PVCs using `kubectl get pvc --all-namespaces --output=json`
2. Parse PVCs and create tree items with status and capacity information
3. Display PVC status (Pending, Bound, Lost)
4. Show namespace and capacity in the tree item label
5. Implement placeholder click handler (no-op)

## Files Affected

- `src/tree/categories/storage/PersistentVolumeClaimsSubcategory.ts` - New file for PVC logic
- `src/kubectl/StorageCommands.ts` - Add PVC kubectl operations

## Acceptance Criteria

- [ ] Expanding Persistent Volume Claims shows all PVCs across all namespaces
- [ ] PVC names include namespace context (e.g., "default/my-pvc")
- [ ] PVC status and capacity are displayed (e.g., "Bound (5Gi)")
- [ ] Clicking a PVC performs no action (placeholder)
- [ ] kubectl errors are handled gracefully

## Dependencies

- storage-category-structure

