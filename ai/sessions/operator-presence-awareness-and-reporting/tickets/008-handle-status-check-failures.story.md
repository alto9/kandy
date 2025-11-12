---
story_id: handle-status-check-failures
session_id: operator-presence-awareness-and-reporting
feature_id: [operator-presence-awareness]
spec_id: [operator-status-api-spec]
status: pending
priority: high
estimated_minutes: 20
---

## Objective

Implement comprehensive error handling for operator status checks, including network errors, RBAC failures, and parsing errors.

## Context

The extension must handle various failure scenarios gracefully without crashing or showing error dialogs. Errors should be logged for debugging, and the extension should fall back to cached status or basic status.

## Implementation Steps

1. Open `src/tree/ClusterTreeProvider.ts`
2. Enhance `checkOperatorStatus()` method error handling:
   - Wrap status check in try-catch block
   - Handle network errors: log error, fall back to cached status or basic
   - Handle RBAC permission errors: log warning, fall back to cached status or basic
   - Handle cluster connectivity errors: log error, fall back to cached status or basic
   - Handle 404 errors (ConfigMap not found): this is expected, should return basic status (handled by OperatorStatusClient)
   - Handle JSON parsing errors: log error, fall back to cached status or basic
   - Ensure no error dialogs are shown to users
   - Use VS Code OutputChannel for logging errors
3. Open `src/services/OperatorStatusClient.ts`
4. Enhance error handling in `getStatus()` method:
   - Ensure all error paths return a valid CachedOperatorStatus
   - Log errors using console.error (will be captured by extension host)
   - Distinguish between expected errors (404) and unexpected errors
   - Validate JSON parsing with try-catch
   - Validate required fields in status JSON
5. Test error scenarios:
   - ConfigMap not found (404) → basic status
   - RBAC denied → fall back to cache or basic
   - Network error → fall back to cache or basic
   - Invalid JSON → fall back to cache or basic
   - Missing required fields → fall back to cache or basic

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Enhance error handling in checkOperatorStatus()
- `src/services/OperatorStatusClient.ts` - Enhance error handling in getStatus()

## Acceptance Criteria

- [ ] Network errors are handled gracefully without crashing
- [ ] RBAC permission errors are handled gracefully
- [ ] Cluster connectivity errors are handled gracefully
- [ ] 404 errors (ConfigMap not found) return basic status (expected behavior)
- [ ] JSON parsing errors are handled gracefully
- [ ] Missing required fields in status JSON are handled gracefully
- [ ] Errors are logged for debugging purposes
- [ ] No error dialogs are shown to users
- [ ] Extension falls back to cached status when available
- [ ] Extension falls back to basic status when no cache available

## Dependencies

- 001-create-operator-status-client (needs OperatorStatusClient error handling)
- 004-integrate-status-check-on-connection (needs checkOperatorStatus method)

