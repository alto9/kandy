---
story_id: implement-yaml-content-provider
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: completed
priority: high
estimated_minutes: 30
---

## Objective

Implement YAMLContentProvider class that fetches YAML content from Kubernetes cluster using kubectl commands.

## Context

The YAML editor needs to fetch current resource YAML from the cluster. This provider will use kubectl to retrieve the YAML content for any given resource.

## Implementation Steps

1. Create `src/yaml/YAMLContentProvider.ts` file
2. Implement YAMLContentProvider class with:
   - `fetchYAML(resource: ResourceIdentifier): Promise<string>` method
   - Build kubectl command based on resource type (namespaced vs cluster-scoped)
   - Use `kubectl get <kind> <name> -n <namespace> -o yaml` for namespaced resources
   - Use `kubectl get <kind> <name> -o yaml` for cluster-scoped resources
   - Execute kubectl using Node's `child_process.exec` wrapped in Promise
   - Handle stdout as YAML content
   - Parse stderr for error messages
3. Add error handling for:
   - kubectl not found
   - Resource not found
   - Permission denied
   - Cluster connection failures
4. Add proper TypeScript types and error classes

## Files Affected

- `src/yaml/YAMLContentProvider.ts` (new) - YAML fetching logic
- `src/yaml/YAMLEditorManager.ts` - Import and use content provider

## Acceptance Criteria

- [ ] YAMLContentProvider can fetch YAML for namespaced resources
- [ ] YAMLContentProvider can fetch YAML for cluster-scoped resources
- [ ] kubectl command construction handles both resource types correctly
- [ ] Error handling covers common failure scenarios
- [ ] Returns properly formatted YAML string

## Dependencies

- Story 001 (YAMLEditorManager core) must be completed

