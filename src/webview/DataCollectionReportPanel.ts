import * as vscode from 'vscode';

/**
 * DataCollectionReportPanel displays a placeholder webview for the Data Collection report.
 * Shows a "coming soon" message indicating that this feature is not yet implemented.
 */
export class DataCollectionReportPanel {
    private static currentPanel: vscode.WebviewPanel | undefined;
    private static extensionContext: vscode.ExtensionContext | undefined;

    /**
     * Show the Data Collection report webview panel.
     * Creates a new panel or reveals the existing one.
     * 
     * @param context - The VS Code extension context
     */
    public static show(context: vscode.ExtensionContext): void {
        // Store the extension context for later use
        DataCollectionReportPanel.extensionContext = context;

        const column = vscode.ViewColumn.One;

        // If we already have a panel, show it
        if (DataCollectionReportPanel.currentPanel) {
            DataCollectionReportPanel.currentPanel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'kube9DataCollectionReport',
            'Data Collection Report',
            column,
            {
                enableScripts: false,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, 'src', 'webview')
                ]
            }
        );

        DataCollectionReportPanel.currentPanel = panel;

        // Set the webview's HTML content
        panel.webview.html = DataCollectionReportPanel.getWebviewContent(panel.webview);

        // Handle panel disposal
        panel.onDidDispose(
            () => {
                DataCollectionReportPanel.currentPanel = undefined;
            },
            null,
            context.subscriptions
        );
    }

    /**
     * Generate the HTML content for the Data Collection report webview.
     * Returns inline HTML with a styled "coming soon" message.
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
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline';">
    <title>Data Collection Report</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 40px;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            box-sizing: border-box;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 24px;
            opacity: 0.6;
        }
        h1 {
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 16px 0;
            color: var(--vscode-foreground);
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 24px 0;
            color: var(--vscode-descriptionForeground);
        }
        .message {
            background-color: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-textBlockQuote-border);
            padding: 16px 20px;
            margin-top: 24px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📊</div>
        <h1>Data Collection Report</h1>
        <p>Data Collection report is coming soon. This feature will be available in a future release.</p>
        <div class="message">
            <p style="margin: 0;">We're working on bringing you comprehensive data collection reporting capabilities to help you monitor and analyze your Kubernetes cluster data.</p>
        </div>
    </div>
</body>
</html>`;
    }
}

