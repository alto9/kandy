---
story_id: add-unsaved-changes-warning
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: pending
priority: medium
estimated_minutes: 15
---

## Objective

Implement unsaved changes warning when users attempt to close YAML editor tabs with unsaved modifications.

## Context

VS Code should prompt users with "Save", "Don't Save", "Cancel" options when they try to close a YAML editor with unsaved changes, matching standard VS Code behavior.

## Implementation Steps

1. Ensure VS Code's built-in dirty indicator shows for modified YAML editors
2. VS Code automatically prompts for unsaved changes - verify this works correctly
3. If needed, register `workspace.onWillSaveTextDocument` handler to intercept close
4. Test all three options:
   - "Save" - Apply changes to cluster, then close
   - "Don't Save" - Discard changes and close
   - "Cancel" - Keep editor open
5. Handle save failures in "Save" option (keep editor open)
6. Ensure prompt only appears for kube9-yaml:// scheme editors

## Files Affected

- `src/yaml/Kube9YAMLFileSystemProvider.ts` - Ensure dirty tracking works
- `src/yaml/YAMLEditorManager.ts` - Handle close events if needed

## Acceptance Criteria

- [ ] Unsaved changes show dirty indicator (dot on tab)
- [ ] Closing dirty tab shows "Save / Don't Save / Cancel" prompt
- [ ] "Save" option saves and closes editor
- [ ] "Don't Save" option closes without saving
- [ ] "Cancel" option keeps editor open
- [ ] Save failures prevent editor from closing
- [ ] Prompt matches standard VS Code behavior

## Dependencies

- Story 009 (Save integration) must be completed

