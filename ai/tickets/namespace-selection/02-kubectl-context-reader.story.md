---
story_id: kubectl-context-reader
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
model_id: [namespace-selection-state]
status: completed
priority: high
estimated_minutes: 25
---

# kubectl Context Reader Utility

## Objective

Create a utility function to read the current namespace from kubectl context configuration.

## Context

This is the foundation for namespace selection - we need to read the currently active namespace from kubectl's context to display it in the UI. This uses kubectl's native context system rather than maintaining separate state.

## Implementation Steps

1. Create `src/utils/kubectlContext.ts` file
2. Implement `getCurrentNamespace()` function that:
   - Executes `kubectl config view --minify --output=jsonpath='{..namespace}'`
   - Parses the output (empty string means no namespace set)
   - Returns string | null (null for cluster-wide view)
3. Implement `getContextInfo()` function that:
   - Executes `kubectl config view --minify --output=json`
   - Parses JSON to extract context name, cluster name, and namespace
   - Returns KubectlContextState object
4. Add proper error handling for kubectl command failures
5. Add TypeScript types for return values

## Files Affected

- `src/utils/kubectlContext.ts` - New file with kubectl context reading functions

## Acceptance Criteria

- [ ] `getCurrentNamespace()` returns string when namespace is set in context
- [ ] `getCurrentNamespace()` returns null when no namespace is set
- [ ] `getContextInfo()` returns complete context state including context name and cluster
- [ ] Error handling catches kubectl command failures gracefully
- [ ] Functions properly handle empty/malformed kubectl output

## Dependencies

None - This is a foundational utility

