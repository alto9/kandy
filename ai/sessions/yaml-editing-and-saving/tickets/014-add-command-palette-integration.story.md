---
story_id: add-command-palette-integration
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: pending
priority: low
estimated_minutes: 25
---

## Objective

Add "Kube9: View Resource YAML" command to command palette that shows a quick pick list of resources and opens YAML editor for the selected one.

## Context

Users should be able to open YAML editors via the command palette (Ctrl+Shift+P / Cmd+Shift+P) in addition to tree view context menu and webview buttons.

## Implementation Steps

1. Add command to `package.json`:
   ```json
   {
     "command": "kube9.viewResourceYAMLFromPalette",
     "title": "View Resource YAML",
     "category": "Kube9"
   }
   ```
2. Register command handler in `extension.ts`
3. Implement quick pick flow:
   - Show namespace quick pick first (or "All Namespaces")
   - Query resources in selected namespace using kubectl
   - Show resource kind quick pick (Deployment, Pod, Service, etc.)
   - Show resource name quick pick
   - Call `yamlEditorManager.openYAMLEditor` with selected resource
4. Handle cancellation at any step
5. Show loading indicator while querying resources
6. Cache resource lists briefly to avoid repeated kubectl calls

## Files Affected

- `package.json` - Add command
- `src/extension.ts` - Register command handler
- `src/yaml/ResourceQuickPick.ts` (new) - Quick pick logic

## Acceptance Criteria

- [ ] Command appears in command palette
- [ ] Quick pick flow shows namespace selection
- [ ] Quick pick flow shows resource kind selection
- [ ] Quick pick flow shows resource name selection
- [ ] Selected resource opens in YAML editor
- [ ] Can cancel at any step
- [ ] Loading indicators shown during queries

## Dependencies

- Story 004 (Open YAML editor) must be completed

