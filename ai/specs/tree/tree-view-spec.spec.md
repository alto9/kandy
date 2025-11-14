---
spec_id: tree-view-spec
feature_id: [tree-view-navigation, reports-menu]
model_id: [namespace-selection-state]
context_id: [kubernetes-cluster-management]
---

# Tree View Specification

## Overview

The tree view provides simplified navigation of Kubernetes clusters and namespaces. It displays a hierarchical structure: clusters at the top level, with resource categories listed underneath when expanded. The tree view conditionally displays a Reports menu at the top when the kube9-operator is installed and functioning. Clicking on namespaces opens a webview for detailed resource navigation and management.

## Architecture

```mermaid
graph TD
    A[VS Code TreeView API] --> B[ClusterTreeProvider]
    B --> C[Tree Items]
    C --> D[Cluster Item]
    D --> E[Namespace Items]
    E --> F[Namespace Webview]

    F --> G[Resource Navigation]
    G --> H[AI Recommendations]
    H --> I[Quick Actions]

    J[kubectl CLI] --> K[Cluster Connection]
    K --> B
```

## Component Responsibilities

### ClusterTreeProvider
- **Purpose**: Main tree data provider implementing `vscode.TreeDataProvider`
- **Responsibilities**:
  - Parse kubeconfig files and extract cluster information
  - Use kubectl commands to verify cluster connectivity
  - Query namespaces using kubectl
  - Check operator status for each cluster
  - Build hierarchical tree structure (Clusters → Categories → Resources)
  - Conditionally display Reports category based on operator status
  - Manage tree item icons and status indicators
  - Open webviews when namespaces or reports are clicked

### Tree Items Hierarchy

#### Category Level (under clusters)
1. **Reports Category** (conditional): Appears only when cluster operator status is NOT 'basic'
   - Position: First category (before Nodes)
   - Visibility: Only when `operatorStatus !== OperatorStatusMode.Basic`
   - Structure: Reports → Compliance → Data Collection
   - Reports subcategory: Compliance
     - Compliance report item: Data Collection (placeholder, non-functional)

2. **Resource Categories**: Always visible when cluster is expanded
   - Nodes
   - Namespaces
   - Workloads
   - Storage
   - Helm
   - Configuration
   - Custom Resources

#### Resource Level (under categories)
- **Namespace Items**: Child nodes under Namespaces category
  - "All Namespaces" appears as the first option under Namespaces category
  - Individual namespaces follow alphabetically
  - Clicking any namespace opens a webview for navigation
  - Active namespace shows checkmark icon indicator
  - Right-click context menu provides namespace selection options

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Extension
    participant kubectl

    User->>Extension: Expand cluster
    Extension->>kubectl: kubectl get namespaces
    kubectl-->>Extension: Namespace list
    Extension->>kubectl: kubectl config view --minify (get active namespace)
    kubectl-->>Extension: Active namespace
    Extension-->>User: Tree view shows namespaces with active indicator

    User->>Extension: Right-click namespace, Set as Active
    Extension->>kubectl: kubectl config set-context --current --namespace=<ns>
    kubectl-->>Extension: Context updated
    Extension-->>User: Tree refreshes, checkmark appears, status bar updates

    User->>Extension: Click namespace
    Extension-->>User: Open namespace webview
    
    Note over Extension,kubectl: Automatic refresh every 60 seconds
    loop Every 60 seconds
        Extension->>kubectl: kubectl cluster-info
        kubectl-->>Extension: Connection status
        Extension-->>User: Tree view updates
    end
    
    Note over Extension,kubectl: Check for external context changes
    loop Every 30 seconds
        Extension->>kubectl: kubectl config view --minify
        kubectl-->>Extension: Current context state
        Extension-->>User: Update tree if context changed externally
    end
    
    Note over User,Extension: Manual refresh also available
    User->>Extension: Refresh command
    Extension->>kubectl: kubectl cluster-info
    kubectl-->>Extension: Connection status
    Extension-->>User: Tree view updates
