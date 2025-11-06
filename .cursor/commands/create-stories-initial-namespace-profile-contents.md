# Create Stories and Tasks for Session: initial-namespace-profile-contents

This command will analyze the design session and create Stories (for code changes) and Tasks (for non-code work) based on the session's changed files and goals.

---

STEP 1: Call the get_forge_about MCP tool to understand the Forge workflow and distillation principles.

STEP 2: Retrieve the required schemas:
- get_forge_schema with schema_type "story"
- get_forge_schema with schema_type "task"

STEP 3: Review the design session:

**Session File**: /home/danderson/code/alto9/opensource/kandy/ai/sessions/initial-namespace-profile-contents.session.md
**Session ID**: initial-namespace-profile-contents

**Session Content**:
```markdown
---
session_id: initial-namespace-profile-contents
start_time: '2025-11-06T14:12:19.002Z'
status: completed
problem_statement: initial namespace profile contents
changed_files:
  - ai/specs/webview/webview-spec.spec.md
  - ai/features/navigation/tree-view-navigation.feature.md
  - ai/features/webview/namespace-detail-view.feature.md
  - ai/specs/webview/namespace-workloads-table.spec.md
end_time: '2025-11-06T14:37:55.318Z'
---
## Problem Statement

initial namespace profile contents

## Goals

The goal of this session is to provide basic contents on the Namespace profile view in Kandy.

## Approach

Each namespace clicked in the tree should open a new tab. Each open tab should refresh its contents from the server every 10 seconds. Each namespace profile should display workloads, network, storage and any other namespaceable items for the namespace being viewed.

## Key Decisions

Keep current window behavior by allowing multiple windows to be opened at once.

## Notes



```

**Changed Files During Session** (4 files):

### Spec: webview-spec
File: ai/specs/webview/webview-spec.spec.md

**Git Diff** (changes uncommitted):
```diff
diff --git a/ai/specs/webview/webview-spec.spec.md b/ai/specs/webview/webview-spec.spec.md
index 92f2fb7..7d7cb36 100644
--- a/ai/specs/webview/webview-spec.spec.md
+++ b/ai/specs/webview/webview-spec.spec.md
@@ -131,6 +131,9 @@ interface NamespaceContextChangedMessage extends ExtensionMessage {
 ## UI Layout Specifications
 
 ### Common Layout Structure
+
+**Note**: The namespace name shown in examples (e.g., "production") represents the actual namespace name from Kubernetes.
+
 ```html
 <div class="webview-container">
   <!-- Header Section with Namespace Title -->
