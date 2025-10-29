---
context_id: vscode-extension-development
---

# VS Code Extension Development Context

GIVEN we are developing a VS Code extension for Kubernetes management
WHEN we need information about VS Code extension architecture and APIs
THEN use the VS Code Extension API documentation for VS Code 1.80.0+
AND refer to the VS Code Extension Guide at https://code.visualstudio.com/api
AND examine successful Kubernetes extensions like ms-kubernetes-tools.vscode-kubernetes-tools
AND ensure compatibility with Node.js 22 LTS runtime environment

GIVEN we need to implement tree views and webview panels
WHEN looking for implementation examples
THEN study the VS Code TreeView API documentation
AND review the Webview API documentation at https://code.visualstudio.com/api/extension-guides/webview
AND examine how the Glam VS Code extension implements similar functionality

GIVEN we need to retrieve cluster data
WHEN implementing data access
THEN use kubectl commands to query cluster state
AND avoid automatic polling or background refresh mechanisms
AND require user to manually trigger refresh when needed
AND consider using the VS Code OutputChannel for debugging information

GIVEN we need to integrate with AI services
WHEN designing the AI integration layer
THEN use the VS Code extension host APIs for HTTP requests
AND implement secure credential management using VS Code's secret storage
AND consider rate limiting and caching to optimize AI service calls

GIVEN we need to handle multiple clusters and contexts
WHEN implementing cluster management
THEN use the kubeconfig file format as the standard
AND implement context switching using VS Code's workspace state
AND provide clear visual indicators for the active cluster

GIVEN we need to provide YAML integration
WHEN working with Kubernetes manifests
THEN integrate with VS Code's YAML language features
AND provide syntax highlighting and validation
AND implement quick actions for common YAML operations
