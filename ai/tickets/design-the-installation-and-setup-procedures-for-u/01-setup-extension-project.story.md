---
story_id: setup-extension-project
session_id: design-the-installation-and-setup-procedures-for-u
feature_id: [initial-configuration]
spec_id: []
model_id: []
status: completed
priority: high
estimated_minutes: 25
---

## Objective

Create the foundational VS Code extension project structure with package.json, TypeScript configuration, and activation events.

## Context

This is the first story in implementing the initial-configuration feature. The extension needs a proper project structure that follows VS Code extension best practices and supports Node.js 22 LTS. This provides the foundation for all other components.

## Implementation Steps

1. Create `package.json` with extension metadata, activation events, and dependencies
   - Set name to "kandy"
   - Set displayName to "Kandy - Kubernetes Cluster Manager"
   - Add activation event: "onStartupFinished"
   - Add VS Code engine requirement: "^1.80.0"
   - Include main entry point: "./out/extension.js"
2. Create `tsconfig.json` for TypeScript compilation
   - Target ES2020
   - Set module to "commonjs"
   - Enable strict mode
   - Set outDir to "./out"
3. Create `.vscodeignore` to exclude unnecessary files from package
4. Create basic `src/extension.ts` with activate() and deactivate() stubs
5. Add development dependencies: @types/vscode, @types/node, typescript
6. Create npm scripts for compile, watch, and package

## Files Affected

- `package.json` - Create extension manifest
- `tsconfig.json` - Create TypeScript configuration
- `.vscodeignore` - Create package exclusion rules
- `src/extension.ts` - Create main extension entry point
- `.gitignore` - Add Node.js and VS Code specific ignores

## Acceptance Criteria

- [x] package.json contains valid extension metadata with correct activation events
- [x] TypeScript configuration compiles without errors
- [x] Extension entry point has proper activate() and deactivate() function signatures
- [x] VS Code recognizes the project as a valid extension
- [x] npm install completes successfully
- [x] npm run compile produces output in ./out directory

## Dependencies

None

