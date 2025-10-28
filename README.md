# Kandy

An AI-powered VS Code extension for Kubernetes cluster management that makes DevOps workflows conversational and intelligent.

![Kandy Logo](https://img.shields.io/badge/Status-MVP-blue) ![VS Code](https://img.shields.io/badge/VS%20Code-Extension-blue) ![Kubernetes](https://img.shields.io/badge/Kubernetes-Supported-blue)

## Overview

Kandy transforms Kubernetes management from complex command-line operations into an intuitive, AI-assisted experience. Built as a VS Code extension, Kandy brings the power of AI directly into your development environment for seamless cluster operations.

## MVP Features

### Core Functionality
- **kubeconfig File Support**: Import and manage multiple Kubernetes configurations
- **Multi-Cluster Management**: Switch between clusters with ease
- **Resource Visualization**: Real-time views of pods, services, deployments, and more

### AI-Powered Natural Language Queries
- **Conversational Interface**: Ask questions like "Show me pods using high CPU" or "Why is my deployment failing?"
- **Intelligent Insights**: Get AI-generated explanations and recommendations
- **Context-Aware Assistance**: AI understands your cluster state and provides relevant suggestions

## Architecture

```
kandy/
├── src/
│   ├── extension.ts        # Main extension entry point
│   ├── providers/          # Tree view and content providers
│   ├── services/           # Kubernetes and AI services
│   ├── commands/           # Command implementations
│   └── utils/              # Shared utilities
├── ai/                     # Glam context files
│   ├── contexts/           # Context definitions
│   ├── decisions/          # Architecture decisions
│   ├── features/           # Feature specifications
│   ├── specs/              # Technical specifications
│   └── tickets/            # Implementation tasks
└── out/                    # Compiled TypeScript output
```

## Getting Started

### Prerequisites
- Node.js 22+ (LTS recommended)
- npm or yarn
- kubectl configured for your clusters

### Installation

#### For Users

Install directly from the VS Code Marketplace:
1. Open VS Code
2. Go to Extensions (`Ctrl/Cmd + Shift + X`)
3. Search for "Kandy"
4. Click Install

#### For Developers

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kandy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile TypeScript**
   ```bash
   npm run compile
   ```

4. **Run extension in Development Mode**
   - Press `F5` in VS Code to open a new Extension Development Host window
   - Or run: `npm run watch` for automatic recompilation

5. **Package extension**
   ```bash
   npm run package
   ```
   This creates a `.vsix` file that can be installed locally or published to the marketplace.

### First Run

1. **Configure Authentication**
   - Get your API key from [Kandy Portal](https://portal.kandy.dev) or use development mode
   - Open VS Code settings (`Ctrl/Cmd + ,`)
   - Search for "Kandy" and configure your API key
   - Set server URL if using custom deployment

2. **Start Using Kandy**
   - The extension activates automatically when VS Code starts
   - Access Kandy features from the Activity Bar sidebar
   - Import your kubeconfig file using the command palette (`Ctrl/Cmd + Shift + P` → "Kandy: Import kubeconfig")
   - Select a cluster from the Kandy sidebar
   - Try AI analysis: "Show me resource usage" or "Check for issues"

### Authentication Setup

#### Getting an API Key
**Production**: Visit [portal.kandy.dev](https://portal.kandy.dev) to create an account and generate an API key.

**Development**: The extension can generate a development key for local testing:
```bash
# Generate development API key
npx kandy-dev-key generate
```

#### VS Code Configuration
Add to your VS Code settings (`settings.json`):
```json
{
  "kandy.apiKey": "kdy_prod_abc123def456",
  "kandy.serverUrl": "https://api.kandy.dev",
  "kandy.debugMode": false
}
```

#### Security Features
- **Automatic Token Refresh**: Extension handles JWT token renewal
- **Secure Storage**: API keys stored securely in VS Code's secret storage
- **Rate Limit Awareness**: Extension shows usage and limits in status bar
- **Offline Mode**: Basic functionality works without server connectivity

## Development Roadmap

### Phase 1 - MVP (Current)
- ✅ kubeconfig file support
- ✅ Basic cluster management
- ✅ Natural language AI queries
- ✅ Multi-cluster switching
- 🔄 Real-time resource monitoring

### Phase 2 - Enhanced AI
- 🤖 Advanced troubleshooting assistance
- 🤖 Configuration generation and validation
- 🤖 Security recommendations
- 🤖 Performance optimization suggestions

### Phase 3 - Enterprise Features
- 🔐 Advanced authentication methods (OIDC, certificates)
- 🔐 Multi-cloud support (AWS, Azure, GCP)
- 🔐 Team collaboration features
- 🔐 Audit logging and compliance
- ☁️ AWS CDK v2 Infrastructure as Code deployment

## AI Integration

Kandy uses AI to make Kubernetes management conversational:

### Example Queries
```
"Show me pods with high memory usage"
"Why is my nginx deployment failing?"
"Suggest resource limits for my Node.js app"
"Check security vulnerabilities"
"Compare resource usage between namespaces"
```

### AI Architecture
- **Natural Language Processing**: Convert plain English to kubectl commands
- **Context Awareness**: Understand cluster state and relationships
- **Intelligent Recommendations**: Suggest optimizations and fixes
- **Learning**: Improve responses based on user feedback

## Project Structure

This project uses the [Glam methodology](https://github.com/your-glam-repo) for context engineering:

- **`ai/contexts/`**: Define knowledge domains and information sources
- **`ai/decisions/`**: Architecture and design decisions
- **`ai/features/`**: Feature specifications with Gherkin scenarios
- **`ai/specs/`**: Technical specifications with Mermaid diagrams
- **`ai/tasks/`**: Implementation tasks and progress tracking

## Contributing

1. Check `ai/tasks/` for current priorities
2. Review `ai/decisions/` for architectural context
3. Follow specifications in `ai/specs/`
4. Update progress in `ai/tasks/`

## Technology Stack

- **Extension Framework**: VS Code Extension API
- **Language**: TypeScript (ES2020 target)
- **Runtime**: Node.js 22+ (LTS)
- **AI Integration**: Custom NLP + LLM integration via Kandy Server
- **Kubernetes**: Official client libraries (@kubernetes/client-node)
- **Build**: TypeScript compiler
- **Package Manager**: npm

**Note**: Requires Node.js 22 LTS or later for development. VS Code 1.80.0+ required for running the extension. Server infrastructure deployment uses AWS CDK v2 for Infrastructure as Code.

## License

MIT License - see LICENSE file for details

## Community

- [GitHub Issues](https://github.com/your-repo/kandy/issues)
- [Discussions](https://github.com/your-repo/kandy/discussions)
- [Documentation](https://docs.kandy.dev)

---

**Made with ❤️ for DevOps teams who love Kubernetes but hate complexity**