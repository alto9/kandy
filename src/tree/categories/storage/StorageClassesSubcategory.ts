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
 * Storage Classes subcategory handler.
 * Provides functionality to fetch and display storage classes.
 */
export class StorageClassesSubcategory {
    /**
     * Retrieves storage class items for the Storage Classes subcategory.
     * Queries kubectl to get all storage classes in the cluster and creates tree items for display.
     * 
     * @param resourceData Cluster context and cluster information
     * @param kubeconfigPath Path to the kubeconfig file
     * @param errorHandler Callback to handle kubectl errors
     * @returns Array of storage class tree items
     */
    public static async getStorageClassItems(
        resourceData: TreeItemData,
        kubeconfigPath: string,
        errorHandler: ErrorHandler
    ): Promise<ClusterTreeItem[]> {
        const contextName = resourceData.context.name;
        const clusterName = resourceData.cluster?.name || contextName;
        
        // Query storage classes using kubectl
        const result = await StorageCommands.getStorageClasses(
            kubeconfigPath,
            contextName
        );

        // Handle errors if they occurred
        if (result.error) {
            errorHandler(result.error, clusterName);
            return [];
        }

        // If no storage classes found, return empty array
        if (result.storageClasses.length === 0) {
            return [];
        }

        // Create tree items for each storage class
        const scItems = result.storageClasses.map(scInfo => {
            // Create tree item with 'storageClass' type
            const item = new ClusterTreeItem(
                scInfo.name,
                'storageClass',
                vscode.TreeItemCollapsibleState.None,
                {
                    ...resourceData,
                    resourceName: scInfo.name
                }
            );
            
            // Set context value for "View YAML" menu
            item.contextValue = 'resource:StorageClass';

            // Set description to show provisioner type
            item.description = scInfo.provisioner;

            // Set icon based on whether it's the default storage class
            if (scInfo.isDefault) {
                // Default storage class - star icon with accent color
                item.iconPath = new vscode.ThemeIcon(
                    'star-full',
                    new vscode.ThemeColor('charts.yellow')
                );
            } else {
                // Non-default storage class - class icon
                item.iconPath = new vscode.ThemeIcon('symbol-class');
            }

            // Set tooltip with detailed information
            let tooltip = `Storage Class: ${scInfo.name}\nProvisioner: ${scInfo.provisioner}`;
            if (scInfo.isDefault) {
                tooltip += '\nDefault: Yes';
            }
            item.tooltip = tooltip;

            // No click command (placeholder)

            return item;
        });

        return scItems;
    }
}

