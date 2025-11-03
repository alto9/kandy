import * as vscode from 'vscode';
import { ClusterTreeItem } from '../../ClusterTreeItem';
import { TreeItemData } from '../../TreeItemTypes';
import { WorkloadCommands } from '../../../kubectl/WorkloadCommands';
import { PodTreeItem } from '../../items/PodTreeItem';
import { KubectlError } from '../../../kubernetes/KubectlError';

/**
 * Type for error handler callback.
 */
type ErrorHandler = (error: KubectlError, clusterName: string) => void;

/**
 * Deployments subcategory handler.
 * Provides functionality to fetch and display deployments and their pods.
 */
export class DeploymentsSubcategory {
    /**
     * Retrieves deployment items for the Deployments subcategory.
     * Queries kubectl to get all deployments across all namespaces and creates tree items for display.
     * 
     * @param resourceData Cluster context and cluster information
     * @param kubeconfigPath Path to the kubeconfig file
     * @param errorHandler Callback to handle kubectl errors
     * @returns Array of deployment tree items
     */
    public static async getDeploymentItems(
        resourceData: TreeItemData,
        kubeconfigPath: string,
        errorHandler: ErrorHandler
    ): Promise<ClusterTreeItem[]> {
        const contextName = resourceData.context.name;
        const clusterName = resourceData.cluster?.name || contextName;
        
        // Query deployments using kubectl
        const result = await WorkloadCommands.getDeployments(
            kubeconfigPath,
            contextName
        );

        // Handle errors if they occurred
        if (result.error) {
            errorHandler(result.error, clusterName);
            return [];
        }

        // If no deployments found, return empty array
        if (result.deployments.length === 0) {
            return [];
        }

        // Create tree items for each deployment
        const deploymentItems = result.deployments.map(deploymentInfo => {
            // Create tree item with 'deployment' type for individual deployment
            const item = new ClusterTreeItem(
                deploymentInfo.name,
                'deployment',
                vscode.TreeItemCollapsibleState.Collapsed,
                {
                    ...resourceData,
                    resourceName: deploymentInfo.name,
                    namespace: deploymentInfo.namespace,
                    labelSelector: deploymentInfo.selector
                }
            );

            // Set description to show namespace and replica status
            const replicaStatus = `${deploymentInfo.readyReplicas}/${deploymentInfo.replicas} ready`;
            item.description = `${deploymentInfo.namespace} • ${replicaStatus}`;

            // Set icon based on replica status
            if (deploymentInfo.readyReplicas === deploymentInfo.replicas && deploymentInfo.replicas > 0) {
                // All replicas ready
                item.iconPath = new vscode.ThemeIcon(
                    'check-all',
                    new vscode.ThemeColor('testing.iconPassed')
                );
            } else if (deploymentInfo.readyReplicas > 0) {
                // Some replicas ready
                item.iconPath = new vscode.ThemeIcon(
                    'sync',
                    new vscode.ThemeColor('editorWarning.foreground')
                );
            } else {
                // No replicas ready
                item.iconPath = new vscode.ThemeIcon(
                    'circle-outline',
                    new vscode.ThemeColor('testing.iconFailed')
                );
            }

            // Set tooltip with detailed information
            item.tooltip = `Deployment: ${deploymentInfo.name}\nNamespace: ${deploymentInfo.namespace}\nReplicas: ${replicaStatus}`;

            return item;
        });

        return deploymentItems;
    }

    /**
     * Retrieves pod items for a specific deployment.
     * Queries kubectl to get pods matching the deployment's label selector.
     * 
     * @param resourceData Cluster context and cluster information (includes resourceName and namespace)
     * @param kubeconfigPath Path to the kubeconfig file
     * @param labelSelector Label selector for finding pods
     * @param errorHandler Callback to handle kubectl errors
     * @returns Array of pod tree items
     */
    public static async getPodsForDeployment(
        resourceData: TreeItemData,
        kubeconfigPath: string,
        labelSelector: string,
        errorHandler: ErrorHandler
    ): Promise<PodTreeItem[]> {
        const contextName = resourceData.context.name;
        const clusterName = resourceData.cluster?.name || contextName;
        const deploymentName = resourceData.resourceName || 'Unknown';
        const namespace = resourceData.namespace || 'default';
        
        // Query pods using kubectl with label selector
        const result = await WorkloadCommands.getPodsForDeployment(
            kubeconfigPath,
            contextName,
            deploymentName,
            namespace,
            labelSelector
        );

        // Handle errors if they occurred
        if (result.error) {
            errorHandler(result.error, clusterName);
            return [];
        }

        // If no pods found, return empty array
        if (result.pods.length === 0) {
            return [];
        }

        // Create PodTreeItem for each pod
        const podItems = result.pods.map(podInfo => {
            // Map phase to PodStatus type
            let status: 'Running' | 'Pending' | 'Succeeded' | 'Failed' | 'Unknown' = 'Unknown';
            if (podInfo.phase === 'Running' || podInfo.phase === 'Pending' || 
                podInfo.phase === 'Succeeded' || podInfo.phase === 'Failed') {
                status = podInfo.phase as 'Running' | 'Pending' | 'Succeeded' | 'Failed';
            }

            return new PodTreeItem(
                {
                    name: podInfo.name,
                    namespace: podInfo.namespace,
                    status,
                    parentResource: deploymentName
                },
                resourceData
            );
        });

        return podItems;
    }
}

