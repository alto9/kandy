---
story_id: add-api-key-settings
session_id: design-the-installation-and-setup-procedures-for-u
feature_id: [initial-configuration]
spec_id: []
model_id: []
status: completed
priority: medium
estimated_minutes: 20
---

## Objective

Create VS Code settings configuration for kube9 API key with clear documentation that it's optional and only needed for AI features.

## Context

Users need a way to configure their API key for AI-powered features. VS Code provides a settings system that integrates with its UI. The setting should clearly indicate it's optional and explain where to get a key. The key should be stored securely using VS Code's secret storage.

## Implementation Steps

1. Add configuration contribution in package.json under "contributes.configuration"
2. Create setting "kube9.apiKey" with type "string"
3. Add clear description: "Optional API key for AI-powered features. Get your key at portal.kube9.dev"
4. Mark setting as optional (not required for basic functionality)
5. Create `src/config/Settings.ts` helper to read configuration
6. Implement getApiKey() method that reads from VS Code settings
7. Add documentation link to setting description

## Files Affected

- `package.json` - Add configuration contributions
- `src/config/Settings.ts` - Create settings helper class

## Acceptance Criteria

- [ ] Setting appears in VS Code Settings UI under "kube9" section
- [ ] Setting description clearly states it's optional
- [ ] Description explains API key is for AI features only
- [ ] Description includes link to portal.kube9.dev
- [ ] getApiKey() successfully reads setting value
- [ ] Empty/undefined API key is handled gracefully
- [ ] Setting is searchable in VS Code settings search

## Dependencies

None (can be developed independently)

