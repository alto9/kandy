import * as vscode from 'vscode';

/**
 * Command handler to open VS Code settings focused on the Kandy API key configuration.
 * This command provides users with quick access to configure their API key for AI-powered features.
 * 
 * The API key is optional and only required for AI recommendations.
 * Core cluster management features work without authentication.
 */
export async function configureApiKeyCommand(): Promise<void> {
    try {
        // Open VS Code settings and focus on the kandy.apiKey setting
        await vscode.commands.executeCommand(
            'workbench.action.openSettings',
            'kandy.apiKey'
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to open settings:', errorMessage);
        vscode.window.showErrorMessage(`Failed to open settings: ${errorMessage}`);
    }
}

