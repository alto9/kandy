---
story_id: create-operator-status-client
session_id: operator-presence-awareness-and-reporting
feature_id: [operator-presence-awareness]
spec_id: [operator-status-api-spec]
status: completed
priority: high
estimated_minutes: 25
---

## Objective

Create the `OperatorStatusClient` class that queries and caches operator status from the `kube9-operator-status` ConfigMap in the `kube9-system` namespace.

## Context

The extension needs a centralized client to query operator status with caching support. This client will be used by `ClusterTreeProvider` to determine operator presence and status for each cluster. The client implements the caching logic specified in the operator-status-api-spec.

## Implementation Steps

1. Create `src/services/OperatorStatusClient.ts` file
2. Define `OperatorStatus` interface matching the spec (mode, tier, version, health, lastUpdate, registered, error, clusterId?)
3. Define `CachedOperatorStatus` interface with status, timestamp, and mode fields
4. Implement `OperatorStatusClient` class with:
   - Private cache Map<string, CachedOperatorStatus> keyed by `<kubeconfigPath>:<contextName>`
   - CACHE_TTL_MS constant (5 minutes)
   - `getStatus()` method that checks cache, queries ConfigMap if needed, parses JSON, determines mode, and caches result
   - `clearCache()` method for specific cluster
   - `clearAllCache()` method
5. Implement status mode determination logic:
   - `basic`: ConfigMap not found (404)
   - `operated`: ConfigMap exists, mode="operated", tier="free", health="healthy"
   - `enabled`: ConfigMap exists, mode="enabled", tier="pro", registered=true, health="healthy"
   - `degraded`: ConfigMap exists but health="degraded" OR health="unhealthy" OR registered=false (when mode="enabled") OR timestamp is stale (>5 min)
6. Handle errors gracefully:
   - 404 errors → return basic status
   - Other errors → fall back to cache or basic status
   - Invalid JSON → log error, fall back to basic status

## Files Affected

- `src/services/OperatorStatusClient.ts` - Create new file with OperatorStatusClient class
- `src/services/index.ts` - Export OperatorStatusClient (if index file exists)

## Acceptance Criteria

- [ ] OperatorStatusClient class created with proper TypeScript interfaces
- [ ] Cache implementation works with 5-minute TTL
- [ ] Status mode determination logic correctly maps operator status to extension status
- [ ] 404 errors return basic status without crashing
- [ ] Other errors fall back to cache or basic status gracefully
- [ ] Invalid JSON parsing is handled gracefully
- [ ] Stale timestamp detection works (>5 minutes)
- [ ] Cache can be cleared per cluster or all at once
- [ ] Code follows existing project patterns and style

## Dependencies

- None (foundational component)

