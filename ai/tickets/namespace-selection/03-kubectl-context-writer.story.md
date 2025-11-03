---
story_id: kubectl-context-writer
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
model_id: [namespace-selection-state]
status: completed
priority: high
estimated_minutes: 20
---

# kubectl Context Writer Utility

## Objective

Create utility functions to set and clear the active namespace in kubectl context.

## Context

Users need to be able to change the active namespace from both the tree view and webview. These utilities execute kubectl commands to modify the context configuration, which persists globally in the kubeconfig file.

## Implementation Steps

1. Add to `src/utils/kubectlContext.ts` file
2. Implement `setNamespace(namespace: string)` function that:
   - Executes `kubectl config set-context --current --namespace=<namespace>`
   - Verifies the command succeeded
   - Returns success/failure status
3. Implement `clearNamespace()` function that:
   - Executes `kubectl config set-context --current --namespace=''`
   - Verifies the command succeeded
   - Returns success/failure status
4. Add proper error handling with descriptive error messages
5. Add validation for namespace parameter (non-empty string)

## Files Affected

- `src/utils/kubectlContext.ts` - Add namespace writer functions

## Acceptance Criteria

- [ ] `setNamespace()` successfully sets namespace in kubectl context
- [ ] `clearNamespace()` successfully clears namespace from kubectl context
- [ ] Both functions return success/failure status
- [ ] Error messages are descriptive and actionable
- [ ] Namespace parameter is validated before execution

## Dependencies

- kubectl-context-reader (should be in same file)

