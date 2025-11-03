---
story_id: tree-context-menu
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: [namespace-selection-state]
status: pending
priority: high
estimated_minutes: 25
---

# Tree View Context Menu for Namespace Selection

## Objective

Add right-click context menu actions to set or clear active namespace from the tree view.

## Context

Users need to be able to right-click on namespace items in the tree view to set them as active or clear the active selection. The menu items shown depend on whether the namespace is currently active.

## Implementation Steps

1. Register commands in `package.json`:
   - `kandy.setActiveNamespace` - Set namespace as active
   - `kandy.clearActiveNamespace` - Clear active namespace
2. Add menu contributions to `package.json` under `menus.view/item/context`:
   - Show "Set as Active Namespace" when `viewItem == namespace && !isActiveNamespace`
   - Show "Clear Active Namespace" when `viewItem == namespace && isActiveNamespace`
3. Implement command handlers in extension:
   - `setActiveNamespace` calls `setNamespace()`
   - `clearActiveNamespace` calls `clearNamespace()`
4. Refresh tree view after context changes
5. Show success/error notifications to user

## Files Affected

- `package.json` - Add command and menu contributions
- `src/extension.ts` - Register command handlers
- `src/commands/namespaceCommands.ts` - New file with command implementations

## Acceptance Criteria

- [ ] Right-click on namespace shows appropriate menu items
- [ ] "Set as Active Namespace" appears for inactive namespaces
- [ ] "Clear Active Namespace" appears for active namespace
- [ ] Clicking menu items successfully updates kubectl context
- [ ] Tree view refreshes after action
- [ ] User receives notification on success or error

## Dependencies

- kubectl-context-writer
- tree-namespace-indicator

