---
story_id: namespace-cache-implementation
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec]
model_id: [namespace-selection-state]
status: completed
priority: high
estimated_minutes: 30
---

# Namespace Selection Cache Implementation

## Objective

Implement a caching layer for namespace selection state with 5-second TTL and 30-second polling for external changes.

## Context

To minimize kubectl command overhead and improve performance, we cache the namespace context state. The cache expires after 5 seconds, and we poll every 30 seconds to detect external changes made by kubectl CLI.

## Implementation Steps

1. Create `src/services/namespaceCache.ts` file
2. Implement `NamespaceCache` class with:
   - Private cache storage using NamespaceSelectionCache interface
   - `getCachedContext()` method that returns cached state if valid
   - `setCachedContext(state)` method that updates cache with new state
   - `invalidateCache()` method that marks cache as invalid
   - TTL check logic (5000ms = 5 seconds)
3. Implement `NamespaceContextWatcher` class with:
   - Interval-based polling (every 30 seconds)
   - `startWatching()` method to begin polling
   - `stopWatching()` method to clean up interval
   - Event emission when external change detected
4. Integrate cache with kubectlContext utilities
5. Use VS Code's EventEmitter for change notifications

## Files Affected

- `src/services/namespaceCache.ts` - New cache implementation
- `src/utils/kubectlContext.ts` - Integrate cache into read operations

## Acceptance Criteria

- [ ] Cache returns valid state within 5-second TTL
- [ ] Cache invalidates after 5 seconds
- [ ] Manual cache invalidation works correctly
- [ ] Watcher polls every 30 seconds for external changes
- [ ] Watcher emits events when context changes externally
- [ ] Watcher can be started and stopped cleanly

## Dependencies

- kubectl-context-reader
- namespace-state-interfaces

