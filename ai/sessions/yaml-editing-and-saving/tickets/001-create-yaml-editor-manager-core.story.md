---
story_id: create-yaml-editor-manager-core
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: completed
priority: high
estimated_minutes: 25
---

## Objective

Create the core YAMLEditorManager class that will manage YAML editor instances and coordinate between tree view, webviews, and VS Code's text editor system.

## Context

The YAML editor feature requires a central manager to orchestrate opening, tracking, and managing YAML editors for Kubernetes resources. This is the foundation that all other YAML editing functionality will build upon.

## Implementation Steps

1. Create `src/yaml/YAMLEditorManager.ts` file
2. Implement YAMLEditorManager class with:
   - Constructor accepting extension context
   - `openEditors` Map to track active editors by resource key
   - `openYAMLEditor(resource: ResourceIdentifier)` method (stub for now)
   - `getResourceKey(resource: ResourceIdentifier)` helper method
   - `dispose()` method for cleanup
3. Define `ResourceIdentifier` interface in the same file:
   ```typescript
   interface ResourceIdentifier {
     kind: string;
     name: string;
     namespace?: string;
     apiVersion: string;
     cluster: string;
   }
   ```
4. Register YAMLEditorManager in extension activation
5. Add proper TypeScript types and JSDoc comments

## Files Affected

- `src/yaml/YAMLEditorManager.ts` (new) - Core manager class
- `src/extension.ts` - Register manager on activation

## Acceptance Criteria

- [ ] YAMLEditorManager class exists and can be instantiated
- [ ] ResourceIdentifier interface properly typed
- [ ] Manager registered in extension activation
- [ ] TypeScript compiles without errors
- [ ] Basic structure in place for tracking open editors

## Dependencies

None - This is the foundation story

