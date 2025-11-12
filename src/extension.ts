import * as vscode from 'vscode';
import { GlobalState } from './state/GlobalState';
import { WelcomeWebview } from './webview/WelcomeWebview';
import { NamespaceWebview } from './webview/NamespaceWebview';
import { KubeconfigParser } from './kubernetes/KubeconfigParser';
import { ClusterTreeProvider } from './tree/ClusterTreeProvider';
import { Settings } from './config/Settings';
import { configureApiKeyCommand } from './commands/ConfigureApiKey';
import { setActiveNamespaceCommand } from './commands/namespaceCommands';
import { namespaceWatcher } from './services/namespaceCache';
import { NamespaceStatusBar } from './ui/statusBar';

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
 * Status bar item showing current kubectl namespace.
 * Displays the active namespace or "All" if no namespace is set.
 */
let namespaceStatusBar: NamespaceStatusBar | undefined;

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
 * Get the cluster tree provider instance.
 * @returns The cluster tree provider
 * @throws Error if tree provider has not been initialized
 */
export function getClusterTreeProvider(): ClusterTreeProvider {
    if (!clusterTreeProvider) {
        throw new Error('Cluster tree provider has not been initialized');
    }
    return clusterTreeProvider;
}

/**
 * This method is called when the extension is activated.
 * The extension is activated when VS Code starts up (onStartupFinished).
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    try {
        console.log('kube9 extension is activating...');
        
        // Store context globally for access by other components
        extensionContext = context;
        
        // Initialize global state management
        GlobalState.initialize(context);
        
        // Parse kubeconfig to discover available clusters
        // This is non-blocking and will gracefully handle missing/invalid configs
        const kubeconfig = await KubeconfigParser.parseKubeconfig();
        console.log(`Kubeconfig parsing completed. Found ${kubeconfig.clusters.length} cluster(s).`);
        
        // Register commands first before populating the tree
        // This ensures commands are available when tree items are clicked
        registerCommands();
        
        // Initialize and register tree view provider
        clusterTreeProvider = new ClusterTreeProvider();
        const treeViewDisposable = vscode.window.registerTreeDataProvider(
            'kube9ClusterView',
            clusterTreeProvider
        );
        context.subscriptions.push(treeViewDisposable);
        disposables.push(treeViewDisposable);
        console.log('Cluster tree view registered successfully.');
        
        // Pass parsed kubeconfig to tree provider to populate clusters
        clusterTreeProvider.setKubeconfig(kubeconfig);
        
        // Create and show status bar item for authentication status
        createAuthStatusBarItem();
        
        // Create and show status bar item for namespace context
        await createNamespaceStatusBarItem();
        
        // Show welcome screen on first activation
        const globalState = GlobalState.getInstance();
        if (!globalState.getWelcomeScreenDismissed()) {
            WelcomeWebview.show(context);
        }
        
        // Start watching for external namespace context changes
        namespaceWatcher.startWatching();
        console.log('Namespace context watcher started.');
        
        // Subscribe to external context changes to notify webviews
        const contextChangeSubscription = namespaceWatcher.onDidChangeContext(async (state) => {
            console.log('External context change detected, notifying webviews...', state);
            // Notify all open webview panels of the external change
            await NamespaceWebview.notifyAllPanelsOfContextChange(
                state.currentNamespace || null,
                'external'
            );
        });
        context.subscriptions.push(contextChangeSubscription);
        
        console.log('kube9 extension activated successfully!');
        
        // TODO: Initialize extension components
        // - Configuration manager
        // - Kubernetes client
        // - AI integration
        // - Tree view providers
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to activate kube9 extension:', errorMessage);
        vscode.window.showErrorMessage(
            `kube9 extension failed to activate: ${errorMessage}`
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
        authStatusBarItem.text = '$(check) kube9: Authenticated';
        authStatusBarItem.tooltip = 'API key configured. AI-powered recommendations are available.\n\nClick to manage API key settings.';
    } else {
        authStatusBarItem.text = '$(key) kube9: No API Key';
        authStatusBarItem.tooltip = 'No API key configured. AI features require authentication.\n\nCore cluster management works without an API key.\n\nClick to configure your API key.';
    }
    
    // Make it clickable to open settings
    authStatusBarItem.command = 'kube9.configureApiKey';
    
    // Show the status bar item
    authStatusBarItem.show();
    
    // Add to disposables for cleanup
    context.subscriptions.push(authStatusBarItem);
    disposables.push(authStatusBarItem);
}

/**
 * Create and initialize the namespace status bar item.
 * Shows current kubectl namespace context with automatic updates on context changes.
 */
