import * as vscode from 'vscode';

/**
 * Settings helper class for accessing Kandy extension configuration.
 * Provides type-safe access to VS Code workspace configuration.
 */
export class Settings {
    private static readonly CONFIGURATION_SECTION = 'kandy';

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
        return config.get<string>('serverUrl') || 'https://api.kandy.dev';
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
}

