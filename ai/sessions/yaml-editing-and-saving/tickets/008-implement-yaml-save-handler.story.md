---
story_id: implement-yaml-save-handler
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: completed
priority: high
estimated_minutes: 30
---

## Objective

Implement YAMLSaveHandler that validates YAML, performs dry-run, and applies changes to cluster using kubectl.

## Context

When users save YAML changes, we need to: validate syntax, dry-run with kubectl, apply to cluster, and handle errors appropriately.

## Implementation Steps

1. Create `src/yaml/YAMLSaveHandler.ts` file
2. Implement YAMLSaveHandler class with:
   - `handleSave(document: TextDocument): Promise<boolean>` method
   - Call YAMLValidator.validateYAMLSyntax first
   - If syntax invalid, show error and return false
   - Execute `kubectl apply --dry-run=server -f -` with YAML as stdin
   - If dry-run fails, show kubectl error and return false
   - Execute `kubectl apply -f -` with YAML as stdin
   - If apply succeeds, show success message and return true
   - If apply fails, show error message and return false
3. Use child_process to execute kubectl commands
4. Pipe YAML content to stdin
5. Handle stdout/stderr appropriately
6. Show progress notification during save
7. Parse kubectl error messages for user-friendly display

## Files Affected

- `src/yaml/YAMLSaveHandler.ts` (new) - Save handling logic
- `src/yaml/Kube9YAMLFileSystemProvider.ts` - Call save handler on writeFile

## Acceptance Criteria

- [x] Syntax validation runs before dry-run
- [x] Dry-run validation prevents invalid changes
- [x] kubectl apply successfully applies valid changes
- [x] Error messages are user-friendly
- [x] Progress indicator shows during save
- [x] Success notification displayed on successful save

## Dependencies

- Story 007 (YAML syntax validation) must be completed

