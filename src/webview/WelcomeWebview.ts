import * as vscode from 'vscode';
import { GlobalState } from '../state/GlobalState';

/**
 * WelcomeWebview displays a welcome screen on first activation.
 * Provides quick start guide, authentication instructions, and links to resources.
 */
export class WelcomeWebview {
    private static currentPanel: vscode.WebviewPanel | undefined;

    /**
     * Show the welcome webview panel.
     * Creates a new panel or reveals the existing one.
     * 
     * @param context - The VS Code extension context
     */
    public static show(context: vscode.ExtensionContext): void {
        const column = vscode.ViewColumn.One;

        // If we already have a panel, show it
        if (WelcomeWebview.currentPanel) {
            WelcomeWebview.currentPanel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'kandyWelcome',
            'Welcome to Kandy',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: []
            }
        );

        WelcomeWebview.currentPanel = panel;

        // Set the webview's HTML content
        panel.webview.html = WelcomeWebview.getWebviewContent(panel.webview);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'dismiss':
                        // Update global state to remember the user dismissed the welcome screen
                        const globalState = GlobalState.getInstance();
                        await globalState.setWelcomeScreenDismissed(message.doNotShowAgain);
                        panel.dispose();
                        break;

                    case 'openPortal':
                        // Open the Kandy portal in external browser
                        vscode.env.openExternal(vscode.Uri.parse('https://portal.kandy.dev'));
                        break;

                    case 'openSettings':
                        // Open VS Code settings for Kandy extension
                        vscode.commands.executeCommand('workbench.action.openSettings', 'kandy');
                        break;
                }
            },
            undefined,
            context.subscriptions
        );

        // Handle panel disposal
        panel.onDidDispose(
            () => {
                WelcomeWebview.currentPanel = undefined;
            },
            null,
            context.subscriptions
        );
    }

    /**
     * Generate the HTML content for the welcome webview.
     * 
     * @param webview - The webview instance
     * @returns HTML content string
     */
    private static getWebviewContent(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline';">
    <title>Welcome to Kandy</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 0;
            margin: 0;
            line-height: 1.6;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        .logo {
            font-size: 48px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }

        .subtitle {
            font-size: 18px;
            color: var(--vscode-descriptionForeground);
            margin-top: 0;
        }

        .section {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-left: 3px solid var(--vscode-focusBorder);
            padding: 20px;
            margin-bottom: 24px;
            border-radius: 4px;
        }

        .section h2 {
            margin-top: 0;
            color: var(--vscode-foreground);
            font-size: 20px;
            font-weight: 600;
        }

        .section p {
            margin: 12px 0;
            color: var(--vscode-foreground);
        }

        .feature-list {
            list-style: none;
            padding: 0;
            margin: 16px 0;
        }

        .feature-list li {
            padding: 8px 0;
            padding-left: 28px;
            position: relative;
        }

        .feature-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--vscode-terminal-ansiGreen);
            font-weight: bold;
            font-size: 18px;
        }

        .auth-notice {
            background-color: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
            padding: 12px 16px;
            border-radius: 4px;
            margin: 16px 0;
        }

        .auth-notice strong {
            color: var(--vscode-foreground);
        }

        .link-button {
            display: inline-block;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            cursor: pointer;
            border: none;
            font-size: 14px;
            margin: 4px 8px 4px 0;
            transition: background-color 0.2s;
        }

        .link-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .link-button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .link-button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .footer {
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid var(--vscode-widget-border);
        }

        .checkbox-container {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }

        .checkbox-container input[type="checkbox"] {
            margin-right: 8px;
            cursor: pointer;
        }

        .checkbox-container label {
            cursor: pointer;
            user-select: none;
        }

        .actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
            font-size: 0.9em;
        }

        .steps {
            margin: 16px 0;
            padding-left: 20px;
        }

        .steps li {
            margin: 8px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Kandy</div>
            <p class="subtitle">AI-Powered Kubernetes Cluster Manager</p>
        </div>

        <div class="section">
            <h2>🚀 Quick Start</h2>
            <p>Welcome to Kandy! Here's what you can do with this extension:</p>
            <ul class="feature-list">
                <li><strong>View Your Clusters:</strong> Browse all clusters from your kubeconfig in the sidebar</li>
                <li><strong>Navigate Resources:</strong> Explore namespaces, pods, deployments, services, and more</li>
                <li><strong>AI Recommendations:</strong> Get intelligent suggestions to optimize your workloads (requires API key)</li>
            </ul>
        </div>

        <div class="section">
            <h2>🔑 Authentication (Optional)</h2>
            <p>Kandy works without any configuration! However, to unlock AI-powered features, you can optionally configure an API key:</p>
            
            <div class="auth-notice">
                <strong>Note:</strong> API keys are only required for AI-powered recommendations. All core features (cluster viewing, resource navigation) work without authentication.
            </div>

            <p><strong>To get your API key:</strong></p>
            <ol class="steps">
                <li>Visit <span class="code">portal.kandy.dev</span> to create an account</li>
                <li>Generate an API key from your dashboard</li>
                <li>Add it to your VS Code settings under <span class="code">Kandy: Api Key</span></li>
            </ol>

            <div class="actions">
                <button class="link-button" onclick="openPortal()">Open Portal</button>
                <button class="link-button secondary" onclick="openSettings()">Open Settings</button>
            </div>
        </div>

        <div class="section">
            <h2>📚 Getting Started</h2>
            <p>To start using Kandy:</p>
            <ol class="steps">
                <li>Make sure you have a valid kubeconfig file (usually at <span class="code">~/.kube/config</span>)</li>
                <li>Look for the Kandy icon in the VS Code activity bar</li>
                <li>Click on any cluster or resource to view details</li>
                <li>Explore AI recommendations for optimization tips (with API key)</li>
            </ol>
        </div>

        <div class="footer">
            <div class="checkbox-container">
                <input type="checkbox" id="doNotShowAgain">
                <label for="doNotShowAgain">Do not show this welcome screen again</label>
            </div>
            <button class="link-button" onclick="dismiss()">Get Started</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function openPortal() {
            vscode.postMessage({ command: 'openPortal' });
        }

        function openSettings() {
            vscode.postMessage({ command: 'openSettings' });
        }

        function dismiss() {
            const doNotShowAgain = document.getElementById('doNotShowAgain').checked;
            vscode.postMessage({ 
                command: 'dismiss',
                doNotShowAgain: doNotShowAgain
            });
        }
    </script>
</body>
</html>`;
    }
}

