---
story_id: implement-post-save-refresh
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: completed
priority: medium
estimated_minutes: 15
---

## Objective

Implement automatic refresh of tree view and webviews after successfully saving YAML changes to keep UI in sync with cluster state.

## Context

After YAML changes are applied to the cluster, the tree view and any open webviews should refresh to reflect the new state.

## Implementation Steps

1. Create `src/yaml/RefreshCoordinator.ts` file
2. Implement `coordinateRefresh(resource: ResourceIdentifier)` method:
   - Trigger tree view refresh via command or event
   - Find open webviews for the affected namespace
   - Send refresh message to those webviews
   - Show brief success notification
3. In `YAMLSaveHandler`, call `refreshCoordinator.coordinateRefresh` after successful save
4. Handle refresh errors gracefully (don't block save completion)
5. Consider debouncing multiple rapid saves

## Files Affected

- `src/yaml/RefreshCoordinator.ts` (new) - Coordinate UI refreshes
- `src/yaml/YAMLSaveHandler.ts` - Call refresh coordinator
- `src/tree/TreeProvider.ts` - Expose refresh method
- `src/webview/NamespaceWebviewProvider.ts` - Handle refresh messages

## Acceptance Criteria

- [x] Tree view refreshes after successful YAML save
- [x] Open webviews refresh after successful save
- [x] Refresh happens automatically without user action
- [x] Refresh errors don't prevent save from completing
- [x] Success notification includes resource name

## Dependencies

- Story 009 (Save integration) must be completed

