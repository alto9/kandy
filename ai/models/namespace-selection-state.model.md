---
model_id: namespace-selection-state
---

# Namespace Selection State Model

## Overview

The namespace selection state tracks the currently active namespace for kubectl operations. This state is managed through kubectl's context system rather than maintaining a separate state layer.

## Data Structure

### KubectlContextState

Represents the current namespace selection as managed by kubectl context.

```typescript
interface KubectlContextState {
  // The currently selected namespace from kubectl context
  // null indicates no namespace is set (cluster-wide view)
  currentNamespace: string | null;
  
  // The current kubectl context name
  contextName: string;
  
  // The cluster associated with the current context
  clusterName: string;
  
  // Timestamp of last context read
  lastUpdated: Date;
  
  // Whether the context was set by this extension or externally
  source: 'extension' | 'external';
}
```

### NamespaceSelectionCache

Cached representation of namespace selection to minimize kubectl calls.

```typescript
interface NamespaceSelectionCache {
  // Cached kubectl context state
  contextState: KubectlContextState;
  
  // Time-to-live for cache (in milliseconds)
  ttl: number;
  
  // Whether cache is valid
  isValid: boolean;
}
```

## State Management

### Reading Current Namespace

To read the current namespace from kubectl context:
```bash
kubectl config view --minify --output=jsonpath='{..namespace}'
```

If empty or no output, no namespace is set in context (cluster-wide view).

### Setting Namespace in Context

To set a namespace as active:
```bash
kubectl config set-context --current --namespace=<namespace-name>
```

This updates the kubeconfig file and affects all subsequent kubectl operations.

### Clearing Namespace Selection

To clear the namespace and return to cluster-wide view:
```bash
kubectl config set-context --current --namespace=''
```

### Reading Context Information

To get full context information:
```bash
kubectl config view --minify --output=json
```

This returns the current context, cluster, and namespace information.

## State Persistence

- **Location**: State persists in the user's kubeconfig file (typically `~/.kube/config`)
- **Scope**: Global to kubectl, affects all tools using kubectl
- **Durability**: Persists across VS Code restarts and system reboots
- **Synchronization**: Changes made outside VS Code are reflected automatically

## Caching Strategy

### Cache Invalidation

- Cache expires after 5 seconds (5000ms TTL)
- Cache invalidated when extension makes context changes
- Cache can be manually invalidated by refresh command

### Cache Benefits

- Reduces kubectl command execution overhead
- Improves UI responsiveness
- Minimizes file system reads of kubeconfig

### External Changes Detection

- Extension should periodically check for external context changes
- When external changes detected, update UI accordingly
- Show notification to user if namespace context changed externally

## Namespace Scope Behavior

### Namespace-Scoped Resources

When a namespace is set in context, these resources are automatically filtered:
- Pods
- Deployments
- StatefulSets
- DaemonSets
- Services
- ConfigMaps
- Secrets
- PersistentVolumeClaims
- Jobs
- CronJobs

### Cluster-Scoped Resources

These resources ignore namespace context:
- Nodes
- PersistentVolumes
- StorageClasses
- CustomResourceDefinitions (CRDs)
- ClusterRoles
- ClusterRoleBindings

### Special Views

For "All Namespaces" view in UI:
- Explicitly use `--all-namespaces` flag on queries
- Do not modify kubectl context
- Display resources across all namespaces

## UI State Synchronization

### Tree View Updates

When namespace context changes:
1. Read new context state from kubectl
2. Update cache with new state
3. Refresh tree view to show active namespace indicator
4. Update status bar with current namespace

### Webview Updates

When namespace context changes:
1. Notify all open webviews of context change
2. Webviews re-query resources with new context
3. Update namespace selector dropdown to reflect current selection

## Error Handling

### kubectl Command Failures

- If kubectl config read fails, show error and use cached state
- If kubectl config write fails, show error and rollback UI
- Provide clear error messages to user

### Invalid Namespace

- If user selects namespace that doesn't exist, kubectl will set it anyway
- Subsequent queries will fail with "namespace not found"
- Show warning to user and suggest clearing selection

### Context Not Set

- If no kubectl context is configured, disable namespace selection
- Show message prompting user to configure kubectl context
- Provide link to kubectl configuration documentation

## Implementation Notes

### Extension Context Storage

While kubectl manages the actual state, the extension may cache:
- Last known context state (for performance)
- User preference for automatic context detection
- Warning dismissal flags

These are stored in `ExtensionContext.globalState` but are NOT the source of truth.

### Performance Considerations

- Minimize kubectl command executions
- Use caching aggressively with reasonable TTL
- Batch context reads with other kubectl operations when possible
- Debounce rapid context changes to avoid command spam

### Security Considerations

- kubectl context changes affect all kubectl operations globally
- Warn user about global scope of context changes
- Do not expose kubeconfig file contents in UI
- Respect RBAC permissions for namespace access

