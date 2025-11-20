import * as vscode from 'vscode';
import { ClusterTreeItem } from '../../ClusterTreeItem';
import { TreeItemData } from '../../TreeItemTypes';
import { StorageCommands } from '../../../kubectl/StorageCommands';
import { KubectlError } from '../../../kubernetes/KubectlError';

/**
 * Type for error handler callback.
 */
type ErrorHandler = (error: KubectlError, clusterName: string) => void;

/**
 * Persistent Volume Claims subcategory handler.
 * Provides functionality to fetch and display persistent volume claims across all namespaces.
 */
export class PersistentVolumeClaimsSubcategory {
    /**
     * Retrieves persistent volume claim items for the Persistent Volume Claims subcategory.
     * Queries kubectl to get all persistent volume claims across all namespaces and creates tree items for display.
     * 
     * @param resourceData Cluster context and cluster information
     * @param kubeconfigPath Path to the kubeconfig file
     * @param errorHandler Callback to handle kubectl errors
     * @returns Array of persistent volume claim tree items
     */
    public static async getPersistentVolumeClaimItems(
        resourceData: TreeItemData,
        kubeconfigPath: string,
        errorHandler: ErrorHandler
    ): Promise<ClusterTreeItem[]> {
        const contextName = resourceData.context.name;
        const clusterName = resourceData.cluster?.name || contextName;
        
        // Query persistent volume claims using kubectl
        const result = await StorageCommands.getPersistentVolumeClaims(
            kubeconfigPath,
            contextName
        );

        // Handle errors if they occurred
        if (result.error) {
            errorHandler(result.error, clusterName);
            return [];
        }

        // If no persistent volume claims found, return empty array
        if (result.persistentVolumeClaims.length === 0) {
            return [];
        }

        // Create tree items for each persistent volume claim
        const pvcItems = result.persistentVolumeClaims.map(pvcInfo => {
            // Create tree item with 'persistentVolumeClaim' type
            const item = new ClusterTreeItem(
                `${pvcInfo.namespace}/${pvcInfo.name} (${pvcInfo.capacity})`,
                'persistentVolumeClaim',
                vscode.TreeItemCollapsibleState.None,
                {
                    ...resourceData,
                    resourceName: pvcInfo.name,
                    namespace: pvcInfo.namespace
                }
            );
            
            // Set context value for "View YAML" menu
            item.contextValue = 'resource:PersistentVolumeClaim';

            // Set description to show status
            item.description = pvcInfo.status;

            // Set icon based on status
            if (pvcInfo.status === 'Bound') {
                // Bound - green check icon
                item.iconPath = new vscode.ThemeIcon(
                    'check',
                    new vscode.ThemeColor('testing.iconPassed')
                );
            } else if (pvcInfo.status === 'Pending') {
                // Pending - sync/loading icon
                item.iconPath = new vscode.ThemeIcon(
                    'sync',
                    new vscode.ThemeColor('editorWarning.foreground')
                );
            } else {
                // Lost or other - warning icon
                item.iconPath = new vscode.ThemeIcon(
                    'warning',
                    new vscode.ThemeColor('editorWarning.foreground')
                );
            }

            // Set tooltip with detailed information
            item.tooltip = `Persistent Volume Claim: ${pvcInfo.name}\nNamespace: ${pvcInfo.namespace}\nCapacity: ${pvcInfo.capacity}\nStatus: ${pvcInfo.status}`;

            // No click command (placeholder)

            return item;
        });

        return pvcItems;
    }
}

