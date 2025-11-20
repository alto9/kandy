---
story_id: add-tree-view-context-menu
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec, tree-view-spec]
status: completed
priority: high
estimated_minutes: 20
---

## Objective

Add "View YAML" context menu option to tree view resources with proper command registration.

## Context

Users should be able to right-click on Kubernetes resources in the tree view (Deployments, Pods, Services, etc.) and select "View YAML" to open the YAML editor.

## Implementation Steps

1. Add command to `package.json`:
   ```json
   {
     "command": "kube9.viewResourceYAML",
     "title": "View YAML",
     "category": "Kube9"
   }
   ```
2. Add context menu contribution to `package.json`:
   ```json
   "menus": {
     "view/item/context": [
       {
         "command": "kube9.viewResourceYAML",
         "when": "view == kube9TreeView && viewItem =~ /^resource/",
         "group": "kube9@1"
       }
     ]
   }
   ```
3. Update tree item creation to set `contextValue = 'resource:<kind>'` for resources
4. Register command handler in `extension.ts`:
   - Extract resource info from tree item
   - Call `yamlEditorManager.openYAMLEditor(resource)`
5. Handle command execution errors with user-friendly messages

## Files Affected

- `package.json` - Add command and menu contribution
- `src/extension.ts` - Register command handler
- `src/tree/TreeProvider.ts` - Set contextValue on resource tree items

## Acceptance Criteria

- [ ] "View YAML" appears in context menu for resources
- [ ] "View YAML" does NOT appear for non-resource items (categories, etc.)
- [ ] Clicking "View YAML" opens YAML editor for that resource
- [ ] Command properly extracts resource information from tree item
- [ ] Error messages displayed if opening fails

## Dependencies

- Story 004 (Open YAML editor) must be completed

