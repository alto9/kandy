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
 * Persistent Volumes subcategory handler.
 * Provides functionality to fetch and display persistent volumes.
 */
export class PersistentVolumesSubcategory {
    /**
     * Retrieves persistent volume items for the Persistent Volumes subcategory.
     * Queries kubectl to get all persistent volumes in the cluster and creates tree items for display.
     * 
     * @param resourceData Cluster context and cluster information
     * @param kubeconfigPath Path to the kubeconfig file
     * @param errorHandler Callback to handle kubectl errors
     * @returns Array of persistent volume tree items
     */
    public static async getPersistentVolumeItems(
        resourceData: TreeItemData,
        kubeconfigPath: string,
        errorHandler: ErrorHandler
    ): Promise<ClusterTreeItem[]> {
        const contextName = resourceData.context.name;
        const clusterName = resourceData.cluster?.name || contextName;
        
        // Query persistent volumes using kubectl
        const result = await StorageCommands.getPersistentVolumes(
            kubeconfigPath,
            contextName
        );

        // Handle errors if they occurred
        if (result.error) {
            errorHandler(result.error, clusterName);
            return [];
        }

        // If no persistent volumes found, return empty array
        if (result.persistentVolumes.length === 0) {
            return [];
        }

        // Create tree items for each persistent volume
        const pvItems = result.persistentVolumes.map(pvInfo => {
            // Create tree item with 'persistentVolume' type
            const item = new ClusterTreeItem(
                `${pvInfo.name} (${pvInfo.capacity})`,
                'persistentVolume',
                vscode.TreeItemCollapsibleState.None,
                {
                    ...resourceData,
                    resourceName: pvInfo.name
                }
            );
            
            // Set context value for "View YAML" menu
            item.contextValue = 'resource:PersistentVolume';

            // Set description to show status
            item.description = pvInfo.status;

            // Set icon based on status
            if (pvInfo.status === 'Bound') {
                // Bound - green check icon
                item.iconPath = new vscode.ThemeIcon(
                    'check',
                    new vscode.ThemeColor('testing.iconPassed')
                );
            } else if (pvInfo.status === 'Available') {
                // Available - gray circle icon
                item.iconPath = new vscode.ThemeIcon('circle-outline');
            } else {
                // Released, Failed, or other - warning icon
                item.iconPath = new vscode.ThemeIcon(
                    'warning',
                    new vscode.ThemeColor('editorWarning.foreground')
                );
            }

            // Set tooltip with detailed information
            let tooltip = `Persistent Volume: ${pvInfo.name}\nCapacity: ${pvInfo.capacity}\nStatus: ${pvInfo.status}`;
            if (pvInfo.claimRef) {
                tooltip += `\nClaim: ${pvInfo.claimRef}`;
            }
            item.tooltip = tooltip;

            // No click command (placeholder)

            return item;
        });

        return pvItems;
    }
}