async function createNamespaceStatusBarItem(): Promise<void> {
    try {
        const context = getExtensionContext();
        
        // Create and initialize the namespace status bar
        namespaceStatusBar = new NamespaceStatusBar(context);
        await namespaceStatusBar.initialize();
        
        console.log('Namespace status bar created successfully.');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to create namespace status bar:', errorMessage);
        // Don't throw - status bar is a non-critical feature
    }
}

/**
 * Register all extension commands.
 * Commands are tracked in the disposables array for proper cleanup.
 */
function registerCommands(): void {
    const context = getExtensionContext();
    
    // Register configure API key command
    const configureApiKeyCmd = vscode.commands.registerCommand(
        'kube9.configureApiKey',
        configureApiKeyCommand
    );
    context.subscriptions.push(configureApiKeyCmd);
    disposables.push(configureApiKeyCmd);
    
    // Register refresh clusters command
    const refreshClustersCommand = vscode.commands.registerCommand('kube9.refreshClusters', async () => {
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
                        // Force refresh operator status on manual refresh
                        clusterTreeProvider.refresh(true);
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
    // Args: contextName, clusterName, namespace (undefined for "All Namespaces")
    const openNamespaceCommand = vscode.commands.registerCommand(
        'kube9.openNamespace', 
        async (contextName: string, clusterName: string, namespace?: string) => {
            try {
                console.log('Opening namespace webview:', {
                    contextName,
                    clusterName,
                    namespace: namespace || 'All Namespaces'
                });
                
                // Validate required parameters
                if (!contextName || !clusterName) {
                    console.error('Missing required parameters for openNamespace command');
                    vscode.window.showErrorMessage('Unable to open namespace: missing cluster information');
                    return;
                }
                
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
        }
    );
    
    context.subscriptions.push(openNamespaceCommand);
    disposables.push(openNamespaceCommand);
    
    // Register set active namespace command
    const setActiveNamespaceCmd = vscode.commands.registerCommand(
        'kube9.setActiveNamespace',
        setActiveNamespaceCommand
    );
    context.subscriptions.push(setActiveNamespaceCmd);
    disposables.push(setActiveNamespaceCmd);
}

/**
 * This method is called when the extension is deactivated.
 * Use this to clean up resources.
 */
export async function deactivate(): Promise<void> {
    console.log('kube9 extension is deactivating...');
    
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
        
        // Stop watching for namespace context changes
        namespaceWatcher.stopWatching();
        console.log('Namespace context watcher stopped.');
        
        // Dispose status bar items
        if (authStatusBarItem) {
            authStatusBarItem.dispose();
        }
        
        if (namespaceStatusBar) {
            namespaceStatusBar.dispose();
        }
        
        // Clear tree provider reference
        clusterTreeProvider = undefined;
        
        // Clear status bar item references
        authStatusBarItem = undefined;
        namespaceStatusBar = undefined;
        
        // Clear extension context
        extensionContext = undefined;
        
        console.log('kube9 extension deactivated successfully.');
        
        // TODO: Cleanup additional resources as they are added
        // - Close Kubernetes connections
        // - Save state
        // - Cleanup AI service connections
    } catch (error) {
        console.error('Error during deactivation:', error);
    }
}

