---
story_id: implement-conflict-detection
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: completed
priority: low
estimated_minutes: 30
---

## Objective

Implement conflict detection that warns users when a resource has been modified externally while they're editing it.

## Context

If a resource is modified externally (via kubectl or another tool) while a user is editing it, we should detect this and offer options to reload, compare, or keep local changes.

## Implementation Steps

1. Create `src/yaml/ConflictDetector.ts` file
2. Track `resourceVersion` from initial YAML fetch
3. Periodically check current resourceVersion from cluster (every 30 seconds when editor has focus)
4. Compare versions to detect external changes
5. When conflict detected, show notification with options:
   - "Reload" - Discard local changes and reload from cluster
   - "Compare" - Show diff view between local and remote
   - "Keep Local" - Disable conflict detection for this edit
6. Implement each option handler
7. Only check for conflicts when editor is focused and has unsaved changes

## Files Affected

- `src/yaml/ConflictDetector.ts` (new) - Conflict detection logic
- `src/yaml/YAMLEditorManager.ts` - Start conflict detection when editor opens
- `src/yaml/YAMLContentProvider.ts` - Extract resourceVersion from YAML

## Acceptance Criteria

- [ ] resourceVersion tracked for each open editor
- [ ] Periodic checks detect external changes
- [ ] Notification shown when conflict detected
- [ ] "Reload" option fetches latest from cluster
- [ ] "Compare" option shows diff view
- [ ] "Keep Local" option disables further checks
- [ ] Checks only run for focused editors with unsaved changes

## Dependencies

- Story 009 (Save integration) must be completed

