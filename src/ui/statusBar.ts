import * as vscode from 'vscode';
import { getContextInfo } from '../utils/kubectlContext';
import { namespaceWatcher } from '../services/namespaceCache';

/**
 * Manages the status bar item that displays the current kubectl namespace context.
 * 
 * This status bar provides at-a-glance visibility of the active namespace without
 * requiring the tree view to be open. It automatically updates when the namespace
 * context changes, either through extension commands or external kubectl modifications.
 */
export class NamespaceStatusBar {
    /**
     * VS Code status bar item instance.
     */
    private statusBarItem: vscode.StatusBarItem | undefined;

    /**
     * Subscription to namespace context change events.
     */
    private contextSubscription: vscode.Disposable | undefined;

    /**
     * Extension context for managing disposables.
     */
    private extensionContext: vscode.ExtensionContext;

    /**
     * Creates a new NamespaceStatusBar instance.
     * 
     * @param context - The extension context for resource management
     */
    constructor(context: vscode.ExtensionContext) {
        this.extensionContext = context;
    }

    /**
     * Initializes the status bar item and subscribes to context changes.
     * 
     * This method:
     * 1. Creates the status bar item on the left side
     * 2. Sets the initial namespace display
     * 3. Subscribes to namespace context change events
     * 4. Shows the status bar if kubectl is available
     */
    async initialize(): Promise<void> {
        try {
            // Create status bar item on the left side with priority 100
            this.statusBarItem = vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Left,
                100
            );

            // Add to extension subscriptions for automatic cleanup
            this.extensionContext.subscriptions.push(this.statusBarItem);

            // Set initial namespace display
            await this.updateNamespaceDisplay();

            // Subscribe to namespace context change events
            this.contextSubscription = namespaceWatcher.onDidChangeContext(async () => {
                console.log('Namespace context changed, updating status bar...');
                await this.updateNamespaceDisplay();
            });

            // Add subscription to extension context for cleanup
            this.extensionContext.subscriptions.push(this.contextSubscription);

            console.log('Namespace status bar initialized successfully.');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Failed to initialize namespace status bar:', errorMessage);
            
            // Hide status bar if initialization fails
            if (this.statusBarItem) {
                this.statusBarItem.hide();
            }
        }
    }

    /**
     * Updates the status bar display with the current namespace information.
     * 
     * Queries kubectl for the current context state and updates the status bar
     * to show either the active namespace name or "All" if no namespace is set.
     * 
     * If kubectl is unavailable or an error occurs, the status bar is hidden.
     */
    private async updateNamespaceDisplay(): Promise<void> {
        if (!this.statusBarItem) {
            return;
        }

        try {
            // Get current kubectl context information
            const contextInfo = await getContextInfo();

            // Determine display text based on namespace state
            const namespaceDisplay = contextInfo.currentNamespace 
                ? contextInfo.currentNamespace 
                : 'All';

            // Update status bar text
            this.statusBarItem.text = `Namespace: ${namespaceDisplay}`;

            // Build detailed tooltip with context information
            const tooltipLines = [
                `Active Namespace: ${contextInfo.currentNamespace || 'None (cluster-wide view)'}`,
                `Context: ${contextInfo.contextName}`,
                `Cluster: ${contextInfo.clusterName}`
            ];

            // Add source information if available
            if (contextInfo.source === 'external') {
                tooltipLines.push('', 'Last changed externally via kubectl CLI');
            }

            this.statusBarItem.tooltip = tooltipLines.join('\n');

            // Show the status bar
            this.statusBarItem.show();

            console.log(`Status bar updated: Namespace = ${namespaceDisplay}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Failed to update namespace status bar:', errorMessage);
            
            // Hide status bar if kubectl is unavailable or errors occur
            this.statusBarItem.hide();
        }
    }

    /**
     * Disposes of the status bar and cleans up resources.
     * 
     * This method is called during extension deactivation to ensure
     * proper cleanup of event subscriptions and UI elements.
     */
    dispose(): void {
        // Dispose of context subscription
        if (this.contextSubscription) {
            this.contextSubscription.dispose();
            this.contextSubscription = undefined;
        }

        // Dispose of status bar item
        if (this.statusBarItem) {
            this.statusBarItem.dispose();
            this.statusBarItem = undefined;
        }

        console.log('Namespace status bar disposed.');
    }
}

