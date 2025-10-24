---
feature_id: ai-recommendations
spec_id: [ai-service-spec, webview-spec]
---

# AI Recommendations Feature

GIVEN a user has selected a resource in the Kandy tree view
WHEN the webview panel opens for that resource
THEN the extension should send the resource data to the Kandy server for AI analysis
AND display AI-generated recommendations in the webview panel

GIVEN a user is viewing a pod in the webview panel
WHEN the AI analyzes the pod configuration and cluster state
THEN it should provide recommendations such as:
- Resource limit optimizations based on usage patterns
- Security improvements for the pod configuration
- Performance suggestions based on cluster capacity
- Best practice recommendations for pod configuration

GIVEN a user is viewing a deployment in the webview panel
WHEN the AI analyzes the deployment strategy and scaling configuration
THEN it should provide recommendations such as:
- HPA configuration improvements based on traffic patterns
- Resource allocation optimizations
- Update strategy recommendations
- Security policy suggestions

GIVEN a user is viewing a service in the webview panel
WHEN the AI analyzes the service configuration and network policies
THEN it should provide recommendations such as:
- Network policy improvements for security
- Load balancer configuration optimizations
- Service mesh integration suggestions
- Traffic routing improvements

GIVEN a user is editing YAML in VS Code
WHEN they save the file or trigger validation
THEN the AI should analyze the YAML against current cluster state
AND show recommendations inline or in the problems panel
AND provide quick fix options for applying AI suggestions

GIVEN a user receives AI recommendations
WHEN they want to apply a recommendation
THEN they should be able to click "Apply Suggestion"
AND the recommendation should be applied to their YAML or cluster configuration
AND the AI should validate the change before applying

GIVEN the AI service is unavailable
WHEN users request recommendations
THEN the extension should show a fallback message
AND provide basic recommendations based on local analysis
AND indicate that full AI features require service connectivity

GIVEN a user wants to understand why a recommendation was made
WHEN they click on a recommendation
THEN they should see an explanation of the AI's reasoning
AND see the cluster data and patterns that led to the recommendation
AND understand the potential impact of applying the suggestion