@@ -140,57 +143,136 @@ interface NamespaceContextChangedMessage extends ExtensionMessage {
       <span class="btn-icon">✓</span>
       <span class="btn-text">Default Namespace</span>
     </button>
-    <span class="namespace-info">
-      (Changes kubectl context globally)
-    </span>
   </div>
 
-  <!-- Resource Navigation Section -->
-  <div class="resource-header">
-    <h2>Pod: nginx-deployment-abc123</h2>
-    <div class="status-badges">
-      <span class="status running">Running</span>
-      <span class="restart-count">Restarts: 0</span>
+  <!-- Workloads Section -->
+  <div class="workloads-section">
+    <h2>Workloads</h2>
+    
+    <!-- Pill Selectors -->
+    <div class="workload-type-pills">
+      <button class="pill-selector active" data-workload-type="deployments">
+        Deployments
+      </button>
+      <button class="pill-selector" data-workload-type="statefulsets">
+        StatefulSets
+      </button>
+      <button class="pill-selector" data-workload-type="daemonsets">
+        DaemonSets
+      </button>
+      <button class="pill-selector" data-workload-type="cronjobs">
+        CronJobs
+      </button>
     </div>
+    
+    <!-- Workloads Table -->
+    <table class="workloads-table">
+      <thead>
+        <tr>
+          <th>Name</th>
+          <th>Namespace</th>
+          <th>Health</th>
+          <th>Ready/Desired</th>
+        </tr>
+      </thead>
+      <tbody>
+        <tr class="workload-row">
+          <td class="workload-name">nginx-deployment</td>
+          <td class="workload-namespace">production</td>
+          <td class="workload-health">
+            <span class="health-indicator healthy">●</span>
+            <span class="health-text">Healthy</span>
+          </td>
+          <td class="workload-replicas">3/3</td>
+        </tr>
+        <tr class="workload-row">
+          <td class="workload-name">api-deployment</td>
+          <td class="workload-namespace">production</td>
+          <td class="workload-health">
+            <span class="health-indicator degraded">●</span>
+            <span class="health-text">Degraded</span>
+          </td>
+          <td class="workload-replicas">2/3</td>
+        </tr>
+      </tbody>
+    </table>
+    <p class="table-note">Workload items are currently non-interactive.</p>
   </div>
+</div>
+```
 
-  <!-- Main Content Tabs -->
-  <div class="tab-container">
-    <div class="tab-nav">
-      <button class="tab active">Overview</button>
-      <button class="tab">YAML</button>
-      <button class="tab">Events</button>
-      <button class="tab">Logs</button>
-    </div>
+### Workloads Section Specification
 
-    <div class="tab-content">
-      <!-- Overview Tab -->
-      <div class="overview-panel">
-        <!-- AI Recommendations -->
-        <div class="ai-recommendations">
-          <h3>AI Recommendations</h3>
-          <!-- Recommendation cards -->
-        </div>
-
-        <!-- Resource Details -->
-        <div class="resource-details">
-          <!-- Resource-specific information -->
-        </div>
-      </div>
-
-      <!-- YAML Tab -->
-      <div class="yaml-panel">
-        <pre><code class="yaml-content"></code></pre>
-        <div class="yaml-actions">
-          <button>Edit in VS Code</button>
-          <button>Apply Changes</button>
-        </div>
-      </div>
-    </div>
-  </div>
-</div>
+#### Pill Selector Behavior
+
+The workloads section uses horizontal pill selectors to switch between workload types:
+
+- **Default Selection**: Deployments pill is selected when webview opens
+- **Single Selection**: Only one pill can be selected at a time
+- **Table Updates**: Clicking a pill updates the table to show only that workload type
+- **Visual States**: Active (selected) and inactive (unselected) states with distinct styling
+- **Hover Feedback**: Unselected pills show hover effects
+
+#### Data Structure
+```typescript
+interface WorkloadEntry {
+  name: string;
+  namespace: string;
+  health: WorkloadHealth;
+  readyReplicas: number;
+  desiredReplicas: number;
+}
+
+type WorkloadType = 'Deployment' | 'StatefulSet' | 'DaemonSet' | 'CronJob';
+
+interface WorkloadHealth {
+  status: 'Healthy' | 'Degraded' | 'Unhealthy' | 'Unknown';
+  podStatus: PodHealthSummary;
+}
+
+interface PodHealthSummary {
+  totalPods: number;
+  readyPods: number;
+  healthChecks: {
+    passed: number;
+    failed: number;
+    unknown: number;
+  };
+}
 ```
 
+#### Health Calculation Logic
+Health status is derived from pod-level health checks and replica status:
+
+1. **Healthy**: All desired replicas are ready AND all pod health checks pass
+   - `readyReplicas === desiredReplicas`
+   - `healthChecks.failed === 0`
+
+2. **Degraded**: Some replicas are ready OR some health checks failing
+   - `readyReplicas < desiredReplicas && readyReplicas > 0`
+   - OR `healthChecks.failed > 0 && healthChecks.passed > 0`
+
+3. **Unhealthy**: No replicas ready OR all health checks failing
+   - `readyReplicas === 0`
+   - OR `healthChecks.passed === 0 && healthChecks.failed > 0`
+
+4. **Unknown**: Unable to determine health status
+   - `healthChecks.unknown > 0 && healthChecks.passed === 0 && healthChecks.failed === 0`
+
+#### Workload Types Available
+Users can switch between 4 types of workloads using pill selectors:
+1. **Deployments**: Standard stateless applications
+2. **StatefulSets**: Stateful applications with persistent identity
+3. **DaemonSets**: One pod per node workloads
+4. **CronJobs**: Scheduled job executions
+
+#### Table Behavior
+- **Type Filtering**: Table displays only the workload type selected via pill selector
+- **Non-Interactive**: Workload rows are not clickable
+- **Visual Feedback**: Rows may have hover styles but no click actions
+- **Empty State**: When no workloads of selected type exist, display message: "No {type} found in this namespace"
+- **Namespace Filtering**: Table respects active namespace context from kubectl
+
 ### Namespace Button Behavior
 
 #### Button State
@@ -198,7 +280,6 @@ interface NamespaceContextChangedMessage extends ExtensionMessage {
 - **Button Label**: "Set as Default Namespace" (when enabled) or "Default Namespace" (when disabled)
 - **Enabled State**: Button is clickable when viewing a namespace that is NOT the current kubectl context namespace
 - **Disabled/Selected State**: Button is disabled with checkmark icon when viewing the namespace that IS the current kubectl context namespace
-- **Warning Label**: Shows "(Changes kubectl context globally)" to inform user
 
 #### User Interactions
 - **Click "Set as Default Namespace" button** (when enabled): 
@@ -266,7 +347,122 @@ interface NamespaceContextChangedMessage extends ExtensionMessage {
   display: none;
 }
 
-.namespace-info {
+/* Workloads Section Styling */
+.workloads-section {
+  padding: 20px;
+}
+
+.workloads-section h2 {
+  margin: 0 0 15px 0;
+  font-size: 1.2em;
+  font-weight: 600;
+  color: var(--vscode-foreground);
+}
+
+/* Pill Selector Styling */
+.workload-type-pills {
+  display: flex;
+  gap: 8px;
+  margin-bottom: 20px;
+  flex-wrap: wrap;
+}
+
+.pill-selector {
+  padding: 8px 16px;
+  border: 1px solid var(--vscode-panel-border);
+  background-color: var(--vscode-editor-background);
+  color: var(--vscode-descriptionForeground);
+  border-radius: 16px;
+  cursor: pointer;
+  font-size: 0.9em;
+  font-weight: 500;
+  transition: all 0.2s ease;
+}
+
+.pill-selector:hover:not(.active) {
+  background-color: var(--vscode-list-hoverBackground);
+  border-color: var(--vscode-focusBorder);
+}
+
+.pill-selector.active {
+  background-color: var(--vscode-button-background);
+  color: var(--vscode-button-foreground);
+  border-color: var(--vscode-button-background);
+  font-weight: 600;
+}
+
+.pill-selector:focus {
+  outline: 1px solid var(--vscode-focusBorder);
+  outline-offset: 2px;
+}
+
+/* Workloads Table Styling */
+
+.workloads-table {
+  width: 100%;
+  border-collapse: collapse;
+  background-color: var(--vscode-editor-background);
+  border: 1px solid var(--vscode-panel-border);
+  border-radius: 4px;
+}
+
+.workloads-table thead {
+  background-color: var(--vscode-editor-background);
+  border-bottom: 2px solid var(--vscode-panel-border);
+}
+
+.workloads-table th {
+  padding: 12px;
+  text-align: left;
+  font-weight: 600;
+  font-size: 0.9em;
+  color: var(--vscode-foreground);
+  text-transform: uppercase;
+  letter-spacing: 0.5px;
+}
+
+.workloads-table td {
+  padding: 12px;
+  border-bottom: 1px solid var(--vscode-panel-border);
+  font-size: 0.95em;
+}
+
+.workload-row {
+  cursor: default; /* Not clickable until profiles implemented */
+}
+
+.workload-row:hover {
+  background-color: var(--vscode-list-hoverBackground);
+}
+
+.health-indicator {
+  font-size: 1.2em;
+  margin-right: 6px;
+}
+
+.health-indicator.healthy {
+  color: var(--vscode-testing-iconPassed);
+}
+
+.health-indicator.degraded {
+  color: var(--vscode-editorWarning-foreground);
+}
+
+.health-indicator.unhealthy {
+  color: var(--vscode-testing-iconFailed);
+}
+
+.health-indicator.unknown {
+  color: var(--vscode-descriptionForeground);
+}
+
+.workload-health {
+  display: flex;
+  align-items: center;
+}
+
+.table-note {
+  margin-top: 10px;
   font-size: 0.85em;
   color: var(--vscode-descriptionForeground);
   font-style: italic;
@@ -358,6 +554,15 @@ interface AIRecommendation {
 - Clicking enabled button sets namespace as active and updates button state
 - External namespace context change detection and webview button update
 - Button state synchronization across multiple webviews for same namespace
+- Workloads section displays pill selectors for 4 workload types
+- Deployments pill is selected by default
+- Clicking pill updates table to show only selected workload type
+- Only one pill can be selected at a time
+- Health status correctly calculated from pod health checks
+- Ready/Desired replica counts display correctly
+- Workload items are non-interactive
+- Empty state message specific to selected workload type
+- Table respects active namespace filtering
 
 ## Security Considerations
```

### Feature: tree-view-navigation
File: ai/features/navigation/tree-view-navigation.feature.md

**Git Diff** (changes uncommitted):
```diff
diff --git a/ai/features/navigation/tree-view-navigation.feature.md b/ai/features/navigation/tree-view-navigation.feature.md
index 06b63bd..3c7cbed 100644
--- a/ai/features/navigation/tree-view-navigation.feature.md
+++ b/ai/features/navigation/tree-view-navigation.feature.md
@@ -51,7 +51,23 @@ Scenario: Viewing and selecting namespaces
   Then a webview panel should open for that namespace
   And the webview title should display the namespace name
   And the webview should show a "Set as Default Namespace" button
-  And the webview should allow browsing resources within that namespace
+  And the webview should display a workloads section with horizontal pill selectors
+  And the pill selectors should include: Deployments, StatefulSets, DaemonSets, and CronJobs
+  And each workload should show health status and ready/desired counts
+
+Scenario: Viewing workloads in namespace webview
+  Given a user has opened a namespace webview
+  When the workloads section is displayed
+  Then the pill selectors should show: Deployments, StatefulSets, DaemonSets, CronJobs
+  And the Deployments pill should be selected by default
+  And the table should show columns: Name, Namespace, Health, Ready/Desired
+  And the table should list only Deployments
+  When the user clicks on the StatefulSets pill
+  Then the table should update to list only StatefulSets
+  And each workload should display health status derived from pod health checks
+  And each workload should show ready replica count vs desired replica count
+  And workload items should be non-interactive
+  And hovering over workload rows should show visual feedback
 
 Scenario: Expanding Workloads category
   Given a user has expanded a cluster showing resource categories
```

### Feature: namespace-detail-view
File: ai/features/webview/namespace-detail-view.feature.md

**Git Status:** New file (not previously tracked)

### Spec: namespace-workloads-table-spec
File: ai/specs/webview/namespace-workloads-table.spec.md

**Git Status:** New file (not previously tracked)


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

**Create Stories** (*.story.md) in ai/tickets/initial-namespace-profile-contents/ for:
- Code changes and implementations
- New features or feature modifications
- Technical debt improvements
- Refactoring work

**Create Tasks** (*.task.md) in ai/tickets/initial-namespace-profile-contents/ for:
- Manual configuration in external systems
- Documentation updates outside code
- Third-party service setup
- Manual testing or verification steps

**Critical Requirements:**

1. **Keep Stories MINIMAL** - Each story should take < 30 minutes to implement
2. **Break Down Large Changes** - If a change is complex, create multiple small stories
3. **Use Proper Linkages** - Link stories/tasks to feature_id, spec_id, and model_id from changed files
4. **Link to Session** - ALL stories and tasks MUST include session_id: "initial-namespace-profile-contents" in their frontmatter
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
- ALL stories and tasks link back to session_id: "initial-namespace-profile-contents"

Now create all the story and task files in ai/tickets/initial-namespace-profile-contents/ following the schemas and requirements above.
