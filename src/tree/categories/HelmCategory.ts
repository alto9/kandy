import * as vscode from 'vscode';
import { ClusterTreeItem } from '../ClusterTreeItem';
import { TreeItemData } from '../TreeItemTypes';
import { HelmCommands } from '../../kubectl/HelmCommands';
import { KubectlError } from '../../kubernetes/KubectlError';

/**
 * Type for error handler callback.
 */
type ErrorHandler = (error: KubectlError, clusterName: string) => void;

/**
 * Helm category handler.
 * Provides functionality to fetch and display helm releases.
 */
export class HelmCategory {
    /**
     * Retrieves helm release items for the Helm category.
     * Queries helm CLI to get all releases across all namespaces and creates tree items for display.
     * 
     * @param resourceData Cluster context and cluster information
     * @param kubeconfigPath Path to the kubeconfig file
     * @param errorHandler Callback to handle helm/kubectl errors
     * @returns Array of helm release tree items
     */
    public static async getHelmReleaseItems(
        resourceData: TreeItemData,
        kubeconfigPath: string,
        errorHandler: ErrorHandler
    ): Promise<ClusterTreeItem[]> {
        const contextName = resourceData.context.name;
        const clusterName = resourceData.cluster?.name || contextName;
        
        // Query helm releases using helm CLI
        const result = await HelmCommands.getHelmReleases(
            kubeconfigPath,
            contextName
        );

        // Handle errors if they occurred
        if (result.error) {
            errorHandler(result.error, clusterName);
            return [];
        }

        // If no releases found, return empty array
        if (result.releases.length === 0) {
            return [];
        }

        // Create tree items for each helm release
        const releaseItems = result.releases.map(releaseInfo => {
            // Format label as namespace/release-name
            const label = `${releaseInfo.namespace}/${releaseInfo.name}`;
            
            const item = new ClusterTreeItem(
                label,
                'helm',
                vscode.TreeItemCollapsibleState.None,
                resourceData
            );

            // Set description to show chart name and version
            const chartVersion = releaseInfo.version ? 
                `${releaseInfo.chart}-${releaseInfo.version}` : 
                releaseInfo.chart;
            item.description = chartVersion;

            // Set icon based on release status
            const status = releaseInfo.status.toLowerCase();
            if (status === 'deployed') {
                item.iconPath = new vscode.ThemeIcon(
                    'check',
                    new vscode.ThemeColor('testing.iconPassed')
                );
            } else if (status === 'failed') {
                item.iconPath = new vscode.ThemeIcon(
                    'error',
                    new vscode.ThemeColor('testing.iconFailed')
                );
            } else if (status.startsWith('pending')) {
                item.iconPath = new vscode.ThemeIcon(
                    'clock',
                    new vscode.ThemeColor('editorWarning.foreground')
                );
            } else {
                // Unknown or other status
                item.iconPath = new vscode.ThemeIcon('question');
            }

            // Set tooltip with detailed information
            item.tooltip = `Release: ${releaseInfo.namespace}/${releaseInfo.name}\nChart: ${chartVersion}\nStatus: ${releaseInfo.status}`;

            // No command - clicking a helm release is a no-op at this stage (placeholder for future)
            
            return item;
        });

        return releaseItems;
    }
}

