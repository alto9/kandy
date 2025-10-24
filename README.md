# Kandy

An AI-powered desktop application for Kubernetes cluster management that makes DevOps workflows conversational and intelligent.

![Kandy Logo](https://img.shields.io/badge/Status-MVP-blue) ![Electron](https://img.shields.io/badge/Electron-25.0.0-green) ![Kubernetes](https://img.shields.io/badge/Kubernetes-Supported-blue)

## Overview

Kandy transforms Kubernetes management from complex command-line operations into an intuitive, AI-assisted experience. Built with Electron for cross-platform compatibility, Kandy brings the power of AI to your desktop for seamless cluster operations.

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
│   ├── main/           # Electron main process
│   ├── renderer/       # React frontend
│   ├── ai/            # AI integration layer
│   └── shared/        # Shared utilities
├── ai/                # Glam context files
│   ├── contexts/      # Context definitions
│   ├── decisions/     # Architecture decisions
│   ├── features/      # Feature specifications
│   ├── specs/         # Technical specifications
│   └── tasks/         # Implementation tasks
└── docs/              # Documentation
```

## Getting Started

### Prerequisites
- Node.js 22+ (LTS recommended)
- npm or yarn
- kubectl configured for your clusters

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kandy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm run package
   ```

### First Run

1. **Configure Authentication**
   - Get your API key from [Kandy Portal](https://portal.kandy.dev) or use development mode
   - Open VS Code settings (`Ctrl/Cmd + ,`)
   - Search for "Kandy" and configure your API key
   - Set server URL if using custom deployment

2. **Launch Kandy**
   - Import your kubeconfig file (File → Import kubeconfig)
   - Select a cluster from the sidebar
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

- **Frontend**: React + TypeScript
- **Backend**: Electron main process with Node.js 22+ (LTS)
- **AI Integration**: Custom NLP + LLM integration via Kandy Server
- **Kubernetes**: Official client libraries
- **Styling**: Tailwind CSS / shadcn/ui
- **State Management**: Zustand / Redux Toolkit
- **Build**: Vite + electron-builder

**Note**: Requires Node.js 22 LTS or later for both development and runtime. Production deployment uses AWS CDK v2 for Infrastructure as Code.

## License

MIT License - see LICENSE file for details

## Community

- [GitHub Issues](https://github.com/your-repo/kandy/issues)
- [Discussions](https://github.com/your-repo/kandy/discussions)
- [Documentation](https://docs.kandy.dev)

---

**Made with ❤️ for DevOps teams who love Kubernetes but hate complexity**