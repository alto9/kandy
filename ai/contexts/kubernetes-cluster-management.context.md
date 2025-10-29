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
