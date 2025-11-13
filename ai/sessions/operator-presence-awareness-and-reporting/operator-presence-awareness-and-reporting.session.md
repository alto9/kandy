---
session_id: operator-presence-awareness-and-reporting
start_time: '2025-11-12T15:04:54.779Z'
status: development
problem_statement: kube9 needs to be aware of the presence and status of the kube9-operator.
changed_files:
  - path: ai/features/cluster/operator-presence-awareness.feature.md
    change_type: added
    scenarios_added:
      - Extension checks for operator presence on cluster connection
      - Extension determines basic status when operator not installed
      - Extension determines operated status when operator installed without key
      - >-
        Extension determines enabled status when operator installed with valid
        key
      - Extension determines degraded status when operator has issues
      - Extension updates cluster icon based on operator status
      - Extension shows status in cluster hover context menu
      - Extension refreshes operator status periodically
      - Extension handles status check failures gracefully
      - Extension maintains status awareness across all clusters
      - Extension uses status to enable appropriate features
      - Extension handles status parsing errors gracefully
      - Extension checks operator status on manual refresh
    scenarios_modified: []
    scenarios_removed: []
end_time: '2025-11-12T15:27:50.557Z'
---
## Problem Statement

kube9 needs to be aware of the presence and status of the kube9-operator.

## Goals

As part of connecting to a cluster, we need to determine the status of a cluster

| **basic** | No operator | - | kubectl-only operations, show installation prompts |
| **operated** | Installed, no key | No | Local webviews, basic features, show upgrade prompts |
| **enabled** | Installed, has key | Yes | Rich UIs from server, AI features, advanced dashboards |
| **degraded** | Installed, has key | No | Temporary fallback, registration failed |

## Approach

After connecting, check for the kube9-operator configmap, and if found, check for the status. The presence and status of the configmap should determine the reported status back to kube9-vscode.

## Key Decisions

none

## Notes

The status should cause an icon change in the kube9 clusters view. We will build out all future features based with the status in mind, so the extension should always be aware of each clusters reported operator status. Also add this status information to the hover context menu for each cluster in the menu.
