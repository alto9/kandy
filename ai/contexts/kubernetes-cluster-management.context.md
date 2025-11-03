---
context_id: kubernetes-cluster-management
---

# Kubernetes Cluster Management Context

GIVEN we are building a Kubernetes management tool
WHEN we need information about Kubernetes API and resources
THEN refer to the official Kubernetes API documentation at https://kubernetes.io/docs/reference/
AND use the Kubernetes client libraries for Node.js
AND study the kubectl source code for API interaction patterns

GIVEN we need to display cluster namespaces in a tree view
WHEN organizing the information hierarchy
THEN follow this structure: Cluster → Namespaces (with "All Namespaces" option first)
AND use kubectl commands to query namespace lists
AND open webviews for resource navigation when namespaces are clicked

GIVEN we need to verify cluster connectivity
WHEN checking connection status
THEN use kubectl commands (like `kubectl cluster-info`) to verify accessibility
AND do NOT use HTTP-based connectivity checks
AND do NOT implement automatic retry logic - require manual refresh from user
AND handle kubectl connection failures gracefully with clear error messages

GIVEN we need to analyze cluster performance and provide recommendations
WHEN collecting metrics and analyzing patterns
THEN use the Kubernetes Metrics API for resource usage data
AND implement trend analysis for resource utilization patterns
AND correlate events, logs, and metrics for comprehensive analysis

GIVEN we need to provide security analysis and recommendations
WHEN evaluating cluster security posture
THEN check for common security misconfigurations
AND analyze RBAC permissions and service account usage
AND identify potential security vulnerabilities in configurations

GIVEN we need to integrate with AI services for intelligent recommendations
WHEN designing AI prompts and context
THEN include cluster state, resource configurations, and usage patterns
AND provide specific context about the type of analysis requested
AND format AI responses for actionable recommendations

GIVEN we need to filter queries by a selected namespace
WHEN implementing namespace selection
THEN use kubectl's native context system to manage namespace selection
AND execute `kubectl config set-context --current --namespace=<namespace>` to set active namespace
AND execute `kubectl config view --minify --output=jsonpath='{..namespace}'` to read active namespace
AND execute `kubectl config set-context --current --namespace=''` to clear namespace selection
AND do NOT build a separate state management layer on top of kubectl context
AND cache the kubectl context state for 5 seconds to minimize file system reads
AND poll for external context changes every 30 seconds
AND provide clear visual feedback showing which namespace is active in kubectl context
AND display a warning that namespace changes affect kubectl globally
AND apply namespace filtering automatically to namespace-scoped resources
AND exclude cluster-scoped resources (like Nodes, PersistentVolumes) from namespace filtering
AND use `--all-namespaces` flag explicitly when showing cluster-wide views in UI