```

## Implementation Details

### Tree Item Structure
```typescript
interface TreeItemData {
  type: 'cluster' | 'namespace' | 'allNamespaces' | 'reports' | 'compliance' | 'dataCollection' | 'resource';
  name: string;
  status?: 'connected' | 'disconnected';
  isActiveNamespace?: boolean; // True if this namespace is set in kubectl context
  operatorStatus?: OperatorStatusMode; // Only relevant for cluster items
  metadata?: {
    context: string;
    cluster: string;
  };
  // For resource items
  resourceType?: string;       // e.g., "Deployment", "Pod", "Service"
  resourceNamespace?: string;  // Namespace containing the resource
  resourceApiVersion?: string; // e.g., "apps/v1"
}
```

### Reports Category Conditional Display

#### Display Logic
- **Condition**: Reports category appears when `clusterElement.operatorStatus !== OperatorStatusMode.Basic`
- **Operator Status Modes**:
  - `Basic`: No operator installed → Reports NOT shown
  - `Operated`: Operator installed, no API key → Reports shown
  - `Enabled`: Operator installed with valid API key → Reports shown
  - `Degraded`: Operator installed but has issues → Reports shown

#### Reports Menu Structure
```
Reports (category)
  └── Compliance (subcategory)
      └── Data Collection (report item - placeholder)
