import * as vscode from 'vscode';
import { ClusterTreeItem } from '../tree/ClusterTreeItem';
import { setNamespace, clearNamespace } from '../utils/kubectlContext';

/**
 * Command handler to set a namespace as the active namespace in kubectl context.
 * This is triggered from the tree view context menu.
 * 
 * @param item The namespace tree item that was right-clicked
 */
export async function setActiveNamespaceCommand(item: ClusterTreeItem): Promise<void> {
    try {
        // Validate that we have a namespace tree item
        if (!item || item.type !== 'namespace') {
            console.error('setActiveNamespaceCommand called with invalid item type');
            vscode.window.showErrorMessage('Failed to set active namespace: Invalid item type');
            return;
        }

        // Get the namespace name from the tree item label
        const namespaceName = typeof item.label === 'string' ? item.label : item.label?.toString();
        
        if (!namespaceName) {
            console.error('setActiveNamespaceCommand called with item missing label');
            vscode.window.showErrorMessage('Failed to set active namespace: Namespace name not found');
            return;
        }

        // Show progress indicator while updating context
        const success = await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Setting active namespace to '${namespaceName}'...`,
                cancellable: false
            },
            async () => {
                // Call the kubectl utility to set the namespace
                return await setNamespace(namespaceName);
            }
        );

        if (success) {
            // Show success notification
            vscode.window.showInformationMessage(
                `Active namespace set to '${namespaceName}'`
            );
            
            // Refresh the tree view to update the active namespace indicator
            // The tree provider is listening to namespace watcher events and will refresh automatically
        } else {
            // Show error notification
            vscode.window.showErrorMessage(
                `Failed to set active namespace to '${namespaceName}'. Check that kubectl is configured correctly.`
            );
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error in setActiveNamespaceCommand:', errorMessage);
        vscode.window.showErrorMessage(
            `Failed to set active namespace: ${errorMessage}`
        );
    }
}

/**
 * Command handler to clear the active namespace from kubectl context.
 * This returns to a cluster-wide view with no namespace filtering.
 * This is triggered from the tree view context menu.
 */
export async function clearActiveNamespaceCommand(): Promise<void> {
    try {
        // Show progress indicator while updating context
        const success = await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Clearing active namespace...',
                cancellable: false
            },
            async () => {
                // Call the kubectl utility to clear the namespace
                return await clearNamespace();
            }
        );

        if (success) {
            // Show success notification
            vscode.window.showInformationMessage(
                'Active namespace cleared. Now viewing cluster-wide resources.'
            );
            
            // Refresh the tree view to update the active namespace indicator
            // The tree provider is listening to namespace watcher events and will refresh automatically
        } else {
            // Show error notification
            vscode.window.showErrorMessage(
                'Failed to clear active namespace. Check that kubectl is configured correctly.'
            );
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error in clearActiveNamespaceCommand:', errorMessage);
        vscode.window.showErrorMessage(
            `Failed to clear active namespace: ${errorMessage}`
        );
    }
}

