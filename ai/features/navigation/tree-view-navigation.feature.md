---
feature_id: tree-view-navigation
spec_id: [tree-view-spec, webview-spec]
---

# Tree View Navigation Feature

```gherkin
Feature: Tree View Navigation

Background:
  Given the Kandy VS Code extension is installed and activated
  And the user has a valid kubeconfig file

Scenario: Viewing Kandy commands in VS Code
  Given a user has installed the Kandy VS Code extension
  When they open the VS Code command palette and search for "Kandy"
  Then they should see Kandy-related commands available

Scenario: Connecting to a cluster
  Given a user has a valid kubeconfig file
  When they run the "Kandy: Connect to Cluster" command
  Then the extension should parse their kubeconfig file
  And display available clusters in the Kandy tree view

Scenario: Expanding a cluster shows resource categories
  Given a user has connected to a cluster
  When they expand a cluster in the tree view
  Then they should see 7 resource-type categories in this order:
    | Nodes             |
    | Namespaces        |
    | Workloads         |
    | Storage           |
    | Helm              |
    | Configuration     |
    | Custom Resources  |

Scenario: Viewing nodes in the cluster
  Given a user has expanded a cluster showing resource categories
  When they expand the "Nodes" category
  Then they should see a list of all nodes in the cluster
  And clicking on a node should not perform any action at this point

Scenario: Viewing and selecting namespaces
  Given a user has expanded a cluster showing resource categories
  When they expand the "Namespaces" category
  Then they should see a list of all namespaces in the cluster
  When they click on a specific namespace
  Then a webview panel should open for that namespace
  And the webview should allow browsing resources within that namespace

Scenario: Expanding Workloads category
  Given a user has expanded a cluster showing resource categories
  When they expand the "Workloads" category
  Then they should see 4 subcategories:
    | Deployments   |
    | StatefulSets  |
    | DaemonSets    |
    | CronJobs      |

Scenario: Viewing Deployments and their pods
  Given a user has expanded the "Workloads" category
  When they expand "Deployments"
  Then they should see a list of all deployments
  And each deployment should be expandable to show its pods
  And clicking on a pod should not perform any action at this point

Scenario: Viewing StatefulSets and their pods
  Given a user has expanded the "Workloads" category
  When they expand "StatefulSets"
  Then they should see a list of all statefulsets
  And each statefulset should be expandable to show its pods
  And clicking on a pod should not perform any action at this point

Scenario: Viewing DaemonSets and their pods
  Given a user has expanded the "Workloads" category
  When they expand "DaemonSets"
  Then they should see a list of all daemonsets
  And each daemonset should be expandable to show its pods
  And clicking on a pod should not perform any action at this point

Scenario: Viewing CronJobs and their pods
  Given a user has expanded the "Workloads" category
  When they expand "CronJobs"
  Then they should see a list of all cronjobs
  And each cronjob should be expandable to show its pods
  And clicking on a pod should not perform any action at this point

Scenario: Expanding Storage category
  Given a user has expanded a cluster showing resource categories
  When they expand the "Storage" category
  Then they should see 3 subcategories:
    | Persistent Volumes        |
    | Persistent Volume Claims  |
    | Storage Classes           |

Scenario: Viewing Persistent Volumes
  Given a user has expanded the "Storage" category
  When they expand "Persistent Volumes"
  Then they should see a list of all persistent volumes
  And clicking on a persistent volume should not perform any action at this point

Scenario: Viewing Persistent Volume Claims
  Given a user has expanded the "Storage" category
  When they expand "Persistent Volume Claims"
  Then they should see a list of all persistent volume claims
  And clicking on a persistent volume claim should not perform any action at this point

Scenario: Viewing Storage Classes
  Given a user has expanded the "Storage" category
  When they expand "Storage Classes"
  Then they should see a list of all storage classes
  And clicking on a storage class should not perform any action at this point

Scenario: Viewing Helm releases
  Given a user has expanded a cluster showing resource categories
  When they expand the "Helm" category
  Then they should see a list of all installed helm releases
  And clicking on a helm release should not perform any action at this point

Scenario: Expanding Configuration category
  Given a user has expanded a cluster showing resource categories
  When they expand the "Configuration" category
  Then they should see 2 subcategories:
    | ConfigMaps |
    | Secrets    |

Scenario: Viewing ConfigMaps
  Given a user has expanded the "Configuration" category
  When they expand "ConfigMaps"
  Then they should see a list of all configmaps
  And clicking on a configmap should not perform any action at this point

Scenario: Viewing Secrets
  Given a user has expanded the "Configuration" category
  When they expand "Secrets"
  Then they should see a list of all secrets
  And clicking on a secret should not perform any action at this point

Scenario: Viewing Custom Resource Definitions
  Given a user has expanded a cluster showing resource categories
  When they expand the "Custom Resources" category
  Then they should see a list of all Custom Resource Definitions (CRDs)
  And clicking on a CRD should not perform any action at this point

Scenario: Switching between clusters
  Given a user has multiple clusters configured
  When they want to switch between clusters
  Then they should be able to select a different cluster from the tree view
  And the view should update to show the new cluster's resources

Scenario: Handling cluster connection failures
  Given a user is viewing a cluster in the tree view
  When the kubectl connection to the cluster fails
  Then the cluster should show a disconnected status
  And the extension should NOT automatically retry the connection
  And the user must manually trigger a refresh to reconnect

Scenario: Manually refreshing a disconnected cluster
  Given a user has a disconnected cluster
  When they trigger a manual refresh command
  Then the extension should attempt to reconnect using kubectl
  And update the cluster status based on the result
  And display an appropriate error message if kubectl cannot connect
```
