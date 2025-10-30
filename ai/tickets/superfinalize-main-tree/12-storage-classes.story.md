---
story_id: storage-classes
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: pending
priority: medium
estimated_minutes: 20
---

# Storage Classes Implementation

## Objective

Implement the Storage Classes subcategory to list all storage classes in the cluster with placeholder click handlers.

## Context

Storage Classes define different types of storage available in the cluster. Users need to see what storage classes are configured. At this stage, clicking a storage class should not perform any action.

## Implementation Steps

1. Add logic to fetch storage classes using `kubectl get storageclass --output=json`
2. Parse storage classes and create tree items with provisioner information
3. Display provisioner type (e.g., kubernetes.io/aws-ebs)
4. Indicate default storage class with a marker
5. Implement placeholder click handler (no-op)

## Files Affected

- `src/tree/categories/storage/StorageClassesSubcategory.ts` - New file for storage class logic
- `src/kubectl/StorageCommands.ts` - Add storage class kubectl operations

## Acceptance Criteria

- [ ] Expanding Storage Classes shows all storage classes in the cluster
- [ ] Storage class names and provisioners are displayed
- [ ] Default storage class is clearly marked (e.g., with a star or badge)
- [ ] Clicking a storage class performs no action (placeholder)
- [ ] kubectl errors are handled gracefully

## Dependencies

- storage-category-structure

