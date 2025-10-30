import * as vscode from 'vscode';
import { ClusterTreeItem, ClusterStatus } from './ClusterTreeItem';
import { ParsedKubeconfig } from '../kubernetes/KubeconfigParser';
import { ClusterConnectivity } from '../kubernetes/ClusterConnectivity';
import { Settings } from '../config/Settings';
import { KubectlErrorType } from '../kubernetes/KubectlError';

/**
 * Tree data provider for displaying Kubernetes clusters in the VS Code sidebar.
 * Implements the TreeDataProvider interface to supply data to the tree view.
 * 
 * This provider manages the hierarchical display of:
 * - Clusters (top-level)
 * - Namespaces (under clusters)
 */
export class ClusterTreeProvider implements vscode.TreeDataProvider<ClusterTreeItem> {
    /**
     * Event emitter for tree data changes.
     * Fire this event to trigger a refresh of the tree view.
     */
    private _onDidChangeTreeData: vscode.EventEmitter<ClusterTreeItem | undefined | null | void> = 
        new vscode.EventEmitter<ClusterTreeItem | undefined | null | void>();

    /**
     * Event that VS Code listens to for tree data changes.
     * When this event fires, VS Code will call getChildren() to refresh the tree.
     */
    readonly onDidChangeTreeData: vscode.Event<ClusterTreeItem | undefined | null | void> = 
        this._onDidChangeTreeData.event;

    /**
     * Stores the parsed kubeconfig data.
     * Updated when kubeconfig is parsed or refreshed.
     */
    private kubeconfig: ParsedKubeconfig | undefined;

    /**
     * Tracks which error types have been shown to the user during this session.
     * Used to prevent repeatedly showing the same error (e.g., kubectl not found).
     */
    private shownErrorTypes: Set<KubectlErrorType> = new Set();

    /**
     * Get the UI representation of a tree element.
     * This method is called by VS Code to render each tree item.
     * 
     * @param element The tree item to get the UI representation for
     * @returns The tree item (already a TreeItem, so we return as-is)
     */
    getTreeItem(element: ClusterTreeItem): vscode.TreeItem {
        return element;
    }

    /**
     * Get the children of a tree element.
     * This method is called by VS Code to populate the tree view.
     * 
     * @param element The parent element to get children for. If undefined, get root elements.
     * @returns A promise resolving to an array of child tree items
     */
    async getChildren(element?: ClusterTreeItem): Promise<ClusterTreeItem[]> {
        // If no element is provided, we're getting the root level items (clusters)
        if (!element) {
            return this.getClusters();
        }

        // If element is a cluster, query its namespaces
        if (element.type === 'cluster' && element.resourceData?.context?.name) {
            return this.getNamespaces(element);
        }

        // If element has children, return them
        if (element.children) {
            return element.children;
        }

        // No children for this element
        return [];
    }

