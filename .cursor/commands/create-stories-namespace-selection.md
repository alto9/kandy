# Create Stories and Tasks for Session: namespace-selection

This command will analyze the design session and create Stories (for code changes) and Tasks (for non-code work) based on the session's changed files and goals.

---

STEP 1: Call the get_forge_about MCP tool to understand the Forge workflow and distillation principles.

STEP 2: Retrieve the required schemas:
- get_forge_schema with schema_type "story"
- get_forge_schema with schema_type "task"

STEP 3: Review the design session:

**Session File**: /home/danderson/code/alto9/opensource/kandy/ai/sessions/namespace-selection.session.md
**Session ID**: namespace-selection

**Session Content**:
```markdown
---
session_id: namespace-selection
start_time: '2025-11-03T15:53:23.111Z'
status: completed
problem_statement: namespace selection
changed_files:
  - ai/models/namespace-selection-state.model.md
  - ai/features/navigation/tree-view-navigation.feature.md
  - ai/specs/tree-view-spec.spec.md
  - ai/specs/webview-spec.spec.md
  - ai/contexts/kubernetes-cluster-management.context.md
end_time: '2025-11-03T16:23:29.933Z'
---
## Problem Statement

namespace selection

## Goals

To be able to select a namespace to narrow down the results of queries 

## Approach

Add 2 options within the interface, either in a context menu from the tree, or from a dropdown control in the namespace webview. The implementation leverages kubectl's native context system to manage namespace selection, using `kubectl config set-context --current --namespace=<namespace>` to set the active namespace and reading it via `kubectl config view --minify`. This ensures namespace filtering is handled by kubectl itself rather than building a separate state management layer.

## Key Decisions

Use kubectl's native context system for namespace management rather than building a separate state layer. This means:
- Setting namespace uses `kubectl config set-context --current --namespace=<namespace>`
- Reading namespace uses `kubectl config view --minify --output=jsonpath='{..namespace}'`
- Changes affect kubectl globally (not just within VS Code)
- State persists automatically via kubeconfig file
- Must cache context state to minimize kubectl command overhead


## Notes

This won't apply to un-namespaced items such as nodes.

```

**Changed Files During Session** (5 files):

### Model: namespace-selection-state
File: ai/models/namespace-selection-state.model.md

**Git Status:** New file (not previously tracked)

### Feature: tree-view-navigation
File: ai/features/navigation/tree-view-navigation.feature.md

