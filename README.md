# Kandy

**Visual Kubernetes Management for VS Code with AI-Powered Insights**

![Kandy Logo](https://img.shields.io/badge/Status-MVP-blue) ![VS Code](https://img.shields.io/badge/VS%20Code-Extension-blue) ![Kubernetes](https://img.shields.io/badge/Kubernetes-Supported-blue)

## Overview

Kandy is a VS Code extension that brings visual Kubernetes cluster management directly into your development environment. Start with powerful free features, then unlock advanced AI-powered insights and rich dashboards with a Pro account.

### Freemium Model

**Free Tier** - Visual kubectl replacement:
- ✅ Tree view cluster navigation
- ✅ Resource detail viewer (form + YAML)
- ✅ Edit and save resources to cluster
- ✅ Launch workloads with freeform YAML
- ✅ Multi-cluster support via kubeconfig

**Pro Tier** - AI-powered intelligence ([Get API Key →](https://portal.kandy.dev)):
- ✨ Advanced dashboards with real-time charts
- ✨ AI-powered recommendations and insights
- ✨ Historical metrics and trends
- ✨ Log aggregation with advanced search
- ✨ Anomaly detection and alerts
- ✨ Team collaboration features

## Architecture

Kandy uses a **progressive enhancement** architecture that adapts to user tier:

```
┌─────────────────────────────────────┐
│  VSCode Extension (Smart Router)    │
│  ┌────────────────────────────────┐ │
│  │  Free Tier:                    │ │
│  │  - Generates HTML locally      │ │
│  │  - Simple webviews             │ │
│  │  - Basic CRUD operations       │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Pro Tier (with API key):     │ │
│  │  - Loads from kandy-server    │ │
│  │  - Rich web applications      │ │
│  │  - No CSP restrictions        │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
                  │
                  ↓ (Pro users only)
┌─────────────────────────────────────┐
│  kandy-server                       │
│  - Receives metrics from operator   │
│  - Serves rich UI applications      │
│  - AI analysis and recommendations  │
└─────────────────────────────────────┘
                  ↑
                  │ (Pro users only)
┌─────────────────────────────────────┐
│  kandy-operator (in cluster)        │
│  - Collects sanitized metrics      │
│  - Pushes to kandy-server          │
│  - No cluster ingress needed       │
└─────────────────────────────────────┘
```

### How It Works

**Free Users:**
- Extension uses your kubeconfig to interact with clusters
- All UI is generated locally in VS Code webviews
- Simple, functional interfaces with CSP restrictions
- No data sent to external servers

**Pro Users:**
- Install [kandy-operator](../kandy-operator) in your cluster
- Operator pushes sanitized metrics to [kandy-server](../kandy-server)
- Extension loads rich web UIs from kandy-server in iframes
- Advanced features: AI insights, charts, historical data
- Your kubeconfig never leaves your machine

## Getting Started

### Installation

#### From VS Code Marketplace (Recommended)
1. Open VS Code
2. Go to Extensions (`Ctrl/Cmd + Shift + X`)
3. Search for "Kandy"
4. Click Install

#### For Developers
```bash
git clone <repository-url>
cd kandy
npm install
npm run compile
# Press F5 to launch Extension Development Host
```

### Quick Start (Free Tier)

1. **Open Kandy**
   - Look for Kandy icon in VS Code activity bar
   - Extension automatically reads your `~/.kube/config`

2. **Navigate Your Cluster**
   - Expand clusters in tree view
   - Click namespaces to view resources
   - Click resources to view/edit details

3. **Edit Resources**
   - Form view for common fields
   - YAML view for advanced editing
   - Save changes directly to cluster

4. **Launch Workloads**
   - Use "Launch Workload" command
   - Paste or write YAML manifests
   - Apply to cluster with one click

### Upgrade to Pro

#### Step 1: Get API Key
Visit [portal.kandy.dev](https://portal.kandy.dev) to:
- Create a free account
- Generate your API key
- View installation instructions

#### Step 2: Install Operator
The operator runs in your cluster to enable Pro features:

**Option A: Automatic (requires Helm)**
```bash
# Extension detects Helm and offers one-click install
# Or run manually:
helm repo add kandy https://charts.kandy.dev
helm install kandy-operator kandy/kandy-operator \
  --set apiKey=YOUR_API_KEY \
  --namespace kandy-system \
  --create-namespace
```

**Option B: Manual**
```bash
kubectl apply -f https://install.kandy.dev/operator.yaml
kubectl create secret generic kandy-config \
  --from-literal=apiKey=YOUR_API_KEY \
  -n kandy-system
```

#### Step 3: Configure Extension
Add to VS Code settings (`settings.json`):
```json
{
  "kandy.apiKey": "kdy_prod_abc123def456"
}
```

That's it! The extension now loads Pro features from kandy-server.

## Features by Tier

### Free Tier Features

**Resource Management**
- Tree view navigation (clusters → namespaces → resources)
- Resource detail viewer with form and YAML tabs
- Edit common fields (replicas, image, labels, etc.)
- Save changes back to cluster
- Delete resources with confirmation

**YAML Operations**
- Syntax-highlighted YAML editor
- Apply arbitrary YAML manifests
- Dry-run validation
- Quick templates (Deployment, Service, Pod, ConfigMap)

**Multi-Cluster**
- Automatic kubeconfig parsing
- Switch between clusters and contexts
- Multiple kubeconfig file support

### Pro Tier Features

**Advanced Dashboards**
- Real-time cluster metrics with interactive charts
- Resource usage trends and forecasting
- Pod health visualization
- Network traffic analysis

**AI-Powered Insights**
- Intelligent recommendations for resource optimization
- Security vulnerability detection
- Cost optimization suggestions
- Configuration best practices
- Anomaly detection and alerts

**Enhanced Resource Views**
- Rich tabbed interfaces (Overview, Metrics, Logs, Events, YAML)
- Historical data and trend analysis
- Log aggregation with advanced search
- Event timeline visualization
- Dependency graph views

**Team Features**
- Shared cluster annotations
- Team activity feed
- Collaborative troubleshooting

## Project Structure

```
kandy/
├── src/
│   ├── extension.ts           # Main entry point
│   ├── providers/
│   │   ├── ClusterTreeProvider.ts
│   │   └── NamespaceWebview.ts
│   ├── commands/              # Command implementations
│   ├── services/
│   │   ├── KubernetesService.ts
│   │   └── TierManager.ts     # Free vs Pro logic
│   ├── webviews/
│   │   ├── free/              # Local HTML generators
│   │   └── pro/               # Remote URL loaders
│   └── utils/
├── ai/                        # Glam context files
│   ├── contexts/
│   ├── decisions/
│   ├── features/
│   └── specs/
└── dist/                      # Compiled output
```

## Development

### Prerequisites
- Node.js 22+ (LTS recommended)
- npm or yarn
- kubectl configured for testing
- VS Code 1.80.0+

### Setup
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch

# Run extension (opens Extension Development Host)
# Press F5 in VS Code

# Run tests
npm test

# Package extension
npm run package
```

### Testing Tiers

**Testing Free Tier:**
- Don't configure `kandy.apiKey` in settings
- Extension should show local webviews
- Verify basic CRUD operations work

**Testing Pro Tier:**
- Set up local kandy-server instance
- Configure API key in settings
- Extension should load remote webviews
- Verify advanced features appear

## Technology Stack

- **Framework**: VS Code Extension API
- **Language**: TypeScript (ES2020)
- **Runtime**: Node.js 22+ (LTS)
- **Kubernetes**: kubectl CLI + @kubernetes/client-node
- **Build**: webpack + TypeScript compiler
- **Package Manager**: npm

## Configuration

### Settings

```json
{
  // Required for Pro tier features
  "kandy.apiKey": "",
  
  // Optional: Enable debug logging
  "kandy.debugMode": false
}
```

API keys are stored securely in VS Code's secret storage.

## Related Projects

- **[kandy-server](../kandy-server)** - Backend API and UI server for Pro features
- **[kandy-operator](../kandy-operator)** - Kubernetes operator for metrics collection
- **[kandy-portal](../kandy-portal)** - User portal for account management

## Contributing

1. Check `ai/tasks/` for current priorities
2. Review `ai/decisions/` for architectural context
3. Follow specifications in `ai/specs/`
4. Update progress in `ai/tasks/`

This project uses the [Glam methodology](https://github.com/your-glam-repo) for context engineering.

## Security

### Free Tier
- All data stays on your machine
- Uses your kubeconfig for cluster access
- No external API calls
- No data collection

### Pro Tier
- Operator sends only sanitized metrics (no secrets, credentials, or sensitive data)
- API key stored in VS Code secret storage
- Communication over HTTPS
- Data sanitization at source (operator level)
- User controls what operator can access via RBAC

## License

MIT License - see LICENSE file for details

## Support

- [Documentation](https://docs.kandy.dev)
- [GitHub Issues](https://github.com/alto9/kandy/issues)
- [Community Discussions](https://github.com/alto9/kandy/discussions)
- [Portal Support](https://portal.kandy.dev/support)

---

**Built with ❤️ by Alto9 - Making Kubernetes management visual and intelligent**
