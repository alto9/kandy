import * as vscode from 'vscode';
import { ClusterTreeItem, ClusterStatus } from './ClusterTreeItem';
import { TreeItemType } from './TreeItemTypes';
import { TreeItemFactory } from './TreeItemFactory';
import { ParsedKubeconfig } from '../kubernetes/KubeconfigParser';
import { ClusterConnectivity } from '../kubernetes/ClusterConnectivity';
import { Settings } from '../config/Settings';
import { KubectlErrorType } from '../kubernetes/KubectlError';
import { NodesCategory } from './categories/NodesCategory';
import { NamespacesCategory } from './categories/NamespacesCategory';
import { WorkloadsCategory } from './categories/WorkloadsCategory';
import { DeploymentsSubcategory } from './categories/workloads/DeploymentsSubcategory';
import { StatefulSetsSubcategory } from './categories/workloads/StatefulSetsSubcategory';
import { DaemonSetsSubcategory } from './categories/workloads/DaemonSetsSubcategory';
import { CronJobsSubcategory } from './categories/workloads/CronJobsSubcategory';
import { StorageCategory } from './categories/StorageCategory';
import { PersistentVolumesSubcategory } from './categories/storage/PersistentVolumesSubcategory';
import { PersistentVolumeClaimsSubcategory } from './categories/storage/PersistentVolumeClaimsSubcategory';
import { StorageClassesSubcategory } from './categories/storage/StorageClassesSubcategory';
import { ConfigurationCategory } from './categories/ConfigurationCategory';
import { ConfigMapsSubcategory } from './categories/configuration/ConfigMapsSubcategory';
import { SecretsSubcategory } from './categories/configuration/SecretsSubcategory';
import { HelmCategory } from './categories/HelmCategory';

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
     * Cache of cluster connectivity status to persist between tree refreshes.
     * Maps context name to its last known connectivity status.
     */
    private clusterStatusCache: Map<string, ClusterStatus> = new Map();

    /**
     * Timer for periodic connectivity checks.
     * Checks cluster connectivity every 60 seconds automatically.
     */
    private refreshInterval: NodeJS.Timeout | undefined;

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

        // If element is a cluster, return the 7 categories
        if (element.type === 'cluster' && element.resourceData) {
            return this.getCategories(element);
        }

        // If element is a category, return its children (placeholder for now)
        if (this.isCategoryType(element.type)) {
            return this.getCategoryChildren(element);
        }

        // If element has children, return them
        if (element.children) {
            return element.children;
        }

        // No children for this element
        return [];
    }

    /**
     * Get the 7 resource categories for a cluster.
     * Returns categories in the exact order: Nodes, Namespaces, Workloads, Storage, Helm, Configuration, Custom Resources.
     * 
     * @param clusterElement The cluster tree item to get categories for
     * @returns Array of category tree items
     */
    private getCategories(clusterElement: ClusterTreeItem): ClusterTreeItem[] {
        if (!clusterElement.resourceData) {
            return [];
        }

        return [
            TreeItemFactory.createNodesCategory(clusterElement.resourceData),
            TreeItemFactory.createNamespacesCategory(clusterElement.resourceData),
            TreeItemFactory.createWorkloadsCategory(clusterElement.resourceData),
            TreeItemFactory.createStorageCategory(clusterElement.resourceData),
            TreeItemFactory.createHelmCategory(clusterElement.resourceData),
            TreeItemFactory.createConfigurationCategory(clusterElement.resourceData),
            TreeItemFactory.createCustomResourcesCategory(clusterElement.resourceData)
        ];
    }

    /**
     * Check if a tree item type is a category type.
     * 
     * @param type The tree item type to check
     * @returns True if the type is a category type
     */
    private isCategoryType(type: TreeItemType): boolean {
        return type === 'nodes' || 
               type === 'namespaces' || 
               type === 'workloads' || 
               type === 'deployments' ||
               type === 'statefulsets' ||
               type === 'daemonsets' ||
               type === 'cronjobs' ||
               type === 'deployment' ||
               type === 'statefulset' ||
               type === 'daemonset' ||
               type === 'cronjob' ||
               type === 'pod' ||
               type === 'storage' ||
               type === 'persistentVolumes' ||
               type === 'persistentVolumeClaims' ||
               type === 'storageClasses' ||
               type === 'persistentVolume' ||
               type === 'persistentVolumeClaim' ||
               type === 'helm' || 
               type === 'configuration' || 
               type === 'configmaps' ||
               type === 'secrets' ||
               type === 'configmap' ||
               type === 'customResources';
    }

    /**
     * Get children for a category tree item.
     * Delegates to category-specific handlers for fetching and displaying resources.
     * 
     * @param categoryElement The category tree item to get children for
     * @returns Array of child tree items for the category
     */
    private async getCategoryChildren(categoryElement: ClusterTreeItem): Promise<ClusterTreeItem[]> {
        if (!this.kubeconfig || !categoryElement.resourceData) {
            return [];
        }

        // Delegate to category-specific handlers
        switch (categoryElement.type) {
            case 'nodes':
                return NodesCategory.getNodeItems(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            case 'namespaces':
                return NamespacesCategory.getNamespaceItems(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            case 'workloads':
                return WorkloadsCategory.getWorkloadSubcategories(
                    categoryElement.resourceData
                );
            
            case 'deployments':
                return DeploymentsSubcategory.getDeploymentItems(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            case 'deployment': {
                // Get label selector from the tree item (stored during deployment creation)
                const labelSelector = (categoryElement as ClusterTreeItem & { labelSelector?: string }).labelSelector || '';
                return DeploymentsSubcategory.getPodsForDeployment(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    labelSelector,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            }
            
            case 'statefulsets':
                return StatefulSetsSubcategory.getStatefulSetItems(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            case 'statefulset': {
                // Get label selector from the tree item (stored during statefulset creation)
                const statefulSetLabelSelector = (categoryElement as ClusterTreeItem & { labelSelector?: string }).labelSelector || '';
                return StatefulSetsSubcategory.getPodsForStatefulSet(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    statefulSetLabelSelector,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            }
            
            case 'daemonsets':
                return DaemonSetsSubcategory.getDaemonSetItems(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            case 'daemonset': {
                // Get label selector from the tree item (stored during daemonset creation)
                const daemonSetLabelSelector = (categoryElement as ClusterTreeItem & { labelSelector?: string }).labelSelector || '';
                return DaemonSetsSubcategory.getPodsForDaemonSet(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    daemonSetLabelSelector,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            }
            
            case 'cronjobs':
                return CronJobsSubcategory.getCronJobItems(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            case 'cronjob':
                return CronJobsSubcategory.getPodsForCronJob(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            case 'storage':
                return StorageCategory.getStorageSubcategories(
                    categoryElement.resourceData
                );
            
            case 'persistentVolumes':
                return PersistentVolumesSubcategory.getPersistentVolumeItems(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            case 'persistentVolumeClaims':
                return PersistentVolumeClaimsSubcategory.getPersistentVolumeClaimItems(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            case 'storageClasses':
                return StorageClassesSubcategory.getStorageClassItems(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            case 'configuration':
                return ConfigurationCategory.getConfigurationSubcategories(
                    categoryElement.resourceData
                );
            
            case 'configmaps':
                return ConfigMapsSubcategory.getConfigMapItems(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            case 'secrets':
                return SecretsSubcategory.getSecretItems(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            case 'helm':
                return HelmCategory.getHelmReleaseItems(
                    categoryElement.resourceData,
                    this.kubeconfig.filePath,
                    (error, clusterName) => this.handleKubectlError(error, clusterName)
                );
            
            // Future categories and subcategories will be added here:
            // - customResources: kubectl get crds
            
            default:
                return [];
        }
    }

    /**
     * Get namespace tree items for a cluster.
     * Queries the cluster using kubectl to retrieve the list of namespaces.
     * 
     * NOTE: This method is preserved for future use when the Namespaces category is implemented.
     * It will be called from getCategoryChildren() when category type is 'namespaces'.
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
            arguments: [
                contextName,
                clusterName,
                undefined // undefined indicates "All Namespaces"
            ]
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
                arguments: [
                    clusterElement.resourceData!.context.name,
                    clusterElement.resourceData!.cluster.name,
                    namespaceName
                ]
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

        // Update cluster items with cached status
        clusterItems.forEach(item => {
            if (item.type === 'cluster' && item.resourceData?.context?.name) {
                const contextName = item.resourceData.context.name;
                const cachedStatus = this.clusterStatusCache.get(contextName);
                
                if (cachedStatus !== undefined) {
                    // Use cached status if available
                    item.status = cachedStatus;
                    const isCurrentContext = contextName === this.kubeconfig!.currentContext;
                    this.updateTreeItemAppearance(item, isCurrentContext, cachedStatus);
                }
            }
        });

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
        
        // Start periodic connectivity checks
        this.startPeriodicRefresh();
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
     * Start periodic connectivity checks for all clusters.
     * Checks cluster connectivity every 60 seconds automatically.
     * Clears any existing interval before starting a new one.
     */
    private startPeriodicRefresh(): void {
        // Clear existing interval if any
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Set up new interval for 60-second periodic checks
        this.refreshInterval = setInterval(() => {
            console.log('Running periodic cluster connectivity check...');
            
            // Get current cluster items
            if (this.kubeconfig && this.kubeconfig.contexts.length > 0) {
                const clusterItems = this.kubeconfig.contexts
                    .map(context => {
                        const cluster = this.kubeconfig!.clusters.find(c => c.name === context.cluster);
                        if (!cluster) {
                            return null;
                        }
                        
                        const item = new ClusterTreeItem(
                            context.name,
                            'cluster',
                            vscode.TreeItemCollapsibleState.Collapsed,
                            { context, cluster }
                        );
                        return item;
                    })
                    .filter((item): item is ClusterTreeItem => item !== null);
                
                // Run connectivity check (this will update cache and refresh tree)
                this.checkAllClustersConnectivity(clusterItems);
            }
        }, 60000); // 60 seconds = 60000 milliseconds
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

            // Track if any status changed to determine if refresh is needed
            let statusChanged = false;

            // Update each cluster item with its connectivity status
            validClusters.forEach((item, index) => {
                const result = results[index];
                const contextName = item.resourceData!.context.name;
                
                // Check if status actually changed
                const previousStatus = this.clusterStatusCache.get(contextName);
                if (previousStatus !== result.status) {
                    statusChanged = true;
                }
                
                // Update item status
                item.status = result.status;
                
                // Cache the status for future tree refreshes
                this.clusterStatusCache.set(contextName, result.status);

                // Handle any errors that occurred during connectivity check
                if (result.error) {
                    const clusterName = item.resourceData!.cluster?.name || contextName;
                    this.handleKubectlError(result.error, clusterName);
                }

                // Determine if this is the current context
                const isCurrentContext = contextName === this.kubeconfig?.currentContext;

                // Update the item's appearance based on its status
                this.updateTreeItemAppearance(item, isCurrentContext, result.status);
            });

            // Only refresh the tree view if status actually changed
            // This prevents unnecessary tree rebuilds during periodic checks
            if (statusChanged) {
                console.log('Cluster status changed, refreshing tree view...');
                this.refresh();
            }
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
                iconId = 'warning'; // Warning icon for current + disconnected
                statusText = 'Current context (disconnected)';
            } else {
                iconId = 'warning'; // Warning icon for disconnected clusters
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
        // Stop periodic connectivity checks
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = undefined;
        }
        
        // Clean up error tracking
        this.shownErrorTypes.clear();
        
        // Clear status cache
        this.clusterStatusCache.clear();
    }
}

