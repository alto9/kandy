import * as vscode from 'vscode';
import { GlobalState } from './state/GlobalState';
import { WelcomeWebview } from './webview/WelcomeWebview';
import { KubeconfigParser } from './kubernetes/KubeconfigParser';
import { ClusterTreeProvider } from './tree/ClusterTreeProvider';

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
        
        // TODO: Store parsed kubeconfig for use by tree view and other components
        // This will be implemented when creating the tree view provider
        
        // Initialize and register tree view provider
        clusterTreeProvider = new ClusterTreeProvider();
        const treeViewDisposable = vscode.window.registerTreeDataProvider(
            'kandyClusterView',
            clusterTreeProvider
        );
        context.subscriptions.push(treeViewDisposable);
        disposables.push(treeViewDisposable);
        console.log('Cluster tree view registered successfully.');
        
        // Register commands
        registerCommands();
        
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
 * Register all extension commands.
 * Commands are tracked in the disposables array for proper cleanup.
 */
function registerCommands(): void {
    // TODO: Register commands as they are implemented
    // Example:
    // const context = getExtensionContext();
    // const myCommand = vscode.commands.registerCommand('kandy.myCommand', () => {
    //     // Command implementation
    // });
    // context.subscriptions.push(myCommand);
    // disposables.push(myCommand);
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
        
        // Clear tree provider reference
        clusterTreeProvider = undefined;
        
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

