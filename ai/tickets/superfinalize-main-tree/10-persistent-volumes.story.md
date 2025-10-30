---
story_id: persistent-volumes
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: pending
priority: medium
estimated_minutes: 20
---

# Persistent Volumes Implementation

## Objective

Implement the Persistent Volumes subcategory to list all persistent volumes in the cluster with placeholder click handlers.

## Context

Persistent Volumes (PVs) are cluster-wide storage resources. Users need visibility into all PVs. At this stage, clicking a PV should not perform any action.

## Implementation Steps

1. Add logic to fetch persistent volumes using `kubectl get pv --output=json`
2. Parse PVs and create tree items with status and capacity information
3. Display PV status (Available, Bound, Released, Failed)
4. Show capacity information in the tree item label
5. Implement placeholder click handler (no-op)

## Files Affected

- `src/tree/categories/storage/PersistentVolumesSubcategory.ts` - New file for PV logic
- `src/kubectl/StorageCommands.ts` - New file for storage kubectl operations

## Acceptance Criteria

- [ ] Expanding Persistent Volumes shows all PVs in the cluster
- [ ] PV names and capacity are displayed (e.g., "pv-001 (10Gi)")
- [ ] PV status is visible (Available, Bound, etc.)
- [ ] Clicking a PV performs no action (placeholder)
- [ ] kubectl errors are handled gracefully

## Dependencies

- storage-category-structure

