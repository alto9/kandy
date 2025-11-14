---
feature_id: namespace-detail-view
spec_id: [webview-spec, namespace-workloads-table-spec, yaml-editor-spec]
model_id: [namespace-selection-state]
context_id: [kubernetes-cluster-management]
---

# Namespace Detail View Feature

```gherkin
Feature: Namespace Detail View

Background:
  Given the kube9 VS Code extension is installed and activated
  And the user has a valid kubeconfig file
  And the user is connected to a cluster

Scenario: Opening namespace webview displays workloads section
  Given a user has expanded the "Namespaces" category in the tree view
  When they click on a namespace named "production"
  Then a webview panel should open
  And the webview title should display "production" as an h1 element
  And the webview should show a "Set as Default Namespace" button
  And the webview should display a workloads section with horizontal pill selectors
  And the pill selectors should show: Deployments, StatefulSets, DaemonSets, CronJobs
  And the Deployments pill should be selected by default
  And the table should have columns: Name, Namespace, Health, Ready/Desired

Scenario: Switching between workload types using pill selectors
  Given a user has opened a namespace webview for "production"
  And the namespace contains various workload resources
  When the webview is displayed
  Then the Deployments pill should be selected by default
  And the table should display only Deployments
  When the user clicks on the "StatefulSets" pill
  Then the StatefulSets pill should become selected
  And the Deployments pill should become unselected
  And the table should update to display only StatefulSets
  When the user clicks on the "DaemonSets" pill
  Then the table should update to display only DaemonSets
  When the user clicks on the "CronJobs" pill
  Then the table should update to display only CronJobs

Scenario: Workload health status displays correctly
  Given a namespace webview is displaying a workloads table
  When a Deployment has all replicas ready and all pod health checks passing
  Then the health column should show a green indicator
  And the health text should display "Healthy"
  When a StatefulSet has some replicas ready but not all
  Then the health column should show a yellow indicator
  And the health text should display "Degraded"
  When a DaemonSet has no ready replicas
  Then the health column should show a red indicator
  And the health text should display "Unhealthy"
  When a CronJob health status cannot be determined
  Then the health column should show a gray indicator
  And the health text should display "Unknown"

Scenario: Ready and desired replica counts display
  Given a namespace webview is displaying a workloads table
  When a Deployment named "nginx-deployment" has 3 ready replicas out of 3 desired
  Then the Ready/Desired column should display "3/3"
  When a StatefulSet named "redis-statefulset" has 2 ready replicas out of 5 desired
  Then the Ready/Desired column should display "2/5"
  When a DaemonSet named "fluentd-daemonset" has 0 ready replicas out of 3 desired
  Then the Ready/Desired column should display "0/3"

Scenario: Health calculation based on pod health checks
  Given a namespace webview is displaying a workloads table
  And a Deployment has 3 pods with the following health check status:
    | Pod | Readiness | Liveness | Health Status |
    | pod-1 | Passing | Passing | Healthy |
    | pod-2 | Passing | Passing | Healthy |
    | pod-3 | Passing | Passing | Healthy |
  Then the Deployment health should be "Healthy"
  When pod-2's liveness check starts failing
  Then the Deployment health should update to "Degraded"
  When all pods' health checks fail
  Then the Deployment health should update to "Unhealthy"

Scenario: Workload items are non-interactive
  Given a namespace webview is displaying a workloads table
  When a user hovers over a workload row
  Then the row should show hover styling
  But the cursor should remain as default (not pointer)
  When a user clicks on a workload row
  Then no action should occur
  And no detail view should open
  And the table should display an informational note about item interactivity

Scenario: Empty state for workload type with no resources
  Given a user has opened a namespace webview for "production"
  And the Deployments pill is selected
  When the namespace contains no Deployments
  Then the table should display an empty state message
  And the message should read "No deployments found in this namespace"
  When the user clicks on the "StatefulSets" pill
  And the namespace contains no StatefulSets
  Then the table should display "No statefulsets found in this namespace"

Scenario: Namespace filtering respects active context
  Given a user has "production" set as the active namespace in kubectl context
  When they open a namespace webview for "production"
  Then the workloads table should show only workloads in the "production" namespace
  And workloads from other namespaces should not appear
  When the user changes the active namespace to "staging"
  And they open a new webview for "staging"
  Then the new webview should show only workloads in the "staging" namespace

Scenario: All Namespaces view shows cross-namespace workloads
  Given a user has "All Namespaces" selected in kubectl context
  When they open the namespace webview for "All Namespaces"
  Then the workloads table should show workloads from all namespaces
  And the Namespace column should display the namespace for each workload
  And workloads should be grouped or sorted by namespace

Scenario: Workload table updates on refresh
  Given a user has a namespace webview open for "production"
  And the Deployments pill is selected
  And the workloads table is displaying current Deployments
  When a new Deployment is created in the "production" namespace externally
  And the user triggers a refresh in the webview
  Then the workloads table should update to include the new Deployment
  And the new Deployment should show current health status and replica counts

Scenario: Pill selector visual styling
  Given a namespace webview is displaying the workloads section
  Then the selected pill should have distinct visual styling
  And unselected pills should have subdued styling
  And hovering over an unselected pill should show hover feedback
  And the pills should be clearly distinguishable from each other

Scenario: Table responsiveness and scrolling
  Given a namespace webview is displaying a workloads table
  And the namespace contains 50 workloads
  When the workloads table is rendered
  Then all 50 workloads should be displayed in the table
  And the table should be scrollable if it exceeds viewport height
  And table headers should remain visible when scrolling
  And the table should be responsive to window resizing

Scenario: Health indicator visual clarity
  Given a namespace webview is displaying workloads with various health states
  Then the healthy indicator should be green and clearly visible
  And the degraded indicator should be yellow/orange and clearly visible
  And the unhealthy indicator should be red and clearly visible
  And the unknown indicator should be gray and clearly visible
  And each indicator should include both a colored dot and status text
  And the indicators should be accessible with sufficient contrast

Scenario: Namespace name displays correctly throughout webview
  Given a user clicks on a namespace named "kube-system"
  When the webview opens
  Then the title should display "kube-system"
  And the workloads table namespace column should show "kube-system" for all workloads
  And all references to the namespace should use the name "kube-system"

Scenario: Clean namespace button display
  Given a user has opened a namespace webview
  When viewing the "Set as Default Namespace" button area
  Then the button should be visible
  And the button area should be clean and uncluttered

Scenario: View YAML button appears in namespace header
  Given a user has opened a namespace webview for "production"
  When viewing the namespace header
  Then a "View YAML" button should appear next to the "Set as Default Namespace" button
  And the button should have a document icon
  And the button should be clearly labeled "View YAML"

Scenario: Clicking View YAML button opens namespace YAML editor
  Given a user has opened a namespace webview for "production"
  When the user clicks the "View YAML" button in the header
  Then a new editor tab should open
  And the tab should display "production.yaml"
  And the editor should show the full YAML configuration for the namespace
  And the editor should be in editable mode

Scenario: View YAML button respects namespace permissions
  Given a user has opened a namespace webview for "production"
  And the user has read-only permissions for the namespace
  When the user clicks the "View YAML" button in the header
  Then the YAML editor should open
  But the editor should be in read-only mode
  And a message should indicate insufficient permissions to edit
```

