# Session: finalize-left-sidebar - Implementation Stories

## Overview
This session finalizes the left sidebar tree view by simplifying it from a deep hierarchy to a 2-level structure (Cluster → Namespaces) and switching from Kubernetes API to kubectl commands.

## Key Changes
- **Simplified Tree Structure**: From 4-level (Cluster → Namespace → Resource Type → Resources) to 2-level (Cluster → Namespaces)
- **kubectl Commands**: Replace Kubernetes API calls with kubectl command execution
- **Manual Refresh Only**: Remove automatic watch/polling, require user-triggered refresh
- **Webview Navigation**: Open webviews when namespaces are clicked for resource navigation
- **All Namespaces**: Special first item under each cluster for cluster-wide view

## Implementation Stories (12 total)

### Core Infrastructure (Stories 1-3)
1. **kubectl-cluster-connectivity** (25 min) - Use kubectl for cluster connectivity checks
2. **simplify-tree-structure** (30 min) - Remove deep hierarchy, keep only 2 levels
3. **kubectl-namespace-query** (25 min) - Query namespaces using kubectl

### User Features (Stories 4-5, 7)
4. **all-namespaces-item** (20 min) - Add "All Namespaces" special tree item
5. **namespace-click-handler** (30 min) - Open webview when namespace is clicked
7. **manual-refresh-command** (25 min) - Add user-triggered refresh command

### Removal/Cleanup (Stories 6, 11)
6. **remove-watch-logic** (20 min) - Remove automatic updates and Kubernetes watch APIs
11. **remove-status-calculations** (15 min) - Remove resource status calculation code

### Error Handling (Story 8)
8. **kubectl-error-handling** (25 min) - Graceful error handling for kubectl failures

### Webview Integration (Story 9)
9. **update-webview-factory-namespace** (30 min) - Update webview factory for namespace webviews

### Data Model (Story 10)
10. **update-tree-item-metadata** (15 min) - Simplify tree item metadata structure

### Testing (Story 12)
12. **update-tree-view-tests** (30 min) - Update tests for new tree structure

## Total Estimated Time
290 minutes (~4.8 hours)

## Implementation Order

### Phase 1: Foundation (Stories 1-3)
Start with core infrastructure changes to kubectl and tree structure.

### Phase 2: Tree Features (Stories 4, 10)
Add namespace-specific features and update data structures.

### Phase 3: Cleanup (Stories 6, 11)
Remove old automatic update and resource status code.

### Phase 4: User Interaction (Stories 5, 7, 8)
Implement user-facing features and error handling.

### Phase 5: Webview (Story 9)
Update webview factory for namespace navigation.

### Phase 6: Testing (Story 12)
Update all tests to cover new behavior.

## Dependencies

```
1-kubectl-cluster-connectivity
  ├─> 3-kubectl-namespace-query
  │    ├─> 4-all-namespaces-item
  │    │    └─> 5-namespace-click-handler
  │    ├─> 7-manual-refresh-command
  │    └─> 8-kubectl-error-handling
  └─> 6-remove-watch-logic
       └─> 7-manual-refresh-command

2-simplify-tree-structure
  ├─> 4-all-namespaces-item
  ├─> 10-update-tree-item-metadata
  └─> 11-remove-status-calculations

9-update-webview-factory-namespace (parallel with 5)
  └─> 5-namespace-click-handler

12-update-tree-view-tests (depends on all others)
```

## Files Affected

### Primary Implementation Files
- Tree data provider
- Tree item data types
- kubectl command execution utility
- Webview panel factory
- Command registration (package.json)

### Test Files
- Tree provider tests
- Tree item tests
- kubectl execution tests

## Changed Session Files
All stories implement changes specified in:
- `ai/specs/tree-view-spec.spec.md`
- `ai/features/navigation/tree-view-navigation.feature.md`
- `ai/specs/webview-spec.spec.md`
- `ai/contexts/kubernetes-cluster-management.context.md`
- `ai/contexts/vscode-extension-development.context.md`