**Git Diff** (changes uncommitted):
```diff
diff --git a/ai/features/navigation/tree-view-navigation.feature.md b/ai/features/navigation/tree-view-navigation.feature.md
index 9ee1d1c..96d6dbe 100644
--- a/ai/features/navigation/tree-view-navigation.feature.md
+++ b/ai/features/navigation/tree-view-navigation.feature.md
@@ -162,4 +162,70 @@ Scenario: Manually refreshing a disconnected cluster
   Then the extension should attempt to reconnect using kubectl
   And update the cluster status based on the result
   And display an appropriate error message if kubectl cannot connect
+
+Scenario: Setting active namespace from context menu
+  Given a user has expanded a cluster showing namespaces
+  When they right-click on a namespace in the tree view
+  And select "Set as Active Namespace" from the context menu
+  Then the extension should execute kubectl config set-context --current --namespace=<namespace>
+  And the namespace should show an active indicator (checkmark icon)
+  And the status bar should display the active namespace
+  And subsequent kubectl commands should use this namespace by default
+
+Scenario: Visual indication of active namespace in tree
+  Given a user has set a namespace as active
+  When they view the tree view
+  Then the active namespace should display a checkmark icon
+  And other namespaces should not show the checkmark
+  And the status bar should show "Namespace: <namespace-name>"
+
+Scenario: Clearing active namespace selection
+  Given a user has set a namespace as active
+  When they right-click on the active namespace
+  And select "Clear Active Namespace" from the context menu
+  Then the extension should execute kubectl config set-context --current --namespace=''
+  And the checkmark indicator should be removed
+  And the status bar should show "Namespace: All"
+  And subsequent kubectl commands should show all namespaces
+
+Scenario: Setting namespace from "All Namespaces" option
+  Given a user has "All Namespaces" set as active
+  When they right-click on a specific namespace
+  And select "Set as Active Namespace"
+  Then the kubectl context should be updated to that namespace
+  And queries should be filtered to show only that namespace's resources
+
+Scenario: Viewing resources with active namespace context
+  Given a user has set "production" as the active namespace
+  When they expand the "Workloads" category
+  And expand "Deployments"
+  Then they should see only deployments in the "production" namespace
+  And deployments from other namespaces should not appear
+
+Scenario: Cluster-scoped resources ignore namespace context
+  Given a user has set "production" as the active namespace
+  When they expand the "Nodes" category
+  Then they should see all nodes in the cluster
+  And the namespace context should not filter nodes
+
+Scenario: Namespace context persists across sessions
+  Given a user has set "staging" as the active namespace
+  When they close and reopen VS Code
+  Then the extension should read the kubectl context
+  And "staging" should still be marked as the active namespace
+  And the status bar should show "Namespace: staging"
+
+Scenario: Detecting external namespace context changes
+  Given a user has set "production" as the active namespace in VS Code
+  When they change the namespace context externally using kubectl CLI
+  Then the extension should detect the change on next refresh
+  And update the tree view to show the new active namespace
+  And update the status bar with the new namespace
+
+Scenario: Handling invalid namespace in context
+  Given a user has set a namespace that no longer exists
+  When they try to query resources
+  Then kubectl should return a "namespace not found" error
+  And the extension should display the error to the user
+  And suggest clearing the namespace selection
 ```
```

### Spec: tree-view-spec
File: ai/specs/tree-view-spec.spec.md

**Git Diff** (changes uncommitted):
```diff
diff --git a/ai/specs/tree-view-spec.spec.md b/ai/specs/tree-view-spec.spec.md
index f73eec5..c8692ff 100644
--- a/ai/specs/tree-view-spec.spec.md
+++ b/ai/specs/tree-view-spec.spec.md
@@ -45,6 +45,8 @@ graph TD
    - "All Namespaces" appears as the first option under each cluster
    - Individual namespaces follow alphabetically
    - Clicking any namespace opens a webview for navigation
+   - Active namespace shows checkmark icon indicator
+   - Right-click context menu provides namespace selection options
 
 ## Data Flow
 
@@ -57,7 +59,14 @@ sequenceDiagram
     User->>Extension: Expand cluster
     Extension->>kubectl: kubectl get namespaces
     kubectl-->>Extension: Namespace list
-    Extension-->>User: Tree view shows namespaces
+    Extension->>kubectl: kubectl config view --minify (get active namespace)
+    kubectl-->>Extension: Active namespace
+    Extension-->>User: Tree view shows namespaces with active indicator
+
+    User->>Extension: Right-click namespace, Set as Active
+    Extension->>kubectl: kubectl config set-context --current --namespace=<ns>
+    kubectl-->>Extension: Context updated
+    Extension-->>User: Tree refreshes, checkmark appears, status bar updates
 
     User->>Extension: Click namespace
     Extension-->>User: Open namespace webview
@@ -69,6 +78,13 @@ sequenceDiagram
         Extension-->>User: Tree view updates
     end
     
+    Note over Extension,kubectl: Check for external context changes
+    loop Every 30 seconds
+        Extension->>kubectl: kubectl config view --minify
+        kubectl-->>Extension: Current context state
+        Extension-->>User: Update tree if context changed externally
+    end
+    
     Note over User,Extension: Manual refresh also available
     User->>Extension: Refresh command
     Extension->>kubectl: kubectl cluster-info
