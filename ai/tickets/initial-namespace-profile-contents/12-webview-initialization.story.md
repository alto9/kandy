---
story_id: webview-initialization
session_id: initial-namespace-profile-contents
feature_id: [namespace-detail-view]
spec_id: [webview-spec, namespace-workloads-table-spec]
model_id: []
status: pending
priority: high
estimated_minutes: 20
---

## Objective

Update the webview initialization flow in NamespaceWebview.ts to automatically fetch and send Deployments data when a namespace webview is first opened, ensuring the table displays immediately with the default workload type.

## Context

When a user clicks on a namespace in the tree view, the webview should open with the Deployments pill already selected and the table populated with Deployment data. This requires fetching initial workload data during webview initialization rather than waiting for the user to click a pill.

## Implementation Steps

1. Open `src/webview/NamespaceWebview.ts`
2. Locate the `show()` method where webview is initialized
3. After setting webview HTML content and sending namespace data, add initial workload fetch:
   - Call fetchWorkloads internally with workloadType: 'Deployment'
   - Use the same logic as the fetchWorkloads message handler
   - Send workloadsData message to webview with initial Deployments
4. Alternatively, create a new method `sendInitialWorkloadData(panel, namespaceContext)`
   - Fetch Deployments data
   - Calculate health for each deployment
   - Send workloadsData message to webview
5. Ensure initial fetch happens after HTML content is set but before webview is revealed
6. Handle errors gracefully by sending empty workloads array if initial fetch fails
7. Add loading state handling if fetch takes longer than expected
8. Update main.js to handle workloadsData message and call renderWorkloadsTable

## Files Affected

- `src/webview/NamespaceWebview.ts` - Add initial workload data fetch to show() method
- `src/webview/main.js` - Add workloadsData message handler to render table

## Acceptance Criteria

- [ ] Webview initialization triggers automatic Deployments fetch
- [ ] Initial workload data is fetched after HTML is set
- [ ] workloadsData message is sent to webview with Deployments data
- [ ] main.js handles workloadsData message and renders table
- [ ] Table displays immediately when webview opens (no manual pill click needed)
- [ ] Deployments pill shows as active on initial load
- [ ] Error during initial fetch displays empty state gracefully
- [ ] Initial fetch uses same health calculation logic as manual fetches
- [ ] Webview opens quickly without blocking on data fetch
- [ ] Subsequent pill clicks still work correctly after initialization

## Dependencies

- Story 11 (workload-fetch-message-handler) - Reuses same fetch logic
- Story 09 (table-rendering-logic) - main.js must handle workloadsData message
- Story 08 (pill-selector-interaction) - Ensures Deployments pill is active by default

