import * as vscode from 'vscode';
import { GlobalState } from './state/GlobalState';
import { WelcomeWebview } from './webview/WelcomeWebview';
import { NamespaceWebview } from './webview/NamespaceWebview';
import { KubeconfigParser } from './kubernetes/KubeconfigParser';
import { ClusterTreeProvider } from './tree/ClusterTreeProvider';
import { ClusterTreeItem } from './tree/ClusterTreeItem';
import { Settings } from './config/Settings';
import { configureApiKeyCommand } from './commands/ConfigureApiKey';

/**
 * Global extension context accessible to all components.
 * Initialized during activation.
 */
let extensionContext: vscode.ExtensionContext | undefined;

/**
 * Array to track all disposables for proper cleanup.
 */
const disposables: vscode.Disposable[] = [];

/**
 * Global cluster tree provider instance.
 * Accessible for refreshing the tree view when cluster data changes.
 */
let clusterTreeProvider: ClusterTreeProvider | undefined;

/**
 * Status bar item showing authentication status.
 * Displays API key configuration status for AI features.
 */
let authStatusBarItem: vscode.StatusBarItem | undefined;

/**
 * Get the extension context.
 * @returns The extension context
 * @throws Error if context has not been initialized
 */
export function getExtensionContext(): vscode.ExtensionContext {
    if (!extensionContext) {
        throw new Error('Extension context has not been initialized');
    }
    return extensionContext;
}

/**
 * This method is called when the extension is activated.
 * The extension is activated when VS Code starts up (onStartupFinished).
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    try {
        console.log('Kandy extension is activating...');
        
        // Store context globally for access by other components
        extensionContext = context;
        
        // Initialize global state management
        GlobalState.initialize(context);
        
        // Parse kubeconfig to discover available clusters
        // This is non-blocking and will gracefully handle missing/invalid configs
        const kubeconfig = await KubeconfigParser.parseKubeconfig();
        console.log(`Kubeconfig parsing completed. Found ${kubeconfig.clusters.length} cluster(s).`);
        
        // Initialize and register tree view provider
        clusterTreeProvider = new ClusterTreeProvider();
        const treeViewDisposable = vscode.window.registerTreeDataProvider(
            'kandyClusterView',
            clusterTreeProvider
        );
        context.subscriptions.push(treeViewDisposable);
        disposables.push(treeViewDisposable);
        console.log('Cluster tree view registered successfully.');
        
        // Pass parsed kubeconfig to tree provider to populate clusters
        clusterTreeProvider.setKubeconfig(kubeconfig);
        
        // Register commands
        registerCommands();
        
        // Create and show status bar item for authentication status
        createAuthStatusBarItem();
        
        // Show welcome screen on first activation
        const globalState = GlobalState.getInstance();
        if (!globalState.getWelcomeScreenDismissed()) {
            WelcomeWebview.show(context);
        }
        
        console.log('Kandy extension activated successfully!');
        
        // TODO: Initialize extension components
        // - Configuration manager
        // - Kubernetes client
        // - AI integration
        // - Tree view providers
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to activate Kandy extension:', errorMessage);
        vscode.window.showErrorMessage(
            `Kandy extension failed to activate: ${errorMessage}`
        );
        throw error;
    }
}

/**
 * Create and initialize the authentication status bar item.
 * Shows current API key configuration status and provides quick access to settings.
 */
function createAuthStatusBarItem(): void {
    const context = getExtensionContext();
    const hasApiKey = Settings.hasApiKey();
    
    // Create status bar item on the right side
    authStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100 // Priority - higher values appear more to the left
    );
    
    // Set text and icon based on API key status
    if (hasApiKey) {
        authStatusBarItem.text = '$(check) Kandy: Authenticated';
        authStatusBarItem.tooltip = 'API key configured. AI-powered recommendations are available.\n\nClick to manage API key settings.';
    } else {
        authStatusBarItem.text = '$(key) Kandy: No API Key';
        authStatusBarItem.tooltip = 'No API key configured. AI features require authentication.\n\nCore cluster management works without an API key.\n\nClick to configure your API key.';
    }
    
    // Make it clickable to open settings
    authStatusBarItem.command = 'kandy.configureApiKey';
    
    // Show the status bar item
    authStatusBarItem.show();
    
    // Add to disposables for cleanup
    context.subscriptions.push(authStatusBarItem);
    disposables.push(authStatusBarItem);
}

