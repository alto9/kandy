---
story_id: implement-custom-uri-scheme
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: pending
priority: high
estimated_minutes: 25
---

## Objective

Implement custom URI scheme `kube9-yaml://` for YAML editor documents to enable proper VS Code integration with save functionality.

## Context

VS Code requires custom URI schemes to be handled by FileSystemProvider. This allows us to intercept save operations and apply YAML changes back to the cluster.

## Implementation Steps

1. Create `src/yaml/Kube9YAMLFileSystemProvider.ts` file
2. Implement class that implements `vscode.FileSystemProvider` interface:
   - `readFile(uri: Uri): Promise<Uint8Array>` - fetch YAML using YAMLContentProvider
   - `writeFile(uri: Uri, content: Uint8Array)` - stub for now (will implement save later)
   - `stat(uri: Uri): Promise<FileStat>` - return basic file stats
   - Other required FileSystemProvider methods (minimal implementations)
3. Create `parseResourceFromUri(uri: Uri): ResourceIdentifier` helper function
4. Create `createResourceUri(resource: ResourceIdentifier): Uri` helper function
5. URI format: `kube9-yaml://<cluster>/<namespace>/<kind>/<name>.yaml`
6. Register file system provider in extension activation
7. Add proper TypeScript types

## Files Affected

- `src/yaml/Kube9YAMLFileSystemProvider.ts` (new) - Custom file system provider
- `src/yaml/YAMLEditorManager.ts` - Use custom URI for opening editors
- `src/extension.ts` - Register file system provider

## Acceptance Criteria

- [ ] Custom URI scheme `kube9-yaml://` registered with VS Code
- [ ] Can parse resource information from URI
- [ ] Can create URI from resource identifier
- [ ] readFile works and returns YAML content
- [ ] VS Code can open documents with custom URI scheme

## Dependencies

- Story 002 (YAMLContentProvider) must be completed

