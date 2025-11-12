---
story_id: add-get-configmap-method
session_id: operator-presence-awareness-and-reporting
feature_id: [operator-presence-awareness]
spec_id: [operator-status-api-spec]
status: pending
priority: high
estimated_minutes: 20
---

## Objective

Add a `getConfigMap()` method to `ConfigurationCommands` class to retrieve a specific ConfigMap by name and namespace.

## Context

The `OperatorStatusClient` needs to query a specific ConfigMap (`kube9-operator-status` in `kube9-system` namespace). Currently, `ConfigurationCommands` only has `getConfigMaps()` which returns all ConfigMaps. We need a method to get a single ConfigMap by name and namespace.

## Implementation Steps

1. Open `src/kubectl/ConfigurationCommands.ts`
2. Add interface for ConfigMap response with data field:
   ```typescript
   interface ConfigMapResponse {
       metadata?: {
           name?: string;
           namespace?: string;
       };
       data?: {
           [key: string]: string;
       };
   }
   ```
3. Add interface for getConfigMap result:
   ```typescript
   export interface ConfigMapResult {
       configMap: ConfigMapResponse | null;
       error?: KubectlError;
   }
   ```
4. Add static method `getConfigMap()`:
   - Parameters: `name: string`, `namespace: string`, `kubeconfigPath: string`, `contextName: string`
   - Build kubectl command: `kubectl get configmap <name> --namespace=<namespace> --output=json --kubeconfig=<path> --context=<context>`
   - Execute with execFileAsync
   - Parse JSON response
   - Return ConfigMapResult with configMap or error
   - Handle 404 errors (ConfigMap not found) gracefully
   - Handle other kubectl errors using KubectlError.fromExecError()
5. Follow same error handling pattern as existing `getConfigMaps()` method

## Files Affected

- `src/kubectl/ConfigurationCommands.ts` - Add getConfigMap() method and interfaces

## Acceptance Criteria

- [ ] `getConfigMap()` method added to ConfigurationCommands class
- [ ] Method correctly queries specific ConfigMap by name and namespace
- [ ] Method handles 404 errors (ConfigMap not found) gracefully
- [ ] Method handles other kubectl errors using KubectlError
- [ ] Method follows same patterns as existing getConfigMaps() method
- [ ] Return type includes both configMap data and optional error
- [ ] Method works with different kubeconfig paths and contexts

## Dependencies

- None (can be done in parallel with story 001)

