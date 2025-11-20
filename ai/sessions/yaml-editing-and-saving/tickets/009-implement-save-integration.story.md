---
story_id: implement-save-integration
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: completed
priority: high
estimated_minutes: 20
---

## Objective

Integrate YAMLSaveHandler with VS Code's save lifecycle and FileSystemProvider to enable Ctrl+S / Cmd+S to save YAML changes.

## Context

VS Code needs to call our save handler when users press Ctrl+S. We hook into the FileSystemProvider's writeFile method and the workspace save events.

## Implementation Steps

1. In `Kube9YAMLFileSystemProvider.ts`, implement `writeFile` method:
   - Parse resource from URI
   - Convert Uint8Array content to string
   - Call `yamlSaveHandler.handleSave(...)` with document
   - Handle save result (success/failure)
2. Register `workspace.onWillSaveTextDocument` event:
   - Check if document URI scheme is 'kube9-yaml'
   - Call save handler
   - Use `event.waitUntil()` to block until save completes
3. Update editor to show dirty indicator when edited
4. Clear dirty indicator after successful save
5. Show appropriate notifications for save success/failure

## Files Affected

- `src/yaml/Kube9YAMLFileSystemProvider.ts` - Implement writeFile
- `src/yaml/YAMLEditorManager.ts` - Register save event handlers
- `src/extension.ts` - Wire up event handlers on activation

## Acceptance Criteria

- [x] Ctrl+S / Cmd+S triggers save operation
- [x] Dirty indicator appears when YAML is edited
- [x] Dirty indicator clears after successful save
- [x] Save applies changes to cluster
- [x] Errors prevent save and show messages
- [x] Can save multiple open YAML editors independently

## Dependencies

- Story 008 (YAML save handler) must be completed