    /**
     * Get namespace tree items for a cluster.
     * Queries the cluster using kubectl to retrieve the list of namespaces.
     * 
     * @param clusterElement The cluster tree item to get namespaces for
     * @returns Array of namespace tree items, or empty array on error
     */
    private async getNamespaces(clusterElement: ClusterTreeItem): Promise<ClusterTreeItem[]> {
        // Ensure we have the required kubeconfig data
        if (!this.kubeconfig || !clusterElement.resourceData) {
            console.error('Cannot query namespaces: kubeconfig not loaded or missing resource data');
            return [];
        }

        const contextName = clusterElement.resourceData.context.name;
        const clusterName = clusterElement.resourceData.cluster?.name || contextName;
        
        // Query namespaces using kubectl
        const result = await ClusterConnectivity.getNamespaces(
            this.kubeconfig.filePath,
            contextName
        );

        // Handle errors if they occurred
        if (result.error) {
            this.handleKubectlError(result.error, clusterName);
            return [];
        }

        // If no namespaces found (empty cluster), return empty array
        if (result.namespaces.length === 0) {
            return [];
        }

        // Create "All Namespaces" special item
        const allNamespacesItem = new ClusterTreeItem(
            'All Namespaces',
            'allNamespaces',
            vscode.TreeItemCollapsibleState.None,
            {
                context: clusterElement.resourceData!.context,
                cluster: clusterElement.resourceData!.cluster
            }
        );
        allNamespacesItem.iconPath = new vscode.ThemeIcon('globe');
        allNamespacesItem.tooltip = `View all namespaces in ${clusterName}`;
        
        // Make "All Namespaces" clickable to open webview
        allNamespacesItem.command = {
            command: 'kandy.openNamespace',
            title: 'Open All Namespaces',
            arguments: [allNamespacesItem]
        };

        // Sort namespaces alphabetically
        const sortedNamespaces = result.namespaces.sort((a, b) => a.localeCompare(b));

        // Create tree items for each namespace
        const namespaceItems = sortedNamespaces.map(namespaceName => {
            const item = new ClusterTreeItem(
                namespaceName,
                'namespace',
                vscode.TreeItemCollapsibleState.None,
                {
                    context: clusterElement.resourceData!.context,
                    cluster: clusterElement.resourceData!.cluster
                }
            );

            // Set icon for namespace
            item.iconPath = new vscode.ThemeIcon('symbol-namespace');
            item.tooltip = `Namespace: ${namespaceName}`;
            
            // Make namespace clickable to open webview
            item.command = {
                command: 'kandy.openNamespace',
                title: 'Open Namespace',
                arguments: [item]
            };
            
            return item;
        });

        // Return "All Namespaces" first, followed by individual namespaces
        return [allNamespacesItem, ...namespaceItems];
    }

    /**
     * Get cluster tree items from the parsed kubeconfig.
     * Creates a tree item for each context, showing the cluster name and context information.
     * Also checks connectivity status for each cluster asynchronously.
     * 
     * @returns Array of cluster tree items, or a message item if no clusters are available
     */
    private getClusters(): ClusterTreeItem[] {
        // If no kubeconfig data is available, show a message
        if (!this.kubeconfig) {
            const messageItem = new ClusterTreeItem(
                'No clusters detected',
                'cluster',
                vscode.TreeItemCollapsibleState.None
            );
            messageItem.iconPath = new vscode.ThemeIcon('info');
            messageItem.tooltip = 'No kubeconfig file found or it contains no clusters';
            return [messageItem];
        }

        // If kubeconfig has no contexts, show a helpful message
        if (!this.kubeconfig.contexts || this.kubeconfig.contexts.length === 0) {
            const messageItem = new ClusterTreeItem(
                'No clusters configured',
                'cluster',
                vscode.TreeItemCollapsibleState.None
            );
            messageItem.iconPath = new vscode.ThemeIcon('info');
            messageItem.tooltip = 'Add clusters to your kubeconfig file to see them here';
            return [messageItem];
        }

        // Create tree items for each context
        const clusterItems: ClusterTreeItem[] = this.kubeconfig.contexts.map(context => {
            // Find the corresponding cluster data
            const cluster = this.kubeconfig!.clusters.find(c => c.name === context.cluster);
            
            // Skip if cluster data is missing (invalid kubeconfig)
            if (!cluster) {
                console.warn(`Context ${context.name} references non-existent cluster ${context.cluster}`);
                return null;
            }
            
            // Create the tree item with context name as the label
            const item = new ClusterTreeItem(
                context.name,
                'cluster',
                vscode.TreeItemCollapsibleState.Collapsed,
                {
                    context: context,
                    cluster: cluster
                }
            );

            // Set description to show the cluster name if different from context name
            if (cluster && cluster.name !== context.name) {
                item.description = cluster.name;
            }

            // Initialize with unknown status
            item.status = ClusterStatus.Unknown;
            
            // Set initial icon and tooltip (will be updated after connectivity check)
            const isCurrentContext = context.name === this.kubeconfig!.currentContext;
            this.updateTreeItemAppearance(item, isCurrentContext, ClusterStatus.Unknown);

            // Add server URL to tooltip if available
            if (cluster) {
                item.tooltip += `\nServer: ${cluster.server}`;
                if (context.namespace) {
                    item.tooltip += `\nNamespace: ${context.namespace}`;
                }
            }

            return item;
        }).filter((item): item is ClusterTreeItem => item !== null);

        // Check connectivity for all clusters asynchronously
        this.checkAllClustersConnectivity(clusterItems);

        // Add authentication status message at the bottom of the cluster list
        const authStatusItem = this.createAuthStatusItem();
        clusterItems.push(authStatusItem);

        return clusterItems;
    }

