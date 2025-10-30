---
story_id: secrets
session_id: superfinalize-main-tree
feature_id: [tree-view-navigation]
spec_id: [tree-view-spec, webview-spec]
status: pending
priority: medium
estimated_minutes: 20
---

# Secrets Implementation

## Objective

Implement the Secrets subcategory to list all secrets across all namespaces with placeholder click handlers.

## Context

Secrets store sensitive data such as passwords and tokens. Users need to see all secrets in the cluster. At this stage, clicking a secret should not perform any action.

## Implementation Steps

1. Add logic to fetch secrets using `kubectl get secrets --all-namespaces --output=json`
2. Parse secrets and create tree items with namespace and type information
3. Display secret type (Opaque, kubernetes.io/service-account-token, etc.)
4. Show namespace context in the tree item label
5. Implement placeholder click handler (no-op)

## Files Affected

- `src/tree/categories/configuration/SecretsSubcategory.ts` - New file for secrets logic
- `src/kubectl/ConfigurationCommands.ts` - Add secrets kubectl operations

## Acceptance Criteria

- [ ] Expanding Secrets shows all secrets across all namespaces
- [ ] Secret names include namespace context (e.g., "default/db-password")
- [ ] Secret type is displayed (e.g., "Opaque")
- [ ] Clicking a secret performs no action (placeholder)
- [ ] kubectl errors are handled gracefully
- [ ] Sensitive data is never displayed in tree items

## Dependencies

- configuration-category-structure

