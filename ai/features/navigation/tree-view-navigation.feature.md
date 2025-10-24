---
feature_id: tree-view-navigation
spec_id: [tree-view-spec, webview-spec]
---

# Tree View Navigation Feature

GIVEN a user has installed the Kandy VS Code extension
WHEN they open the VS Code command palette and search for "Kandy"
THEN they should see Kandy-related commands available

GIVEN a user has a valid kubeconfig file
WHEN they run the "Kandy: Connect to Cluster" command
THEN the extension should parse their kubeconfig file
AND display available clusters in the Kandy tree view

GIVEN a user has connected to a cluster
WHEN they expand a cluster in the tree view
THEN they should see namespaces available in that cluster
AND expanding a namespace should show resource types (Workloads, Network, Storage, Configuration)

GIVEN a user has expanded resource types in the tree view
WHEN they select a specific resource (like a pod or deployment)
THEN a webview panel should open showing detailed information for that resource
AND the webview should display the resource YAML as part of the view

GIVEN a user has multiple clusters configured
WHEN they want to switch between clusters
THEN they should be able to select a different cluster from the tree view
AND the view should update to show the new cluster's resources

GIVEN a user is viewing cluster resources
WHEN cluster resources change (pods created, deleted, or status updated)
THEN the tree view should update in real-time to reflect current state
AND show appropriate status indicators (running, pending, failed, etc.)

GIVEN a user is viewing a large cluster with many resources
WHEN they need to find specific resources
THEN they should be able to use search and filtering capabilities
AND the tree view should efficiently handle the resource volume
