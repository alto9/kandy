---
spec_id: operator-status-api-spec
feature_id: [operator-presence-awareness]
context_id: [kubernetes-cluster-management]
---

# Operator Status API Specification (Extension Side)

## Overview

This specification defines how the VS Code extension queries and interprets the kube9-operator status ConfigMap to determine cluster operator presence and status. The operator exposes its status through a Kubernetes ConfigMap that the extension reads to determine cluster tier and operator health.

## Related Specifications

This specification references the operator-side status API specification defined in `kube9-operator/ai/specs/api/status-api-spec.spec.md`. The extension consumes the status ConfigMap created by the operator.

## Status ConfigMap Details

### Resource Location

| Property | Value |
|----------|-------|
| Name | `kube9-operator-status` |
| Namespace | `kube9-system` |
| Type | ConfigMap |
| Update Frequency | Every 60 seconds (operator side) |
| Cache TTL | 5 minutes (extension side) |

### Data Schema

The ConfigMap contains a single key `status` with JSON-formatted data matching the operator's `OperatorStatus` interface:

```typescript
interface OperatorStatus {
  // Operator mode: "operated" (free) or "enabled" (pro)
  mode: "operated" | "enabled";
  
  // User-facing tier name
  tier: "free" | "pro";
  
  // Operator version (semver)
  version: string;
  
  // Health status
  health: "healthy" | "degraded" | "unhealthy";
  
  // ISO 8601 timestamp of last status update
  lastUpdate: string;
  
  // Whether operator is registered with kube9-server (pro tier only)
  registered: boolean;
  
  // Error message if unhealthy or degraded
  error: string | null;
  
  // Optional: Server-provided cluster ID (pro tier only)
  clusterId?: string;
}
```

## Extension Status Mapping

The extension maps the operator's status to one of four cluster operator statuses:

| Extension Status | Operator Condition | Icon |
|-----------------|-------------------|------|
| **basic** | ConfigMap does not exist (404) | Basic/minimal icon |
| **operated** | ConfigMap exists, `mode: "operated"`, `tier: "free"` | Operated/free tier icon |
| **enabled** | ConfigMap exists, `mode: "enabled"`, `tier: "pro"`, `registered: true`, `health: "healthy"` | Enabled/pro tier icon |
| **degraded** | ConfigMap exists, but `health: "degraded"` OR `health: "unhealthy"` OR `registered: false` (when `mode: "enabled"`) OR timestamp is stale (> 5 minutes) | Degraded/warning icon |

## Extension Query Implementation

### Status Client Interface

```typescript
interface CachedOperatorStatus {
  status: OperatorStatus | null;
  timestamp: number;
  mode: "basic" | "operated" | "enabled" | "degraded";
}

class OperatorStatusClient {
  private cache: Map<string, CachedOperatorStatus> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  
  async getStatus(
    kubeconfigPath: string,
    contextName: string,
    forceRefresh = false
  ): Promise<CachedOperatorStatus> {
    const cacheKey = `${kubeconfigPath}:${contextName}`;
    
    // Check cache
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
        return cached;
      }
    }
    
    // Query cluster
    try {
      const configMap = await ConfigurationCommands.getConfigMap(
        "kube9-operator-status",
        "kube9-system",
        kubeconfigPath,
        contextName
      );
      
      const status = JSON.parse(configMap.data.status) as OperatorStatus;
      
      // Validate status age
      const statusAge = Date.now() - new Date(status.lastUpdate).getTime();
      const isStale = statusAge > 5 * 60 * 1000; // 5 minutes
      
      // Determine extension status mode
      let mode: "basic" | "operated" | "enabled" | "degraded";
      
      if (isStale) {
        mode = "degraded";
      } else if (status.mode === "enabled" && status.registered && status.health === "healthy") {
        mode = "enabled";
      } else if (status.mode === "operated" && status.health === "healthy") {
        mode = "operated";
      } else {
        mode = "degraded";
      }
      
      const cached: CachedOperatorStatus = {
        status,
        timestamp: Date.now(),
        mode
      };
      
      this.cache.set(cacheKey, cached);
      return cached;
      
    } catch (error) {
      // Operator not installed
      if (error.code === 404 || error.message?.includes("NotFound")) {
        const cached: CachedOperatorStatus = {
          status: null,
          timestamp: Date.now(),
          mode: "basic"
        };
        this.cache.set(cacheKey, cached);
        return cached;
      }
      
      // Other errors - fall back to cache or basic
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }
      
      // No cache available - return basic status
      return {
        status: null,
        timestamp: Date.now(),
        mode: "basic"
      };
    }
  }
  
  clearCache(kubeconfigPath: string, contextName: string): void {
    const cacheKey = `${kubeconfigPath}:${contextName}`;
    this.cache.delete(cacheKey);
  }
  
  clearAllCache(): void {
    this.cache.clear();
  }
}
```