```

#### Implementation Details
- Reports category is prepended to the category list when operator status is not Basic
- Reports category follows the same expandable pattern as other categories
- Compliance subcategory follows the same pattern as other subcategories (e.g., Workloads → Deployments)
- Data Collection report item is a placeholder with no functionality
- Clicking Data Collection should display a placeholder message indicating future functionality

### Namespace Listing
- Namespaces are queried using `kubectl get namespaces --output=json`
- "All Namespaces" is a special tree item that appears first
- Individual namespaces are sorted alphabetically
- Clicking any namespace item triggers a webview to open

### Namespace Selection via kubectl Context

#### Reading Active Namespace
- Extension reads current namespace from kubectl context on startup
- Command: `kubectl config view --minify --output=jsonpath='{..namespace}'`
- Empty result means no namespace is set (cluster-wide view)
- Cache result for 5 seconds to minimize kubectl calls
- Poll for external changes every 30 seconds

#### Setting Active Namespace
- User right-clicks namespace in tree view
- Selects "Set as Active Namespace" from context menu
- Extension executes: `kubectl config set-context --current --namespace=<namespace-name>`
- Tree view refreshes to show checkmark on active namespace
- Status bar updates to show: "Namespace: <namespace-name>"

#### Clearing Active Namespace
- User right-clicks active namespace or uses command palette
- Selects "Clear Active Namespace" from context menu
- Extension executes: `kubectl config set-context --current --namespace=''`
- Checkmark indicator removed from tree view
- Status bar updates to show: "Namespace: All"

#### Visual Indicators
- **Active Namespace**: Shows checkmark icon (✓) next to namespace name
- **Inactive Namespaces**: No special indicator
- **Status Bar**: Displays current namespace name or "All" if none set
- **Icon Theme**: Use VS Code's built-in "check" icon for active indicator

### Status Indicators
- **Cluster Status**: Connected/disconnected indicators based on kubectl connectivity
- **Connection Method**: Uses `kubectl cluster-info` to verify cluster accessibility
- **Automatic Refresh**: Connectivity checks run automatically every 60 seconds
- **Manual Refresh**: User can trigger immediate refresh via command
- **Status Persistence**: Cluster status is cached between refreshes to prevent spinner flicker
- **Warning Icons**: Disconnected clusters show a warning triangle icon (exclamation point in triangle)
- **Spinner Behavior**: Spinner only shows during initial connection check or when status is truly unknown

## User Experience

### Visual Design
- **Icons**: Use VS Code's built-in Kubernetes icons where available
- **Colors**: Status-based coloring (green=healthy, yellow=warning, red=error)
- **Badges**: Show resource counts and status summaries
- **Tooltips**: Display additional information on hover

### Interactions
- **Click cluster**: Expand to show resource categories (and Reports if operator installed)
- **Click Reports category**: Expand to show Compliance subcategory
- **Click Compliance subcategory**: Expand to show Data Collection report
- **Click Data Collection**: Display placeholder message (non-functional)
- **Click namespace**: Open webview panel for namespace navigation
- **Click "All Namespaces"**: Open webview showing cluster-wide resource view
- **Click resource**: Context-dependent action (may expand or open details)
- **Right-click namespace**: Context menu with namespace selection actions
- **Right-click resource**: Context menu with "View YAML" and resource-specific actions
- **Manual Refresh**: User-triggered refresh command updates tree and operator status

### Context Menu Actions

#### For Namespace Items (not active)
- **Set as Active Namespace**: Sets this namespace in kubectl context
- **Open in Webview**: Opens webview for this namespace
- **Refresh**: Refreshes this namespace's data

#### For Active Namespace Item
- **Clear Active Namespace**: Removes namespace from kubectl context
- **Open in Webview**: Opens webview for this namespace
- **Refresh**: Refreshes this namespace's data

#### For Resource Items (Deployments, Pods, Services, etc.)
- **View YAML**: Opens YAML editor for the resource in a new tab
- **Refresh**: Refreshes this resource's data
- **Delete Resource**: Deletes the resource from the cluster (with confirmation)

#### Context Menu Registration
```typescript
// In package.json
"menus": {
  "view/item/context": [
    {
      "command": "kube9.setActiveNamespace",
      "when": "view == kube9TreeView && viewItem == namespace && !isActiveNamespace",
      "group": "namespace@1"
    },
    {
      "command": "kube9.clearActiveNamespace",
      "when": "view == kube9TreeView && viewItem == namespace && isActiveNamespace",
      "group": "namespace@1"
    },
    {
      "command": "kube9.viewResourceYAML",
      "when": "view == kube9TreeView && viewItem =~ /^resource/",
      "group": "kube9@1"
    }
  ]
}
```

## Performance Considerations

### Efficient Loading
- **Lazy Loading**: Namespaces loaded only when cluster is expanded
- **Caching**: Cache namespace lists to avoid redundant kubectl calls
- **Simple Structure**: 2-level tree minimizes memory overhead

### Memory Management
- **Minimal Tree Data**: Only clusters and namespaces in tree
- **kubectl Process Management**: Spawn kubectl processes only when needed
- **Periodic Connectivity Checks**: Automatic checks every 60 seconds with proper cleanup
- **Status Caching**: Cluster connectivity status cached in memory to reduce redundant checks
- **Context State Caching**: kubectl context state cached for 5 seconds to minimize config file reads
- **External Change Detection**: Poll kubectl context every 30 seconds for external changes

## Error Handling

### Connection Issues
- **Failed kubectl Connection**: Show disconnected status with warning icon immediately
- **Automatic Retry**: Extension checks connectivity every 60 seconds, whether pass or fail
- **Manual Refresh Available**: User can trigger immediate refresh via command without waiting
- **Clear Error Messages**: Display helpful error message when kubectl fails
- **Graceful Exit**: If kubectl unavailable, show appropriate message without crashing
- **Status Recovery**: Automatically updates icon when connection is restored on next check

### Namespace Access
- **Permission Errors**: Show error in tree if namespaces cannot be listed
- **kubectl Errors**: Display kubectl error messages to user
- **Fallback Display**: Show "Unable to list namespaces" if kubectl fails

### Namespace Context Errors
- **Context Read Failure**: Use cached state if kubectl config read fails, show warning
- **Context Write Failure**: Rollback UI state if kubectl config write fails, show error message
- **Invalid Namespace**: Warn user if selected namespace doesn't exist, suggest clearing selection
- **Permission Denied**: Show error if user lacks permission to modify kubeconfig
- **External Conflicts**: Detect and notify if context changed externally during operation

## Testing Strategy

### Unit Tests
- Tree provider logic
- Namespace listing and sorting
- kubectl command construction
- Status calculation functions
- Namespace context reading from kubectl config
- Namespace context setting and clearing
- Active namespace indicator logic
- Context state caching and invalidation
- Reports category conditional display logic
- Operator status-based category filtering
- Reports menu hierarchy construction

### Integration Tests
- kubeconfig parsing
- kubectl command execution
- Namespace retrieval from clusters
- kubectl context modification and verification
- Context state synchronization across operations

### E2E Tests
- Tree navigation to namespaces
- Webview panel opening from namespace clicks
- Manual refresh behavior
- Connection failure handling
- Setting active namespace from context menu
- Clearing active namespace selection
- Visual indicator updates when context changes
- External context change detection and UI update
- Status bar namespace display updates
- Reports category visibility based on operator status
- Reports menu expansion and navigation
- Data Collection placeholder display
- Reports category updates when operator status changes
