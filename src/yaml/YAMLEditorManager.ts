import * as vscode from 'vscode';

/**
 * Identifies a Kubernetes resource for YAML editing operations.
 * Used to uniquely identify resources across clusters and namespaces.
 */
export interface ResourceIdentifier {
    /** The Kubernetes resource kind (e.g., "Deployment", "StatefulSet", "Pod") */
    kind: string;
    /** The name of the resource */
    name: string;
    /** The namespace containing the resource (undefined for cluster-scoped resources) */
    namespace?: string;
    /** The API version of the resource (e.g., "apps/v1") */
    apiVersion: string;
    /** The cluster context name from kubeconfig */
    cluster: string;
}

/**
 * Manages YAML editor instances for Kubernetes resources.
 * Coordinates opening, tracking, and managing YAML editors for resources
 * accessed from tree view, webviews, and VS Code's text editor system.
 */
export class YAMLEditorManager {
    /**
     * Map tracking open YAML editors by resource key.
     * Key format: `${cluster}:${namespace || '_cluster'}:${kind}:${name}`
     */
    private openEditors: Map<string, vscode.TextEditor> = new Map();

    /**
     * The VS Code extension context.
     * Used for registering disposables and managing lifecycle.
     */
    private context: vscode.ExtensionContext;

    /**
     * Creates a new YAMLEditorManager instance.
     * 
     * @param context - The VS Code extension context
     */
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Opens a YAML editor for the specified Kubernetes resource.
     * This is a stub implementation - full implementation will be added in story 004.
     * 
     * @param resource - The resource identifier for the resource to open
     * @returns Promise that resolves when the editor is opened
     */
    public async openYAMLEditor(resource: ResourceIdentifier): Promise<void> {
        // Stub implementation - will be fully implemented in story 004
        const resourceKey = this.getResourceKey(resource);
        
        // Check if editor is already open
        const existingEditor = this.openEditors.get(resourceKey);
        if (existingEditor) {
            // Reveal existing editor
            await vscode.window.showTextDocument(existingEditor.document, {
                preview: false,
                preserveFocus: false
            });
            return;
        }

        // TODO: Full implementation in story 004
        // - Create custom URI using createResourceUri helper
        // - Fetch YAML content using YAMLContentProvider
        // - Open text document with YAML language mode
        // - Track editor in openEditors Map
    }

    /**
     * Generates a unique resource key for tracking editors.
     * The key format ensures unique identification even for resources
     * with the same name in different clusters or namespaces.
     * 
     * @param resource - The resource identifier
     * @returns A unique string key for the resource
     */
    public getResourceKey(resource: ResourceIdentifier): string {
        const namespace = resource.namespace || '_cluster';
        return `${resource.cluster}:${namespace}:${resource.kind}:${resource.name}`;
    }

    /**
     * Disposes of the manager and cleans up all tracked editors.
     * Should be called during extension deactivation.
     */
    public dispose(): void {
        // Clear the editors map
        this.openEditors.clear();
    }
}

