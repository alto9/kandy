import * as vscode from 'vscode';
import { ResourceIdentifier } from './YAMLEditorManager';
import { getClusterTreeProvider } from '../extension';
import { NamespaceWebview } from '../webview/NamespaceWebview';

/**
 * Coordinates UI refresh operations after successful YAML saves.
 * Ensures tree view and webviews stay in sync with cluster state.
 */
export class RefreshCoordinator {
    /**
     * Coordinates refresh of all UI components after a successful resource save.
     * 
     * This method performs the following operations:
     * 1. Refreshes the cluster tree view
     * 2. Refreshes any open namespace webviews
     * 3. Shows a success notification to the user
     * 
     * All refresh operations are wrapped in error handling to ensure that
     * failures don't prevent the save operation from completing successfully.
     * 
     * @param resource - The resource that was successfully saved
     */
    public async coordinateRefresh(resource: ResourceIdentifier): Promise<void> {
        try {
            console.log(`Starting refresh coordination for ${resource.kind}/${resource.name}`);
            
            // Step 1: Refresh the tree view
            await this.refreshTreeView(resource);
            
            // Step 2: Refresh any open namespace webviews
            await this.refreshNamespaceWebviews(resource);
            
            // Step 3: Show success notification with resource details
            this.showSuccessNotification(resource);
            
            console.log(`Refresh coordination completed for ${resource.kind}/${resource.name}`);
            
        } catch (error) {
            // Log error but don't throw - refresh failures shouldn't block save completion
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Refresh coordination failed for ${resource.kind}/${resource.name}: ${errorMessage}`);
            
            // Optionally show a warning (but don't block the save success notification)
            // User already knows save succeeded, this is just about UI refresh
            console.warn('UI refresh failed, but save operation completed successfully');
        }
    }
    
    /**
     * Refreshes the cluster tree view to reflect the updated resource.
     * 
     * @param resource - The resource that was updated
     */
    private async refreshTreeView(resource: ResourceIdentifier): Promise<void> {
        try {
            console.log(`Refreshing tree view for ${resource.kind}/${resource.name}`);
            
            // Get the tree provider and trigger a refresh
            const treeProvider = getClusterTreeProvider();
            treeProvider.refresh();
            
            console.log('Tree view refresh triggered successfully');
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Failed to refresh tree view: ${errorMessage}`);
            throw error; // Re-throw to be caught by coordinateRefresh
        }
    }
    
    /**
     * Refreshes any open namespace webviews that are displaying resources
     * from the affected namespace.
     * 
     * @param resource - The resource that was updated
     */
    private async refreshNamespaceWebviews(resource: ResourceIdentifier): Promise<void> {
        try {
            console.log(`Refreshing namespace webviews for ${resource.namespace || 'cluster-scoped'}`);
            
            // Send refresh message to all relevant webviews
            await NamespaceWebview.sendResourceUpdated(resource.namespace);
            
            console.log('Namespace webviews refresh messages sent');
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Failed to refresh namespace webviews: ${errorMessage}`);
            throw error; // Re-throw to be caught by coordinateRefresh
        }
    }
    
    /**
     * Shows a success notification to the user indicating that the resource
     * was saved successfully.
     * 
     * @param resource - The resource that was saved
     */
    private showSuccessNotification(resource: ResourceIdentifier): void {
        const resourceDescription = resource.namespace 
            ? `${resource.kind} '${resource.name}' in namespace '${resource.namespace}'`
            : `${resource.kind} '${resource.name}'`;
            
        vscode.window.showInformationMessage(
            `${resourceDescription} updated successfully`
        );
    }
}