    /**
     * Create an informational tree item showing authentication status.
     * Provides users with context about API key requirements and easy access to configuration.
     * 
     * @returns A tree item with authentication status message and configuration link
     */
    private createAuthStatusItem(): ClusterTreeItem {
        const hasApiKey = Settings.hasApiKey();
        
        if (hasApiKey) {
            // Show authenticated status
            const item = new ClusterTreeItem(
                'AI features enabled',
                'info',
                vscode.TreeItemCollapsibleState.None
            );
            item.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
            item.tooltip = 'API key configured. AI-powered recommendations are available.';
            item.contextValue = 'authStatus';
            return item;
        } else {
            // Show message prompting API key configuration
            const item = new ClusterTreeItem(
                'Configure API key to enable AI recommendations',
                'info',
                vscode.TreeItemCollapsibleState.None
            );
            item.iconPath = new vscode.ThemeIcon('key');
            item.tooltip = 'API key required for AI features only. Core cluster management works without authentication.\n\nClick to configure your API key.';
            item.contextValue = 'authStatus';
            
            // Make the item clickable to open settings
            item.command = {
                command: 'kandy.configureApiKey',
                title: 'Configure API Key',
                arguments: []
            };
            
            return item;
        }
    }

    /**
     * Update the kubeconfig data and refresh the tree view.
     * This method should be called whenever the kubeconfig is parsed or refreshed.
     * 
     * @param kubeconfig The parsed kubeconfig data
     */
    setKubeconfig(kubeconfig: ParsedKubeconfig): void {
        this.kubeconfig = kubeconfig;
        this.refresh();
    }

    /**
     * Refresh the tree view.
     * Call this method to trigger a complete refresh of the tree view.
     * VS Code will call getChildren() again to rebuild the tree.
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Refresh a specific tree item.
     * Call this method to refresh only a specific node and its children.
     * 
     * @param element The tree item to refresh, or undefined to refresh the entire tree
     */
    refreshItem(element?: ClusterTreeItem): void {
        this._onDidChangeTreeData.fire(element);
    }

    /**
     * Check connectivity for all clusters asynchronously and update their status.
     * This method runs in the background and updates the tree when complete.
     * 
     * @param clusterItems Array of cluster tree items to check
     */
    private async checkAllClustersConnectivity(clusterItems: ClusterTreeItem[]): Promise<void> {
        // Filter out non-cluster items (like message items)
        const validClusters = clusterItems.filter(item => 
            item.type === 'cluster' && 
            item.resourceData?.context?.name
        );

        if (validClusters.length === 0 || !this.kubeconfig) {
            return;
        }

        // Extract context names
        const contextNames = validClusters.map(item => item.resourceData!.context.name);

        try {
            // Check all clusters in parallel for better performance
            const results = await ClusterConnectivity.checkMultipleConnectivity(
                this.kubeconfig.filePath,
                contextNames
            );

            // Update each cluster item with its connectivity status
            validClusters.forEach((item, index) => {
                const result = results[index];
                item.status = result.status;

                // Handle any errors that occurred during connectivity check
                if (result.error) {
                    const clusterName = item.resourceData!.cluster?.name || item.resourceData!.context.name;
                    this.handleKubectlError(result.error, clusterName);
                }

                // Determine if this is the current context
                const isCurrentContext = item.resourceData!.context.name === this.kubeconfig?.currentContext;

                // Update the item's appearance based on its status
                this.updateTreeItemAppearance(item, isCurrentContext, result.status);
            });

            // Refresh the tree view to show updated icons and tooltips
            this.refresh();
        } catch (error) {
            console.error('Error checking cluster connectivity:', error);
        }
    }