### kubectl Query Command

The extension uses kubectl to query the ConfigMap:

```bash
kubectl get configmap kube9-operator-status \
  --namespace=kube9-system \
  --kubeconfig=<kubeconfigPath> \
  --context=<contextName> \
  --output=json
```

### Error Handling

| Error Condition | Extension Behavior |
|----------------|-------------------|
| ConfigMap not found (404) | Return `mode: "basic"`, cache for 5 minutes |
| RBAC permission denied | Log warning, fall back to cached status or `mode: "basic"` |
| Network/connectivity error | Log error, fall back to cached status or `mode: "basic"` |
| Invalid JSON in ConfigMap | Log error, fall back to cached status or `mode: "basic"` |
| Missing required fields | Log error, fall back to cached status or `mode: "basic"` |
| Stale timestamp (> 5 min) | Return `mode: "degraded"` |

## Icon Mapping

The extension should use VS Code ThemeIcon for status icons:

| Status | Icon ID | Theme Color | Description |
|--------|---------|-------------|-------------|
| basic | `circle-outline` | Default | Basic/minimal icon |
| operated | `shield` | Default | Free tier icon |
| enabled | `verified` | `testing.iconPassed` | Pro tier icon |
| degraded | `warning` | `editorWarning.foreground` | Warning icon |

## Tooltip Format

The tooltip should display operator status information:

```
Cluster: <context-name>
Connection: <connected/disconnected>
Operator Status: <basic/operated/enabled/degraded>
Tier: <free/pro> (if available)
Version: <version> (if available)
Health: <healthy/degraded/unhealthy> (if available)
Last Update: <timestamp> (if available)
Error: <error-message> (if degraded/unhealthy)
```

## Cache Management

### Cache Invalidation

- Cache expires after 5 minutes (TTL)
- Cache cleared on manual refresh
- Cache cleared per cluster context independently
- Cache cleared when cluster context changes

### Cache Storage

- In-memory cache per cluster context
- Key format: `<kubeconfigPath>:<contextName>`
- No persistent storage (cleared on extension restart)

## Integration with ClusterTreeProvider

The `ClusterTreeProvider` should:

1. Check operator status when cluster is first displayed
2. Update cluster tree item icon based on operator status
3. Update cluster tree item tooltip with operator status information
4. Refresh operator status on manual refresh
5. Refresh operator status when cache expires (5 minutes)

## RBAC Requirements

### For Extension Users

Extension users (developers) only need read access to the ConfigMap:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: kube9-status-reader
  namespace: kube9-system
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  resourceNames: ["kube9-operator-status"]
  verbs: ["get"]
```

Most clusters grant this by default to authenticated users.

## Testing Considerations

### Unit Tests

- Parse valid status JSON
- Handle missing optional fields
- Detect stale status timestamps
- Cache expiry logic
- Error handling for invalid JSON
- Error handling for 404 (ConfigMap not found)
- Status mode determination logic

### Integration Tests

- Extension can read ConfigMap
- Status reflects operator state correctly
- Cache works per cluster context
- Cache expires after 5 minutes
- Manual refresh bypasses cache
- Error handling for RBAC failures
- Error handling for network failures

### End-to-End Tests

- Fresh install → status shows "basic"
- Operator installed (free tier) → status shows "operated"
- Operator installed (pro tier, registered) → status shows "enabled"
- Operator degraded → status shows "degraded"
- Stale status → status shows "degraded"
- Multiple clusters → each has independent status

