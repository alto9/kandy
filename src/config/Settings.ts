import * as vscode from 'vscode';

/**
 * Settings helper class for accessing kube9 extension configuration.
 * Provides type-safe access to VS Code workspace configuration.
 */
export class Settings {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private static readonly CONFIGURATION_SECTION = 'kube9';

    /**
     * Get the configured API key for AI-powered features.
     * @returns The API key string if configured, undefined otherwise
     */
    public static getApiKey(): string | undefined {
        const config = vscode.workspace.getConfiguration(this.CONFIGURATION_SECTION);
        const apiKey = config.get<string>('apiKey');
        
        // Return undefined for empty strings to handle gracefully
        if (apiKey === null || apiKey === undefined || apiKey.trim() === '') {
            return undefined;
        }
        
        return apiKey.trim();
    }

    /**
     * Get the configured server URL.
     * @returns The server URL string
     */
    public static getServerUrl(): string {
        const config = vscode.workspace.getConfiguration(this.CONFIGURATION_SECTION);
        return config.get<string>('serverUrl') || 'https://api.kube9.dev';
    }

    /**
     * Check if debug mode is enabled.
     * @returns True if debug mode is enabled, false otherwise
     */
    public static isDebugMode(): boolean {
        const config = vscode.workspace.getConfiguration(this.CONFIGURATION_SECTION);
        return config.get<boolean>('debugMode') || false;
    }

    /**
     * Check if an API key is configured.
     * @returns True if an API key is set, false otherwise
     */
    public static hasApiKey(): boolean {
        return this.getApiKey() !== undefined;
    }

    /**
     * Set the API key securely using VSCode secret storage.
     * @param context - The extension context for accessing secret storage
     * @param apiKey - The API key to store
     */
    public static async setApiKey(context: vscode.ExtensionContext, apiKey: string): Promise<void> {
        await context.secrets.store('kube9.apiKey', apiKey);
    }

    /**
     * Get the API key from secret storage first, fallback to workspace config.
     * @param context - The extension context for accessing secret storage
     * @returns The API key string if configured, undefined otherwise
     */
    public static async getApiKeyFromSecrets(context: vscode.ExtensionContext): Promise<string | undefined> {
        const secretApiKey = await context.secrets.get('kube9.apiKey');
        if (secretApiKey && secretApiKey.trim().length > 0) {
            return secretApiKey.trim();
        }
        
        // Fallback to workspace config for backwards compatibility
        return this.getApiKey();
    }

    /**
     * Check if an API key is configured in either secrets or workspace config.
     * @param context - The extension context for accessing secret storage
     * @returns True if an API key is set, false otherwise
     */
    public static async hasApiKeyInSecrets(context: vscode.ExtensionContext): Promise<boolean> {
        const apiKey = await this.getApiKeyFromSecrets(context);
        return apiKey !== undefined;
    }
}