@@ -84,6 +100,7 @@ interface TreeItemData {
   type: 'cluster' | 'namespace' | 'allNamespaces';
   name: string;
   status?: 'connected' | 'disconnected';
+  isActiveNamespace?: boolean; // True if this namespace is set in kubectl context
   metadata?: {
     context: string;
     cluster: string;
@@ -97,6 +114,35 @@ interface TreeItemData {
 - Individual namespaces are sorted alphabetically
 - Clicking any namespace item triggers a webview to open
 
+### Namespace Selection via kubectl Context
+
+#### Reading Active Namespace
+- Extension reads current namespace from kubectl context on startup
+- Command: `kubectl config view --minify --output=jsonpath='{..namespace}'`
+- Empty result means no namespace is set (cluster-wide view)
+- Cache result for 5 seconds to minimize kubectl calls
+- Poll for external changes every 30 seconds
+
+#### Setting Active Namespace
+- User right-clicks namespace in tree view
+- Selects "Set as Active Namespace" from context menu
+- Extension executes: `kubectl config set-context --current --namespace=<namespace-name>`
+- Tree view refreshes to show checkmark on active namespace
+- Status bar updates to show: "Namespace: <namespace-name>"
+
+#### Clearing Active Namespace
+- User right-clicks active namespace or uses command palette
+- Selects "Clear Active Namespace" from context menu
+- Extension executes: `kubectl config set-context --current --namespace=''`
+- Checkmark indicator removed from tree view
+- Status bar updates to show: "Namespace: All"
+
+#### Visual Indicators
+- **Active Namespace**: Shows checkmark icon (✓) next to namespace name
+- **Inactive Namespaces**: No special indicator
+- **Status Bar**: Displays current namespace name or "All" if none set
+- **Icon Theme**: Use VS Code's built-in "check" icon for active indicator
+
 ### Status Indicators
 - **Cluster Status**: Connected/disconnected indicators based on kubectl connectivity
 - **Connection Method**: Uses `kubectl cluster-info` to verify cluster accessibility
@@ -118,9 +164,40 @@ interface TreeItemData {
 - **Click cluster**: Expand to show namespaces
 - **Click namespace**: Open webview panel for namespace navigation
 - **Click "All Namespaces"**: Open webview showing cluster-wide resource view
-- **Right-click**: Context menu with relevant actions (refresh, switch context)
+- **Right-click namespace**: Context menu with namespace selection actions
 - **Manual Refresh**: User-triggered refresh command updates tree
 
+### Context Menu Actions
+
+#### For Namespace Items (not active)
+- **Set as Active Namespace**: Sets this namespace in kubectl context
+- **Open in Webview**: Opens webview for this namespace
+- **Refresh**: Refreshes this namespace's data
+
+#### For Active Namespace Item
+- **Clear Active Namespace**: Removes namespace from kubectl context
+- **Open in Webview**: Opens webview for this namespace
+- **Refresh**: Refreshes this namespace's data
+
+#### Context Menu Registration
+```typescript
+// In package.json
+"menus": {
+  "view/item/context": [
+    {
+      "command": "kandy.setActiveNamespace",
+      "when": "view == kandyTreeView && viewItem == namespace && !isActiveNamespace",
+      "group": "namespace@1"
+    },
+    {
+      "command": "kandy.clearActiveNamespace",
+      "when": "view == kandyTreeView && viewItem == namespace && isActiveNamespace",
+      "group": "namespace@1"
+    }
+  ]
+}
+```
+
 ## Performance Considerations
 
 ### Efficient Loading
@@ -133,6 +210,8 @@ interface TreeItemData {
 - **kubectl Process Management**: Spawn kubectl processes only when needed
 - **Periodic Connectivity Checks**: Automatic checks every 60 seconds with proper cleanup
 - **Status Caching**: Cluster connectivity status cached in memory to reduce redundant checks
+- **Context State Caching**: kubectl context state cached for 5 seconds to minimize config file reads
+- **External Change Detection**: Poll kubectl context every 30 seconds for external changes
 
 ## Error Handling
 
@@ -149,6 +228,13 @@ interface TreeItemData {
 - **kubectl Errors**: Display kubectl error messages to user
 - **Fallback Display**: Show "Unable to list namespaces" if kubectl fails
 
+### Namespace Context Errors
+- **Context Read Failure**: Use cached state if kubectl config read fails, show warning
+- **Context Write Failure**: Rollback UI state if kubectl config write fails, show error message
+- **Invalid Namespace**: Warn user if selected namespace doesn't exist, suggest clearing selection
+- **Permission Denied**: Show error if user lacks permission to modify kubeconfig
+- **External Conflicts**: Detect and notify if context changed externally during operation
+
 ## Testing Strategy
 
 ### Unit Tests
@@ -156,14 +242,25 @@ interface TreeItemData {
 - Namespace listing and sorting
 - kubectl command construction
 - Status calculation functions
+- Namespace context reading from kubectl config
+- Namespace context setting and clearing
+- Active namespace indicator logic
+- Context state caching and invalidation
 
 ### Integration Tests
 - kubeconfig parsing
 - kubectl command execution
 - Namespace retrieval from clusters
+- kubectl context modification and verification
+- Context state synchronization across operations
 
 ### E2E Tests
 - Tree navigation to namespaces
 - Webview panel opening from namespace clicks
 - Manual refresh behavior
 - Connection failure handling
+- Setting active namespace from context menu
+- Clearing active namespace selection
+- Visual indicator updates when context changes
+- External context change detection and UI update
+- Status bar namespace display updates
```

### Spec: webview-spec
File: ai/specs/webview-spec.spec.md

**Git Diff** (changes uncommitted):
```diff
diff --git a/ai/specs/webview-spec.spec.md b/ai/specs/webview-spec.spec.md
index 234d959..ad9a6ef 100644
--- a/ai/specs/webview-spec.spec.md
+++ b/ai/specs/webview-spec.spec.md
@@ -48,6 +48,7 @@ graph TD
 sequenceDiagram
     participant User
     participant Tree
+    participant Webview
     participant Extension
     participant kubectl
     participant AI
@@ -56,14 +57,33 @@ sequenceDiagram
     Tree->>Extension: Namespace selected
     Extension->>kubectl: Get namespace resources
     kubectl-->>Extension: Resource list
+    Extension->>kubectl: kubectl config view --minify (get active namespace)
+    kubectl-->>Extension: Active namespace
     Extension->>AI: Analyze namespace context
     AI-->>Extension: AI recommendations
-    Extension-->>User: Webview panel opens with navigation
+    Extension-->>Webview: Open webview with resources and active namespace
+    Webview-->>User: Display namespace selector and resources
     
-    User->>Extension: Select resource in webview
+    User->>Webview: Select namespace from dropdown
+    Webview->>Extension: setActiveNamespace message
+    Extension->>kubectl: kubectl config set-context --current --namespace=<ns>
+    kubectl-->>Extension: Context updated
+    Extension->>kubectl: Get resources for new namespace
+    kubectl-->>Extension: Resource list
+    Extension-->>Webview: namespaceContextChanged notification
+    Webview-->>User: Update dropdown and refresh resources
+    
+    Note over Extension,kubectl: External context change detected
+    Extension->>kubectl: kubectl config view --minify (periodic check)
+    kubectl-->>Extension: Context changed externally
+    Extension-->>Webview: namespaceContextChanged notification
+    Webview-->>User: Update selector and show notification
+    
+    User->>Webview: Select resource in webview
     Extension->>kubectl: Get resource details
     kubectl-->>Extension: Resource data
-    Extension-->>User: Display resource details
+    Extension-->>Webview: Display resource details
+    Webview-->>User: Show resource information
 ```
 
 ## Implementation Details
@@ -85,15 +105,24 @@ interface WebviewContent {
 ```typescript
 // Extension to Webview
 interface ExtensionMessage {
-  command: 'updateResource' | 'updateRecommendations' | 'showYaml';
+  command: 'updateResource' | 'updateRecommendations' | 'showYaml' | 'namespaceContextChanged';
   data: any;
 }
 
 // Webview to Extension
 interface WebviewMessage {
-  command: 'applyRecommendation' | 'editYaml' | 'refreshData';
+  command: 'applyRecommendation' | 'editYaml' | 'refreshData' | 'setActiveNamespace' | 'clearActiveNamespace';
   data: any;
 }
+
+// Namespace context change notification
+interface NamespaceContextChangedMessage extends ExtensionMessage {
+  command: 'namespaceContextChanged';
+  data: {
+    namespace: string | null; // null means "All Namespaces"
+    source: 'extension' | 'external'; // Where the change came from
+  };
+}
 ```
 
 ## UI Layout Specifications
@@ -101,6 +130,23 @@ interface WebviewMessage {
 ### Common Layout Structure
 ```html
 <div class="webview-container">
+  <!-- Namespace Selection Header -->
+  <div class="namespace-selector-bar">
+    <label for="namespace-select">Active Namespace:</label>
+    <select id="namespace-select" class="namespace-dropdown">
+      <option value="">All Namespaces</option>
+      <option value="default">default</option>
+      <option value="production" selected>production</option>
+      <option value="staging">staging</option>
+    </select>
+    <button id="clear-namespace" class="clear-btn" title="Clear namespace selection">
+      Clear
+    </button>
+    <span class="namespace-info">
+      (Changes kubectl context globally)
+    </span>
+  </div>
+
   <!-- Header Section -->
   <div class="resource-header">
     <h1>Pod: nginx-deployment-abc123</h1>
@@ -147,6 +193,64 @@ interface WebviewMessage {
 </div>
 ```
 
+### Namespace Selector Behavior
+
+#### Selector State
+- **Dropdown**: Populated with all namespaces from current cluster
+- **Current Selection**: Shows namespace from kubectl context (or "All Namespaces" if none)
+- **Clear Button**: Enabled only when a specific namespace is selected
+- **Warning Label**: Shows "(Changes kubectl context globally)" to inform user
+
+#### User Interactions
+- **Select namespace from dropdown**: 
+  - Sends `setActiveNamespace` message to extension with namespace name
+  - Extension updates kubectl context
+  - Extension sends `namespaceContextChanged` notification back
+  - Webview refreshes resource data for selected namespace
+  
+- **Click Clear button**:
+  - Sends `clearActiveNamespace` message to extension
+  - Extension clears kubectl context namespace
+  - Extension sends `namespaceContextChanged` notification
+  - Webview refreshes to show all namespaces
+  
+- **Receive external context change**:
+  - Extension sends `namespaceContextChanged` message
+  - Webview updates dropdown selection to match
+  - Webview refreshes resource data if needed
+  - Show notification: "Namespace context changed externally to: <namespace>"
+
+#### CSS Styling
+```css
+.namespace-selector-bar {
+  display: flex;
+  align-items: center;
+  gap: 10px;
+  padding: 10px;
+  background-color: var(--vscode-editor-background);
+  border-bottom: 1px solid var(--vscode-panel-border);
+}
+
+.namespace-dropdown {
+  padding: 5px 10px;
+  background-color: var(--vscode-dropdown-background);
+  color: var(--vscode-dropdown-foreground);
+  border: 1px solid var(--vscode-dropdown-border);
+}
+
+.clear-btn {
+  padding: 5px 15px;
+  background-color: var(--vscode-button-secondaryBackground);
+  color: var(--vscode-button-secondaryForeground);
+}
+
+.namespace-info {
+  font-size: 0.9em;
+  color: var(--vscode-descriptionForeground);
+  font-style: italic;
+}
+```
+
 ### Responsive Design
 - **Mobile-friendly**: Support for different screen sizes
 - **VS Code Integration**: Match VS Code's design language
@@ -217,11 +321,18 @@ interface AIRecommendation {
 - Resource data loading and display
 - AI recommendation integration
 - YAML editing and validation
+- Namespace selection from webview dropdown
+- kubectl context updates from webview actions
+- Message passing between webview and extension for namespace changes
 
 ### E2E Tests
 - Complete workflows from tree selection to webview interaction
 - AI recommendation application and validation
 - Cross-resource navigation and context switching
+- Namespace selection from webview with context update
+- Clearing namespace selection from webview
+- External namespace context change detection and webview update
+- Namespace selector state synchronization across multiple webviews
 
 ## Security Considerations
```

### Context: kubernetes-cluster-management
File: ai/contexts/kubernetes-cluster-management.context.md

**Git Diff** (changes uncommitted):
```diff
diff --git a/ai/contexts/kubernetes-cluster-management.context.md b/ai/contexts/kubernetes-cluster-management.context.md
index 6f2e381..e87cf73 100644
--- a/ai/contexts/kubernetes-cluster-management.context.md
+++ b/ai/contexts/kubernetes-cluster-management.context.md
@@ -40,3 +40,18 @@ WHEN designing AI prompts and context
 THEN include cluster state, resource configurations, and usage patterns
 AND provide specific context about the type of analysis requested
 AND format AI responses for actionable recommendations
+
+GIVEN we need to filter queries by a selected namespace
+WHEN implementing namespace selection
+THEN use kubectl's native context system to manage namespace selection
+AND execute `kubectl config set-context --current --namespace=<namespace>` to set active namespace
+AND execute `kubectl config view --minify --output=jsonpath='{..namespace}'` to read active namespace
+AND execute `kubectl config set-context --current --namespace=''` to clear namespace selection
+AND do NOT build a separate state management layer on top of kubectl context
+AND cache the kubectl context state for 5 seconds to minimize file system reads
+AND poll for external context changes every 30 seconds
+AND provide clear visual feedback showing which namespace is active in kubectl context
+AND display a warning that namespace changes affect kubectl globally
+AND apply namespace filtering automatically to namespace-scoped resources
+AND exclude cluster-scoped resources (like Nodes, PersistentVolumes) from namespace filtering
+AND use `--all-namespaces` flag explicitly when showing cluster-wide views in UI
```


**Note:** Git diffs show uncommitted changes only. Session did not track start commit.

STEP 4: Review changed files and follow context guidance

For each changed file listed above:
1. Review the git diff (if available) to understand exactly what changed
2. If no git diff is available, read the file directly to understand its content
3. Identify any context_id references in the file's frontmatter
4. Read any referenced context files and execute their Gherkin scenarios (GIVEN/WHEN/THEN)

STEP 5: Analyze and break down into Stories and Tasks

Based on the session and the git diffs (or file contents) of changed files:

**IMPORTANT:** Use the git diffs shown above to understand EXACTLY what changed in each file. The diffs show:
- Lines that were added (prefixed with +)
- Lines that were removed (prefixed with -)
- Context around the changes
- Whether files are new, modified, or deleted

If git diffs are not available, read the files directly to understand their current state and determine what needs to be implemented.

This precise change information should guide your story creation - focus on implementing these specific changes.

**Create Stories** (*.story.md) in ai/tickets/namespace-selection/ for:
- Code changes and implementations
- New features or feature modifications
- Technical debt improvements
- Refactoring work

**Create Tasks** (*.task.md) in ai/tickets/namespace-selection/ for:
- Manual configuration in external systems
- Documentation updates outside code
- Third-party service setup
- Manual testing or verification steps

**Critical Requirements:**

1. **Keep Stories MINIMAL** - Each story should take < 30 minutes to implement
2. **Break Down Large Changes** - If a change is complex, create multiple small stories
3. **Use Proper Linkages** - Link stories/tasks to feature_id, spec_id, and model_id from changed files
4. **Link to Session** - ALL stories and tasks MUST include session_id: "namespace-selection" in their frontmatter
5. **Be Specific** - Include exact file paths, clear objectives, and acceptance criteria
6. **Add Context** - Each story should have enough information to be implemented independently
7. **Order Matters** - Set dependencies and order stories logically
8. **Follow Schemas** - All files must adhere to schemas from Step 2

STEP 6: Verify completeness and create files

Ensure that:
- Every changed file is accounted for in at least one story or task
- All stories have clear acceptance criteria
- Dependencies between stories are identified
- The collection of stories fully implements the session goals
- Stories are small enough to be completed quickly
- ALL stories and tasks link back to session_id: "namespace-selection"

Now create all the story and task files in ai/tickets/namespace-selection/ following the schemas and requirements above.
