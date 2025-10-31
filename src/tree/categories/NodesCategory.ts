import * as vscode from 'vscode';
import { ClusterTreeItem } from '../ClusterTreeItem';
import { TreeItemData } from '../TreeItemTypes';
import { NodeCommands } from '../../kubectl/NodeCommands';
import { KubectlError } from '../../kubernetes/KubectlError';

/**
 * Type for error handler callback.
 */
type ErrorHandler = (error: KubectlError, clusterName: string) => void;

/**
 * Nodes category handler.
 * Provides functionality to fetch and display cluster nodes.
 */
export class NodesCategory {
    /**
     * Retrieves node items for the Nodes category.
     * Queries kubectl to get all nodes and creates tree items for display.
     * 
     * @param resourceData Cluster context and cluster information
     * @param kubeconfigPath Path to the kubeconfig file
     * @param errorHandler Callback to handle kubectl errors
     * @returns Array of node tree items
     */
    public static async getNodeItems(
        resourceData: TreeItemData,
        kubeconfigPath: string,
        errorHandler: ErrorHandler
    ): Promise<ClusterTreeItem[]> {
        const contextName = resourceData.context.name;
        const clusterName = resourceData.cluster?.name || contextName;
        
        // Query nodes using kubectl
        const result = await NodeCommands.getNodes(
            kubeconfigPath,
            contextName
        );

        // Handle errors if they occurred
        if (result.error) {
            errorHandler(result.error, clusterName);
            return [];
        }

        // If no nodes found (empty cluster), return empty array
        if (result.nodes.length === 0) {
            return [];
        }

        // Create tree items for each node
        const nodeItems = result.nodes.map(nodeInfo => {
            const item = new ClusterTreeItem(
                nodeInfo.name,
                'nodes',
                vscode.TreeItemCollapsibleState.None,
                resourceData
            );

            // Set description to show roles
            if (nodeInfo.roles.length > 0) {
                item.description = nodeInfo.roles.join(', ');
            }

            // Set icon based on node status
            switch (nodeInfo.status) {
                case 'Ready':
                    item.iconPath = new vscode.ThemeIcon(
                        'check',
                        new vscode.ThemeColor('testing.iconPassed')
                    );
                    break;
                case 'NotReady':
                    item.iconPath = new vscode.ThemeIcon(
                        'warning',
                        new vscode.ThemeColor('testing.iconFailed')
                    );
                    break;
                default: // Unknown
                    item.iconPath = new vscode.ThemeIcon('question');
                    break;
            }

            // Set tooltip with detailed information
            item.tooltip = `Node: ${nodeInfo.name}\nStatus: ${nodeInfo.status}\nRoles: ${nodeInfo.roles.join(', ')}`;

            // No command - clicking a node is a no-op at this stage (placeholder for future)
            
            return item;
        });

        return nodeItems;
    }
}

