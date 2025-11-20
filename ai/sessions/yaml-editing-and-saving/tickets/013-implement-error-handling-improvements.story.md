---
story_id: implement-error-handling-improvements
session_id: yaml-editing-and-saving
feature_id: [yaml-editor]
spec_id: [yaml-editor-spec]
status: completed
priority: medium
estimated_minutes: 20
---

## Objective

Improve error handling throughout YAML editor to provide user-friendly messages for common failure scenarios.

## Context

kubectl can fail in various ways (connection issues, permission errors, resource not found, etc.). We should parse these errors and show helpful messages to users.

## Implementation Steps

1. Create `src/yaml/ErrorHandler.ts` utility file
2. Implement `parseKubectlError(stderr: string): string` function that:
   - Detects "connection refused" → "Failed to connect to cluster"
   - Detects "Unauthorized" or "Forbidden" → "Insufficient permissions"
   - Detects "NotFound" → "Resource not found (may have been deleted)"
   - Detects other patterns and provides friendly messages
   - Falls back to showing kubectl's error message
3. Create `showErrorWithDetails` helper that shows error with "View Details" button
4. When "View Details" clicked, show full error in output channel
5. Apply error handling to:
   - YAML fetch failures
   - Save failures
   - Permission check failures
   - kubectl not found scenarios
6. Add retry button for transient failures (connection issues)

## Files Affected

- `src/yaml/ErrorHandler.ts` (new) - Error parsing and display
- `src/yaml/YAMLContentProvider.ts` - Use error handler
- `src/yaml/YAMLSaveHandler.ts` - Use error handler
- `src/yaml/PermissionChecker.ts` - Use error handler

## Acceptance Criteria

- [x] Common kubectl errors parsed to friendly messages
- [x] "View Details" button shows full error
- [x] Output channel used for detailed error logs
- [x] Retry button available for transient failures
- [x] Connection errors clearly identified
- [x] Permission errors clearly identified
- [x] Resource not found errors clearly identified

## Dependencies

None - Can be implemented in parallel and integrated at any time

