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
THEN they should see "All Namespaces" as the first option
AND they should see individual namespaces listed alphabetically below it

GIVEN a user has expanded a cluster showing namespaces
WHEN they click on the "All Namespaces" option
THEN a webview panel should open showing cluster-wide resource navigation
AND the webview should allow browsing resources across all namespaces

GIVEN a user has expanded a cluster showing namespaces
WHEN they click on a specific namespace
THEN a webview panel should open for that namespace
AND the webview should allow browsing resources within that namespace

GIVEN a user has multiple clusters configured
WHEN they want to switch between clusters
THEN they should be able to select a different cluster from the tree view
AND the view should update to show the new cluster's resources

GIVEN a user is viewing a cluster in the tree view
WHEN the kubectl connection to the cluster fails
THEN the cluster should show a disconnected status
AND the extension should NOT automatically retry the connection
AND the user must manually trigger a refresh to reconnect

GIVEN a user has a disconnected cluster
WHEN they trigger a manual refresh command
THEN the extension should attempt to reconnect using kubectl
AND update the cluster status based on the result
AND display an appropriate error message if kubectl cannot connect
