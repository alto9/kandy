---
story_id: add-namespace-webview-button
session_id: yaml-editing-and-saving
feature_id: [yaml-editor, namespace-detail-view]
spec_id: [yaml-editor-spec, webview-spec]
status: pending
priority: high
estimated_minutes: 25
---

## Objective

Add "View YAML" button to namespace webview header that opens YAML editor for the namespace resource.

## Context

The namespace webview header should have a "View YAML" button next to "Set as Default Namespace" button. Clicking it opens the YAML editor for the namespace resource itself.

## Implementation Steps

1. Update namespace webview HTML template to include button:
   ```html
   <button id="view-namespace-yaml" class="view-yaml-btn" data-namespace="<namespace-name>">
     <span class="btn-icon">📄</span>
     <span class="btn-text">View YAML</span>
   </button>
   ```
2. Add CSS styling for `.view-yaml-btn` (secondary button style)
3. Add JavaScript click handler in webview that sends message to extension:
   ```javascript
   vscode.postMessage({
     command: 'openYAML',
     resource: {
       kind: 'Namespace',
       name: namespaceName,
       apiVersion: 'v1'
     }
   });
   ```
4. Update webview message handler in extension to handle 'openYAML' command
5. Call `yamlEditorManager.openYAMLEditor(resource)` when message received

## Files Affected

- `src/webview/namespaceWebview.html` - Add button to header
- `src/webview/namespaceWebview.css` - Style the button
- `src/webview/namespaceWebview.js` - Add click handler
- `src/webview/NamespaceWebviewProvider.ts` - Handle openYAML message

## Acceptance Criteria

- [ ] "View YAML" button appears in namespace header
- [ ] Button positioned next to "Set as Default Namespace" button
- [ ] Button has document icon and label
- [ ] Clicking button sends correct message to extension
- [ ] Extension opens YAML editor for namespace resource
- [ ] Tab title shows namespace name with .yaml extension

## Dependencies

- Story 004 (Open YAML editor) must be completed