/**
 * Register all extension commands.
 * Commands are tracked in the disposables array for proper cleanup.
 */
function registerCommands(): void {
    const context = getExtensionContext();
    
    // Register configure API key command
    const configureApiKeyCmd = vscode.commands.registerCommand(
        'kandy.configureApiKey',
        configureApiKeyCommand
    );
    context.subscriptions.push(configureApiKeyCmd);
    disposables.push(configureApiKeyCmd);
    
    // Register refresh clusters command
    const refreshClustersCommand = vscode.commands.registerCommand('kandy.refreshClusters', async () => {
        try {
            console.log('Refreshing clusters from kubeconfig...');
            
            // Show progress indicator
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Refreshing clusters...',
                    cancellable: false
                },
                async () => {
                    // Re-parse kubeconfig
                    const kubeconfig = await KubeconfigParser.parseKubeconfig();
                    console.log(`Kubeconfig refresh completed. Found ${kubeconfig.clusters.length} cluster(s).`);
                    
                    // Update tree provider with new data
                    if (clusterTreeProvider) {
                        clusterTreeProvider.setKubeconfig(kubeconfig);
                    }
                }
            );
            
            vscode.window.showInformationMessage('Clusters refreshed successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Failed to refresh clusters:', errorMessage);
            vscode.window.showErrorMessage(`Failed to refresh clusters: ${errorMessage}`);
        }
    });
    
    context.subscriptions.push(refreshClustersCommand);
    disposables.push(refreshClustersCommand);
    
    // Register open namespace command
    const openNamespaceCommand = vscode.commands.registerCommand('kandy.openNamespace', async (treeItem: ClusterTreeItem) => {
        try {
            console.log('Opening namespace webview for tree item:', treeItem.type, treeItem.label);
            
            // Validate tree item type
            if (treeItem.type !== 'namespace' && treeItem.type !== 'allNamespaces') {
                console.error('Invalid tree item type for namespace command:', treeItem.type);
                return;
            }
            
            // Extract context information from tree item
            const resourceData = treeItem.resourceData;
            if (!resourceData || !resourceData.context || !resourceData.cluster) {
                console.error('Missing resource data in tree item');
                vscode.window.showErrorMessage('Unable to open namespace: missing cluster information');
                return;
            }
            
            const clusterName = resourceData.cluster.name;
            const contextName = resourceData.context.name;
            const namespace = treeItem.type === 'allNamespaces' ? undefined : resourceData.namespace;
            
            // Show the namespace webview
            NamespaceWebview.show(context, {
                clusterName,
                contextName,
                namespace
            });
            
            console.log(`Opened namespace webview: ${namespace || 'All Namespaces'} in ${clusterName}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Failed to open namespace webview:', errorMessage);
            vscode.window.showErrorMessage(`Failed to open namespace: ${errorMessage}`);
        }
    });
    
    context.subscriptions.push(openNamespaceCommand);
    disposables.push(openNamespaceCommand);
}

/**
 * This method is called when the extension is deactivated.
 * Use this to clean up resources.
 */
export async function deactivate(): Promise<void> {
    console.log('Kandy extension is deactivating...');
    
    try {
        // Dispose of all tracked disposables
        for (const disposable of disposables) {
            try {
                disposable.dispose();
            } catch (error) {
                console.error('Error disposing resource:', error);
            }
        }
        disposables.length = 0;
        
        // Reset global state singleton
        GlobalState.reset();
        
        // Dispose tree provider and stop periodic refresh
        if (clusterTreeProvider) {
            clusterTreeProvider.dispose();
        }
        
        // Dispose status bar item
        if (authStatusBarItem) {
            authStatusBarItem.dispose();
        }
        
        // Clear tree provider reference
        clusterTreeProvider = undefined;
        
        // Clear status bar item reference
        authStatusBarItem = undefined;
        
        // Clear extension context
        extensionContext = undefined;
        
        console.log('Kandy extension deactivated successfully.');
        
        // TODO: Cleanup additional resources as they are added
        // - Close Kubernetes connections
        // - Save state
        // - Cleanup AI service connections
    } catch (error) {
        console.error('Error during deactivation:', error);
    }
}

