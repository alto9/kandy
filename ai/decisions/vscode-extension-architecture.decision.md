---
decision_id: vscode-extension-architecture
date: 2025-01-22
status: implemented
---

# VS Code Extension Architecture Decision

## Context

We need to decide on the architecture for the Kandy VS Code extension, including how to handle UI, cluster communication, and AI integration.

## Decision

Implement Kandy as a VS Code extension using the hybrid architecture pattern with targeted AI recommendations rather than a general chat interface.

## Rationale

### VS Code Extension Benefits
- **Native Integration**: Leverages existing VS Code Kubernetes tooling ecosystem
- **Familiar UX**: Follows established patterns from Kubernetes extension and file explorer
- **No Context Switching**: Developers stay in their development environment
- **Extensible**: Easy to add features through VS Code's rich API

### Targeted AI vs Chat Interface
- **Less Overwhelming**: Contextual suggestions appear when relevant rather than requiring user queries
- **Higher Adoption**: Developers more likely to act on specific, actionable recommendations
- **Better Signal-to-Noise**: Avoids generic chat responses that may not be relevant
- **Native Integration**: Feels like enhanced VS Code rather than a separate tool

### Architecture Pattern
- **Tree View**: Left sidebar for cluster navigation (familiar pattern)
- **Webview Panels**: Context-sensitive detailed views for selected resources
- **YAML Integration**: Show YAML as supporting content, not primary interface
- **AI Integration**: Contextual recommendations in webview panels and problems panel

## Alternatives Considered

### 1. Standalone Electron App
**Rejected** because:
- Creates workflow fragmentation between code editing and cluster management
- Requires context switching between tools
- Harder to provide real-time YAML validation and suggestions
- Less discoverable and requires separate installation

### 2. General Chat Interface
**Rejected** because:
- Overwhelming in VS Code environment
- Users don't know what to ask
- Takes significant screen space
- Less actionable than targeted suggestions
- Harder to integrate naturally with development workflow

### 3. Web-based Application
**Rejected** because:
- Requires separate browser window/process
- Less integrated with development workflow
- Harder to provide real-time file system integration
- Distribution and updates more complex

## Implementation Approach

### Phase 1: Core Extension
1. Tree view with cluster navigation
2. Webview panels for resource details
3. Basic cluster state monitoring
4. YAML display integration

### Phase 2: Enhanced Functionality
1. Real-time updates and WebSocket connections
2. Quick actions and resource management
3. YAML editing integration
4. Search and filtering capabilities

### Phase 3: AI Integration
1. Contextual AI recommendations in webview panels
2. Problems panel integration with AI insights
3. Quick fix actions for AI suggestions
4. Intelligent YAML validation and suggestions

## Consequences

### Positive
- **Seamless Integration**: Works naturally with existing Kubernetes development workflow
- **Familiar Patterns**: Uses established VS Code UI patterns for better adoption
- **Extensible Foundation**: Architecture supports easy addition of AI features
- **Better UX**: Targeted recommendations more actionable than general chat

### Negative
- **Extension Size**: Need to manage bundle size for VS Code marketplace
- **Performance**: Real-time cluster monitoring requires efficient implementation
- **Complexity**: More complex than simple chat interface
- **Distribution**: Requires VS Code marketplace approval and updates

## Related Decisions
- [Hybrid AI Architecture](ai/decisions/hybrid-ai-architecture.decision.md)
- [Data Collection Strategy](ai/decisions/data-collection-strategy.decision.md)
- [Security Model](ai/decisions/security-model.decision.md)
