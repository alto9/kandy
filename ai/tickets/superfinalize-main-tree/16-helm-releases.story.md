---
story_id: helm-releases
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: completed
priority: medium
estimated_minutes: 25
---

# Helm Releases Implementation

## Objective

Implement the Helm category to list all installed helm releases with placeholder click handlers.

## Context

Helm is a package manager for Kubernetes. Users need to see all installed helm releases. At this stage, clicking a helm release should not perform any action.

## Implementation Steps

1. Add logic to fetch helm releases using `helm list --all-namespaces --output=json`
2. Parse helm releases and create tree items with release information
3. Display release status (deployed, failed, pending, etc.)
4. Show chart version and namespace information
5. Implement placeholder click handler (no-op)

## Files Affected

- `src/tree/categories/HelmCategory.ts` - New file for helm category logic
- `src/kubectl/HelmCommands.ts` - New file for helm CLI operations

## Acceptance Criteria

- [ ] Expanding Helm category shows all helm releases across all namespaces
- [ ] Release names include namespace context (e.g., "default/my-release")
- [ ] Chart name and version are displayed (e.g., "nginx-1.2.3")
- [ ] Release status is visible (deployed, failed, etc.)
- [ ] Clicking a helm release performs no action (placeholder)
- [ ] Gracefully handles when helm CLI is not available

## Dependencies

- resource-category-foundation

