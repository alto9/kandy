import * as vscode from 'vscode';

/**
 * This method is called when the extension is activated.
 * The extension is activated when VS Code starts up (onStartupFinished).
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Kandy extension is now active!');
    
    // Display a message to the user
    vscode.window.showInformationMessage('Kandy - Kubernetes Cluster Manager is ready!');
    
    // TODO: Initialize extension components
    // - Configuration manager
    // - Kubernetes client
    // - AI integration
    // - Tree view providers
}

/**
 * This method is called when the extension is deactivated.
 * Use this to clean up resources.
 */
export function deactivate() {
    console.log('Kandy extension is now deactivated.');
    
    // TODO: Cleanup resources
    // - Close Kubernetes connections
    // - Save state
    // - Dispose of subscriptions
}

