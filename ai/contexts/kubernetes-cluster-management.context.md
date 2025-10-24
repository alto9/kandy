---
context_id: kubernetes-cluster-management
---

# Kubernetes Cluster Management Context

GIVEN we are building a Kubernetes management tool
WHEN we need information about Kubernetes API and resources
THEN refer to the official Kubernetes API documentation at https://kubernetes.io/docs/reference/
AND use the Kubernetes client libraries for Node.js
AND study the kubectl source code for API interaction patterns

GIVEN we need to display cluster resources in a tree view
WHEN organizing the information hierarchy
THEN follow this structure: Cluster → Namespace → Resource Type → Objects
AND group resources by their Kubernetes API groups (apps, core, networking, etc.)
AND provide filtering and search capabilities for large clusters

GIVEN we need to provide real-time cluster state information
WHEN implementing data updates
THEN use Kubernetes watch APIs for efficient real-time updates
AND implement connection pooling for API server communication
AND handle connection failures and reconnection gracefully

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
