---
story_id: implement-permission-checking
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: pending
priority: medium
estimated_minutes: 25
---

## Objective

Implement permission checking using kubectl auth to determine if users can edit resources, and set editors to read-only mode when they lack permissions.

## Context

Not all users have edit permissions for all resources. We should check permissions and open editors in read-only mode when users can only view resources.

## Implementation Steps

1. Create `src/yaml/PermissionChecker.ts` file
2. Implement `checkResourcePermissions(resource: ResourceIdentifier)` function:
   - Execute `kubectl auth can-i update <kind> <name> -n <namespace>`
   - Parse stdout for "yes" or "no"
   - If "yes", return `ReadWrite` permission level
   - If "no", check for read permission with `kubectl auth can-i get <kind> <name>`
   - Return appropriate permission level: `None`, `ReadOnly`, or `ReadWrite`
3. Create `PermissionLevel` enum
4. In `YAMLEditorManager.openYAMLEditor`, check permissions before opening
5. If `ReadOnly`, open document with `preview: false` and set as read-only
6. Show notification: "Read-only: Insufficient permissions to edit this resource"
7. Disable save operations for read-only editors

## Files Affected

- `src/yaml/PermissionChecker.ts` (new) - Permission checking logic
- `src/yaml/YAMLEditorManager.ts` - Check permissions before opening
- `src/yaml/YAMLSaveHandler.ts` - Block saves for read-only editors

## Acceptance Criteria

- [ ] Permission checking uses kubectl auth can-i
- [ ] Read-only editors cannot be edited
- [ ] Read-only notification displayed
- [ ] Save commands disabled for read-only editors
- [ ] Read-write permissions allow normal editing

## Dependencies

- Story 009 (Save integration) must be completed

