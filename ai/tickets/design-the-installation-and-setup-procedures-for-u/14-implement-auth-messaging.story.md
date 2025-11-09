---
story_id: implement-auth-messaging
session_id: design-the-installation-and-setup-procedures-for-u
feature_id: [initial-configuration]
spec_id: []
model_id: []
status: completed
priority: medium
estimated_minutes: 20
---

## Objective

Add UI messaging throughout the extension explaining when and why API keys are needed (for AI features only).

## Context

Users should understand they can use the extension's core features (cluster viewing, resource navigation) without authentication. API keys are only required for AI-powered recommendations. Clear, contextual messaging prevents confusion and reduces setup friction.

## Implementation Steps

1. Add status bar item showing authentication status (optional)
2. Create placeholder message in tree view when no API key is configured:
   - "Configure API key to enable AI recommendations"
3. Add command "kube9: Configure API Key" that opens settings
4. Register command in package.json
5. Add click handler on auth messages that opens settings
6. Ensure messaging doesn't block core functionality
7. Add tooltip explaining AI features require authentication

## Files Affected

- `src/tree/ClusterTreeProvider.ts` - Add auth status messaging in tree
- `src/commands/ConfigureApiKey.ts` - Create settings command
- `package.json` - Register configure API key command
- `src/extension.ts` - Register command in activate()

## Acceptance Criteria

- [ ] Auth status is visible but non-intrusive in UI
- [ ] Message clearly states "API key needed for AI features only"
- [ ] Clicking on auth message opens VS Code settings to kube9.apiKey
- [ ] Command palette includes "kube9: Configure API Key" command
- [ ] Core features work without API key configured
- [ ] Messaging doesn't repeatedly interrupt user workflow
- [ ] Tooltips provide helpful context about authentication

## Dependencies

- create-tree-provider

