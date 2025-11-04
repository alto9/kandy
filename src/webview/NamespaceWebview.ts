import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getContextInfo, setNamespace, clearNamespace } from '../utils/kubectlContext';
import { NamespaceCommands } from '../kubectl/NamespaceCommands';
import { KubeconfigParser } from '../kubernetes/KubeconfigParser';
import { WebviewMessage } from '../types/webviewMessages';
import { getClusterTreeProvider } from '../extension';

/**
 * Context information for namespace webviews.
 */
export interface NamespaceContext {
    /** The cluster name */
    clusterName: string;
    /** The context name from kubeconfig */
    contextName: string;
    /** The namespace name, or undefined for "All Namespaces" view */
    namespace?: string;
}

/**
 * NamespaceWebview manages webview panels for namespace navigation.
 * Each panel shows resources and details for a specific namespace or cluster-wide view.
 */
export class NamespaceWebview {
    /**
     * Map of open webview panels keyed by "contextName:namespace".
     * Allows reusing existing panels when the same namespace is clicked again.
     */
    private static openPanels: Map<string, vscode.WebviewPanel> = new Map();
    
    private static extensionContext: vscode.ExtensionContext | undefined;

    /**
     * Show a namespace webview panel.
     * Creates a new panel or reveals an existing one for the given namespace.
     * 
     * @param context - The VS Code extension context
     * @param namespaceContext - The namespace and cluster context information
     */
    public static show(context: vscode.ExtensionContext, namespaceContext: NamespaceContext): void {
        // Store the extension context for later use
        NamespaceWebview.extensionContext = context;

        // Create a unique key for this namespace panel
        const panelKey = NamespaceWebview.getPanelKey(namespaceContext);

        // If we already have a panel for this namespace, reveal it
        const existingPanel = NamespaceWebview.openPanels.get(panelKey);
        if (existingPanel) {
            existingPanel.reveal(vscode.ViewColumn.One);
            return;
        }

        // Create a title for the panel
        const title = namespaceContext.namespace 
            ? `${namespaceContext.namespace} - ${namespaceContext.clusterName}`
            : `All Namespaces - ${namespaceContext.clusterName}`;

        // Create a new webview panel
        const panel = vscode.window.createWebviewPanel(
            'kandyNamespace',
            title,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, 'src', 'webview')
                ]
            }
        );

        // Store the panel in our map
        NamespaceWebview.openPanels.set(panelKey, panel);

        // Set the webview's HTML content
        panel.webview.html = NamespaceWebview.getWebviewContent(
            panel.webview, 
            context, 
            namespaceContext
        );

        // Send initial namespace data to populate the selector
        NamespaceWebview.sendNamespaceData(panel);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async (message: WebviewMessage) => {
                switch (message.command) {
                    case 'refresh':
                        // TODO: Refresh namespace data
                        console.log('Refresh requested for namespace webview');
                        break;
                    
                    case 'openResource':
                        // TODO: Open resource details
                        console.log('Open resource requested:', message.data);
                        break;
                    
                    case 'setActiveNamespace':
                        // Set the active namespace in kubectl context
                        if (message.data?.namespace) {
                            const success = await setNamespace(message.data.namespace);
                            if (success) {
                                console.log(`Namespace set to: ${message.data.namespace}`);
                                
                                // Refresh the tree view to filter resources by namespace
                                try {
                                    const treeProvider = getClusterTreeProvider();
                                    treeProvider.refresh();
                                    console.log('Tree view refreshed after namespace change');
                                } catch (error) {
                                    console.error('Failed to refresh tree view:', error);
                                }
                                
                                // Notify all webview panels of the context change
                                NamespaceWebview.notifyAllPanelsOfContextChange(
                                    message.data.namespace,
                                    'extension'
                                );
                            } else {
                                vscode.window.showErrorMessage(
                                    `Failed to set namespace to: ${message.data.namespace}`
                                );
                            }
                        }
                        break;
                    
                    case 'clearActiveNamespace': {
                        // Clear the active namespace in kubectl context
                        const success = await clearNamespace();
                        if (success) {
                            console.log('Namespace cleared (All Namespaces)');
                            
                            // Refresh the tree view to show all resources
                            try {
                                const treeProvider = getClusterTreeProvider();
                                treeProvider.refresh();
                                console.log('Tree view refreshed after clearing namespace');
                            } catch (error) {
                                console.error('Failed to refresh tree view:', error);
                            }
                            
                            // Notify all webview panels of the context change
                            NamespaceWebview.notifyAllPanelsOfContextChange(
                                null,
                                'extension'
                            );
                        } else {
                            vscode.window.showErrorMessage('Failed to clear namespace');
                        }
                        break;
                    }
                }
            },
            undefined,
            context.subscriptions
        );

        // Handle panel disposal
        panel.onDidDispose(
            () => {
                // Remove the panel from our map
                NamespaceWebview.openPanels.delete(panelKey);
            },
            null,
            context.subscriptions
        );
    }

    /**
     * Generate a unique key for a namespace panel.
     * 
     * @param namespaceContext - The namespace context
     * @returns A unique string key
     */
    private static getPanelKey(namespaceContext: NamespaceContext): string {
        const namespacePart = namespaceContext.namespace || '__all__';
        return `${namespaceContext.contextName}:${namespacePart}`;
    }

    /**
     * Generate the HTML content for the namespace webview.
     * Loads the HTML from the external namespace.html file and injects context data.
     * 
     * @param webview - The webview instance
     * @param context - The extension context
     * @param namespaceContext - The namespace and cluster context information
     * @returns HTML content string
     */
    private static getWebviewContent(
        webview: vscode.Webview, 
        context: vscode.ExtensionContext,
        namespaceContext: NamespaceContext
    ): string {
        try {
            // Get the path to the HTML file
            const htmlPath = path.join(context.extensionPath, 'src', 'webview', 'namespace.html');
            
            // Get the URI for the main.js script file
            const scriptPath = vscode.Uri.joinPath(context.extensionUri, 'src', 'webview', 'main.js');
            const scriptUri = webview.asWebviewUri(scriptPath);
            
            // Read the HTML file
            let htmlContent = fs.readFileSync(htmlPath, 'utf8');
            
            // Replace placeholders with actual context data
            htmlContent = htmlContent.replace('{{CLUSTER_NAME}}', this.escapeHtml(namespaceContext.clusterName));
            htmlContent = htmlContent.replace('{{CONTEXT_NAME}}', this.escapeHtml(namespaceContext.contextName));
            
            if (namespaceContext.namespace) {
                htmlContent = htmlContent.replace('{{NAMESPACE_NAME}}', this.escapeHtml(namespaceContext.namespace));
                htmlContent = htmlContent.replace('{{IS_ALL_NAMESPACES}}', 'false');
            } else {
                htmlContent = htmlContent.replace('{{NAMESPACE_NAME}}', 'All Namespaces');
                htmlContent = htmlContent.replace('{{IS_ALL_NAMESPACES}}', 'true');
            }
            
            // Replace script URI placeholder
            htmlContent = htmlContent.replace('{{SCRIPT_URI}}', scriptUri.toString());
            
            // Replace CSP source placeholder
            htmlContent = htmlContent.replace('{{CSP_SOURCE}}', webview.cspSource);
            
            return htmlContent;
        } catch (error) {
            // Fallback error message if HTML file cannot be loaded
            console.error('Failed to load namespace.html:', error);
            return NamespaceWebview.getFallbackContent(namespaceContext);
        }
    }

    /**
     * Escape HTML special characters to prevent XSS.
     * 
     * @param unsafe - The string to escape
     * @returns The escaped string
     */
    private static escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Generate fallback HTML content if the template file cannot be loaded.
     * 
     * @param namespaceContext - The namespace context
     * @returns Fallback HTML content
     */
    private static getFallbackContent(namespaceContext: NamespaceContext): string {
        const namespaceName = namespaceContext.namespace || 'All Namespaces';
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
                <title>Namespace: ${this.escapeHtml(namespaceName)}</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        padding: 20px;
                    }
                    h1 { margin-top: 0; }
                    .info { opacity: 0.8; margin: 10px 0; }
                </style>
            </head>
            <body>
                <h1>${this.escapeHtml(namespaceName)}</h1>
                <div class="info">Cluster: ${this.escapeHtml(namespaceContext.clusterName)}</div>
                <div class="info">Context: ${this.escapeHtml(namespaceContext.contextName)}</div>
                <p>Resource navigation coming soon...</p>
            </body>
            </html>
        `;
    }

    /**
     * Send namespace data to a webview panel.
     * This includes the list of available namespaces and the current namespace.
     * 
     * @param panel - The webview panel to send data to
     */
    public static async sendNamespaceData(panel: vscode.WebviewPanel): Promise<void> {
        try {
            // Get context information
            const contextInfo = await getContextInfo();
            
            // Get kubeconfig path and namespace list
            const kubeconfigPath = KubeconfigParser.getKubeconfigPath();
            const namespacesResult = await NamespaceCommands.getNamespaces(
                kubeconfigPath,
                contextInfo.contextName
            );

            // Send data to webview
            panel.webview.postMessage({
                command: 'namespaceData',
                data: {
                    namespaces: namespacesResult.namespaces,
                    currentNamespace: contextInfo.currentNamespace
                }
            });
        } catch (error) {
            console.error('Failed to send namespace data to webview:', error);
            // Send empty data on error
            panel.webview.postMessage({
                command: 'namespaceData',
                data: {
                    namespaces: [],
                    currentNamespace: null
                }
            });
        }
    }

    /**
     * Send a namespace context changed notification to a webview panel.
     * 
     * @param panel - The webview panel to notify
     * @param namespace - The new namespace (null for "All Namespaces")
     * @param source - The source of the change ('extension' or 'external')
     */
    public static sendNamespaceContextChanged(
        panel: vscode.WebviewPanel,
        namespace: string | null,
        source: 'extension' | 'external'
    ): void {
        panel.webview.postMessage({
            command: 'namespaceContextChanged',
            data: {
                namespace,
                source
            }
        });
    }

    /**
     * Send namespace context changed notification to all open webview panels.
     * This is useful when the context changes externally or from another component.
     * 
     * @param namespace - The new namespace (null for "All Namespaces")
     * @param source - The source of the change ('extension' or 'external')
     */
    public static notifyAllPanelsOfContextChange(
        namespace: string | null,
        source: 'extension' | 'external'
    ): void {
        for (const panel of NamespaceWebview.openPanels.values()) {
            NamespaceWebview.sendNamespaceContextChanged(panel, namespace, source);
        }
    }
}