    /**
     * Updates a tree item's icon and tooltip based on its status.
     * 
     * @param item The tree item to update
     * @param isCurrentContext Whether this cluster is the current context
     * @param status The connection status of the cluster
     */
    private updateTreeItemAppearance(
        item: ClusterTreeItem, 
        isCurrentContext: boolean, 
        status: ClusterStatus
    ): void {
        // Determine the appropriate icon based on status and current context
        let iconId: string;
        let statusText: string;

        if (status === ClusterStatus.Unknown) {
            iconId = 'loading~spin';
            statusText = 'Checking connection...';
        } else if (status === ClusterStatus.Connected) {
            if (isCurrentContext) {
                iconId = 'vm-active'; // Active VM icon for current + connected
                statusText = 'Current context (connected)';
            } else {
                iconId = 'vm-connect'; // Connected VM icon
                statusText = 'Connected';
            }
        } else { // Disconnected
            if (isCurrentContext) {
                iconId = 'vm-outline'; // Outlined VM for current + disconnected
                statusText = 'Current context (disconnected)';
            } else {
                iconId = 'debug-disconnect'; // Disconnect icon
                statusText = 'Disconnected';
            }
        }

        item.iconPath = new vscode.ThemeIcon(iconId);
        
        // Update tooltip with status information
        const contextName = item.resourceData?.context?.name || item.label;
        item.tooltip = `${contextName}\nStatus: ${statusText}`;
    }

    /**
     * Handle kubectl errors by displaying appropriate user-facing messages.
     * Implements smart error tracking to avoid spamming users with repeated messages.
     * 
     * @param error The kubectl error to handle
     * @param clusterName Name of the cluster where the error occurred
     */
    private handleKubectlError(error: import('../kubernetes/KubectlError').KubectlError, clusterName: string): void {
        // Determine whether to show a user-facing message based on error type
        switch (error.type) {
            case KubectlErrorType.BinaryNotFound:
                // Only show this error once per session to avoid spam
                if (!this.shownErrorTypes.has(KubectlErrorType.BinaryNotFound)) {
                    vscode.window.showErrorMessage(error.getUserMessage());
                    this.shownErrorTypes.add(KubectlErrorType.BinaryNotFound);
                }
                break;
            
            case KubectlErrorType.PermissionDenied:
                // Show warning for permission errors (these are actionable by the user)
                vscode.window.showWarningMessage(error.getUserMessage());
                break;
            
            case KubectlErrorType.ConnectionFailed:
                // Log but don't show notification - connection failures are expected
                // for unreachable clusters and would be too noisy
                console.log(`Connection failed to cluster ${clusterName}: ${error.getDetails()}`);
                break;
            
            case KubectlErrorType.Timeout:
                // Log but don't show notification - timeouts can be expected
                // for slow or overloaded clusters
                console.log(`Timeout connecting to cluster ${clusterName}: ${error.getDetails()}`);
                break;
            
            case KubectlErrorType.Unknown:
                // Log unknown errors but don't show notifications
                // to avoid confusing users with unclear error messages
                console.error(`Unknown error for cluster ${clusterName}: ${error.getDetails()}`);
                break;
        }
    }

    /**
     * Dispose of the tree provider and clean up resources.
     */
    dispose(): void {
        // Clean up error tracking
        this.shownErrorTypes.clear();
    }
}

