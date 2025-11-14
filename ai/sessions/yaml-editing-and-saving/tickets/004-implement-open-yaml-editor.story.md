---
story_id: implement-open-yaml-editor
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: completed
priority: high
estimated_minutes: 30
---

## Objective

Implement the `openYAMLEditor` method in YAMLEditorManager to open YAML content in a VS Code editor tab with proper syntax highlighting.

## Context

This completes the core flow of opening a YAML editor: creating the URI, fetching content, opening the editor, and tracking the instance.

## Implementation Steps

1. In `YAMLEditorManager.ts`, implement `openYAMLEditor(resource: ResourceIdentifier)`:
   - Create URI using `createResourceUri(resource)`
   - Check if editor already open (avoid duplicates)
   - Call `vscode.workspace.openTextDocument(uri)`
   - Call `vscode.window.showTextDocument(document, { preview: false })`
   - Set language mode to `yaml` for syntax highlighting
   - Track opened editor in `openEditors` Map
   - Return the editor instance
2. Add method to check if editor is already open
3. Add method to close specific editor
4. Handle editor disposal and cleanup
5. Add error handling for opening failures

## Files Affected

- `src/yaml/YAMLEditorManager.ts` - Implement openYAMLEditor method
- `src/yaml/Kube9YAMLFileSystemProvider.ts` - Ensure readFile works properly

## Acceptance Criteria

- [ ] openYAMLEditor opens a new tab with YAML content
- [ ] Tab title shows resource name with .yaml extension
- [ ] YAML syntax highlighting is applied
- [ ] Duplicate tabs are prevented
- [ ] Editor instances are tracked in memory
- [ ] Editors open in permanent tabs (not preview)

## Dependencies

- Story 003 (Custom URI scheme) must be completed

