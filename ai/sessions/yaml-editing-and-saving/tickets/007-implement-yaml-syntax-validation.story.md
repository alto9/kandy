---
story_id: implement-yaml-syntax-validation
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: completed
priority: high
estimated_minutes: 20
---

## Objective

Implement YAML syntax validation that runs before attempting to save changes to the cluster.

## Context

Before applying YAML to the cluster, we need to validate that the YAML syntax is correct. This prevents kubectl errors for basic syntax issues.

## Implementation Steps

1. Add `js-yaml` package to dependencies
2. Create `src/yaml/YAMLValidator.ts` file
3. Implement `validateYAMLSyntax(content: string)` function:
   - Use `yaml.load(content)` from js-yaml
   - Catch `YAMLException` errors
   - Return validation result with success/failure and error details
   - Extract line number and column from error if available
4. Create validation result interface:
   ```typescript
   interface ValidationResult {
     valid: boolean;
     error?: string;
     line?: number;
     column?: number;
   }
   ```
5. Add unit tests for validation with valid and invalid YAML

## Files Affected

- `package.json` - Add js-yaml dependency
- `src/yaml/YAMLValidator.ts` (new) - Syntax validation logic
- `src/yaml/YAMLSaveHandler.ts` (prep for next story) - Will use validator

## Acceptance Criteria

- [x] validateYAMLSyntax correctly identifies valid YAML
- [x] validateYAMLSyntax correctly identifies invalid YAML
- [x] Error messages include line and column information
- [x] Returns structured validation result
- [x] js-yaml dependency properly installed (was already installed)

## Dependencies

None - Can be implemented in parallel with stories 001-006

