---
feature_id: yaml-editor
spec_id: [yaml-editor-spec, tree-view-spec, webview-spec]
model_id: [namespace-selection-state]
context_id: [kubernetes-cluster-management, vscode-extension-development]
---

# YAML Editor Feature

```gherkin
Feature: YAML Editor for Kubernetes Resources

Background:
  Given the kube9 VS Code extension is installed and activated
  And the user has a valid kubeconfig file
  And the user is connected to a cluster

Scenario: Opening YAML editor from tree view context menu
  Given a user has expanded the "Namespaces" category in the tree view
  And they have expanded a namespace named "production"
  And the namespace contains a Deployment named "nginx-deployment"
  When they right-click on "nginx-deployment" in the tree view
  Then a context menu should appear
  And the context menu should include "View YAML" option
  When they click "View YAML"
  Then a new editor tab should open
  And the tab title should display "nginx-deployment.yaml"
  And the editor should display the full YAML configuration for the Deployment
  And the YAML should be syntax highlighted
  And the editor should be in editable mode

Scenario: Opening YAML editor from namespace webview button
  Given a user has opened a namespace webview for "production"
  When the user views the namespace header
  Then a "View YAML" button should appear next to the "Set as Default Namespace" button
  When the user clicks the "View YAML" button
  Then a new editor tab should open
  And the tab title should display "production.yaml"
  And the editor should display the full YAML configuration for the namespace
  And the YAML should be syntax highlighted
  And the editor should be in editable mode

Scenario: YAML content displays complete resource definition
  Given a user has opened a YAML editor for a Deployment
  When the YAML content is displayed
  Then the YAML should include the apiVersion field
  And the YAML should include the kind field
  And the YAML should include the metadata section with name and namespace
  And the YAML should include the spec section with full configuration
  And the YAML should include the status section (read-only)
  And all managed fields should be included
  And the YAML should be properly formatted with correct indentation

Scenario: Editing YAML content
  Given a user has opened a YAML editor for a Deployment named "nginx-deployment"
  And the Deployment currently has 2 replicas
  When the user changes the replicas field from 2 to 3
  And the user saves the file using Ctrl+S (or Cmd+S on Mac)
  Then the editor should show a "Saving..." indicator
  And the changes should be applied to the cluster using kubectl apply
  And the editor should display a success message "YAML saved successfully"
  And the file should be marked as saved (no dirty indicator)
  And the tree view should refresh to reflect the changes
  And the namespace webview should refresh if open

Scenario: YAML validation on save
  Given a user has opened a YAML editor for a StatefulSet
  When the user introduces a syntax error in the YAML (invalid indentation)
  And the user attempts to save the file
  Then the editor should display a validation error
  And the error message should indicate "Invalid YAML syntax"
  And the error should highlight the line with the issue
  And the file should not be applied to the cluster
  And the dirty indicator should remain on the file

Scenario: Kubernetes validation on save
  Given a user has opened a YAML editor for a DaemonSet
  When the user changes a required field to an invalid value
  And the user saves the file
  Then the editor should attempt to apply the changes
  And kubectl should return a validation error
  And the editor should display the kubectl error message
  And the error message should include details from the Kubernetes API
  And the file should remain in unsaved state
  And the user should be able to correct the error and retry

Scenario: Dry-run validation before save
  Given a user has opened a YAML editor for a CronJob
  And the user has made changes to the schedule field
  When the user saves the file
  Then the extension should first perform a dry-run validation
  And the dry-run should use `kubectl apply --dry-run=server`
  And if the dry-run succeeds, the actual apply should proceed
  And if the dry-run fails, the error should be displayed without applying changes

Scenario: Read-only YAML view for insufficient permissions
  Given a user is connected to a cluster
  And the user has read-only permissions for namespace "production"
  When the user opens a YAML editor for a Deployment in "production"
  Then the editor should display the YAML content
  But the editor should be in read-only mode
  And the editor should display a message "Read-only: Insufficient permissions to edit this resource"
  And the save command should be disabled
  And attempting to edit should show a warning notification

Scenario: Multiple YAML editors open simultaneously
  Given a user has opened a YAML editor for "nginx-deployment"
  And they have opened a YAML editor for "api-deployment"
  When they make changes to "nginx-deployment" and save
  Then only the "nginx-deployment" should be updated in the cluster
  And the "api-deployment" editor should remain unchanged
  And each editor should maintain its own state independently

Scenario: YAML editor closes with unsaved changes
  Given a user has opened a YAML editor for a Deployment
  And the user has made changes to the YAML
  When the user attempts to close the editor tab
  Then VS Code should prompt "Do you want to save the changes?"
  And the prompt should offer options: Save, Don't Save, Cancel
  When the user clicks "Save"
  Then the changes should be applied to the cluster
  And the tab should close
  When the user clicks "Don't Save"
  Then the changes should be discarded
  And the tab should close
  When the user clicks "Cancel"
  Then the tab should remain open with unsaved changes

Scenario: YAML editor for cluster-scoped resources
  Given a user has expanded the "Nodes" category in the tree view
  And they right-click on a node named "worker-node-1"
  When they click "View YAML"
  Then a YAML editor should open for the node resource
  And the YAML should display the full node configuration
  And the namespace field should not be present (cluster-scoped resource)
  And saving changes should work the same as namespaced resources

Scenario: YAML editor refresh after external changes
  Given a user has opened a YAML editor for a Deployment named "nginx-deployment"
  And the Deployment is modified externally (e.g., via kubectl or another tool)
  When the external change occurs
  Then the editor should detect the conflict
  And the editor should display a notification "This resource has been modified externally"
  And the user should be given options: Reload, Compare, Keep Local
  When the user clicks "Reload"
  Then the editor should fetch the latest YAML from the cluster
  And the editor should replace the current content with the latest version
  And any unsaved local changes should be discarded

Scenario: Syntax highlighting for YAML in editor
  Given a user has opened a YAML editor for any resource
  Then the YAML content should have syntax highlighting
  And keys should be displayed in one color
  And values should be displayed in another color
  And comments should be displayed in a distinct color
  And strings should be displayed with string formatting
  And the syntax highlighting should match VS Code's YAML language mode

Scenario: Context menu only appears for editable resources
  Given a user is viewing the tree view
  When they right-click on a category label like "Namespaces" or "Workloads"
  Then the context menu should NOT include "View YAML"
  When they right-click on an actual resource (Deployment, Pod, Service, etc.)
  Then the context menu should include "View YAML"
  And the menu item should be enabled if the resource supports YAML operations

Scenario: YAML editor for namespace resources
  Given a user has opened a namespace webview for "production"
  When the user clicks the "View YAML" button in the header
  Then a YAML editor should open for the namespace resource
  And the editor should display the namespace's YAML configuration
  And the editor should provide editing and saving capabilities

Scenario: Error handling for kubectl failures
  Given a user has opened a YAML editor for a Deployment
  And the user has made valid changes to the YAML
  When the user saves the file
  And kubectl is not available or the cluster connection is lost
  Then the editor should display an error message
  And the message should indicate "Failed to apply changes: Unable to connect to cluster"
  And the file should remain in unsaved state
  And the user should be able to retry after connectivity is restored

Scenario: YAML editor respects active namespace context
  Given a user has set "production" as the active namespace in kubectl context
  When they open the namespace webview and click "View YAML" on a Deployment
  Then the YAML editor should open with the Deployment's full configuration
  And the namespace field in metadata should show "production"
  And when saving changes, kubectl should apply to the "production" namespace

Scenario: File name convention for YAML editor tabs
  Given a user opens a YAML editor for various resources
  When they open a Deployment named "nginx-deployment"
  Then the tab should be titled "nginx-deployment.yaml"
  When they open a StatefulSet named "redis-statefulset" in namespace "production"
  Then the tab should be titled "redis-statefulset.yaml"
  When they open a Node named "worker-node-1"
  Then the tab should be titled "worker-node-1.yaml"
  And all tabs should use the pattern "<resource-name>.yaml"

Scenario: Quick access to YAML editor via command palette
  Given a user is viewing the tree view or namespace webview
  When they open the VS Code command palette (Ctrl+Shift+P or Cmd+Shift+P)
  And they type "Kube9: View YAML"
  Then they should see the command "Kube9: View Resource YAML"
  When they select the command
  Then they should be prompted to select a resource from a quick pick list
  And upon selection, the YAML editor should open for that resource
```

