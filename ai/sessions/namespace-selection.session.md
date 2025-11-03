---
session_id: namespace-selection
start_time: '2025-11-03T15:53:23.111Z'
status: awaiting_implementation
problem_statement: namespace selection
changed_files:
  - ai/models/namespace-selection-state.model.md
  - ai/features/navigation/tree-view-navigation.feature.md
  - ai/specs/tree-view-spec.spec.md
  - ai/specs/webview-spec.spec.md
  - ai/contexts/kubernetes-cluster-management.context.md
end_time: '2025-11-03T16:23:29.933Z'
command_file: .cursor/commands/create-stories-namespace-selection.md
---
## Problem Statement

namespace selection

## Goals

To be able to select a namespace to narrow down the results of queries 

## Approach

Add 2 options within the interface, either in a context menu from the tree, or from a dropdown control in the namespace webview. The implementation leverages kubectl's native context system to manage namespace selection, using `kubectl config set-context --current --namespace=<namespace>` to set the active namespace and reading it via `kubectl config view --minify`. This ensures namespace filtering is handled by kubectl itself rather than building a separate state management layer.

## Key Decisions

Use kubectl's native context system for namespace management rather than building a separate state layer. This means:
- Setting namespace uses `kubectl config set-context --current --namespace=<namespace>`
- Reading namespace uses `kubectl config view --minify --output=jsonpath='{..namespace}'`
- Changes affect kubectl globally (not just within VS Code)
- State persists automatically via kubeconfig file
- Must cache context state to minimize kubectl command overhead


## Notes

This won't apply to un-namespaced items such as nodes.
