---
story_id: webview-context-integration
session_id: namespace-selection
feature_id: [tree-view-navigation]
spec_id: [webview-spec]
model_id: [namespace-selection-state]
status: pending
priority: medium
estimated_minutes: 25
---

# Webview kubectl Context Integration

## Objective

Integrate webview with kubectl context updates to refresh resource data when namespace selection changes.

## Context

When the active namespace changes (either from the webview or elsewhere), the webview needs to refresh its resource data to show only resources in the selected namespace. This ensures the UI stays in sync with kubectl context.

## Implementation Steps

1. Add message handler for `namespaceContextChanged` in webview:
   - Update dropdown selection to match new namespace
   - Enable/disable clear button appropriately
   - Trigger resource data refresh
2. Implement resource query logic that respects namespace context:
   - Use kubectl context namespace for queries
   - Don't add explicit namespace flag (let kubectl use context)
3. Show loading state during resource refresh
4. Update resource list UI with filtered results
5. Handle case where no resources exist in selected namespace

## Files Affected

- `src/webview/main.js` - Handle context change messages and refresh data
- `src/webview/resourceList.js` - Update resource query logic
- `src/webview/webviewProvider.ts` - Send context change notifications

## Acceptance Criteria

- [ ] Webview updates dropdown when context changes
- [ ] Resource data refreshes automatically on context change
- [ ] Loading state is shown during refresh
- [ ] Resources are correctly filtered by active namespace
- [ ] Empty state is shown when no resources exist
- [ ] Clear button state updates correctly

## Dependencies

- webview-message-passing
- namespace-cache-implementation

