/**
 * Message type definitions for bidirectional communication between webview and extension.
 * 
 * These interfaces ensure type safety for all messages passed between the webview panel
 * and the extension host, covering namespace selection, resource navigation, and context updates.
 */

// ============================================================================
// Webview to Extension Messages
// ============================================================================

/**
 * Message sent when user selects a specific namespace from the dropdown.
 * Instructs the extension to update the kubectl context to the selected namespace.
 */
export interface SetActiveNamespaceMessage {
    command: 'setActiveNamespace';
    data: {
        /** The namespace name to set as active in kubectl context */
        namespace: string;
    };
}

/**
 * Message sent when user requests a refresh of webview data.
 * Instructs the extension to reload namespace list and resources.
 */
export interface RefreshMessage {
    command: 'refresh';
}

/**
 * Message sent when user clicks on a resource in the webview.
 * Instructs the extension to open detailed view for the specified resource.
 */
export interface OpenResourceMessage {
    command: 'openResource';
    data: {
        /** The type of Kubernetes resource (e.g., 'pod', 'deployment', 'service') */
        type: string;
        /** The name of the specific resource instance */
        name: string;
    };
}

/**
 * Message sent when user selects a workload type pill.
 * Instructs the extension to fetch workload data for the selected type.
 */
export interface FetchWorkloadsMessage {
    command: 'fetchWorkloads';
    data: {
        /** The workload type (lowercase: 'deployments', 'statefulsets', 'daemonsets', 'cronjobs') */
        workloadType: string;
    };
}

/**
 * Union type of all messages that can be sent from webview to extension.
 */
export type WebviewMessage = 
    | SetActiveNamespaceMessage 
    | RefreshMessage
    | OpenResourceMessage
    | FetchWorkloadsMessage;

// ============================================================================
// Extension to Webview Messages
// ============================================================================

/**
 * Message sent by extension to populate the namespace dropdown.
 * Contains the full list of available namespaces and the current selection.
 */
export interface NamespaceDataMessage {
    command: 'namespaceData';
    data: {
        /** Array of namespace objects with their names */
        namespaces: Array<{ name: string }>;
        /** The currently active namespace, or null for "All Namespaces" */
        currentNamespace: string | null;
    };
}

/**
 * Message sent when the namespace context changes (from extension or externally).
 * Instructs the webview to update its UI to reflect the new namespace state.
 */
export interface NamespaceContextChangedMessage {
    command: 'namespaceContextChanged';
    data: {
        /** The new active namespace, or null for "All Namespaces" */
        namespace: string | null;
        /** 
         * Source of the change:
         * - 'extension': Changed by this extension (user-initiated)
         * - 'external': Changed outside the extension (e.g., via kubectl CLI)
         */
        source: 'extension' | 'external';
        /** 
         * Indicates whether the webview's displayed namespace matches the active kubectl context.
         * When true, the namespace button should show as disabled/selected (default namespace).
         * When false, the namespace button should show as enabled (can be set as default).
         */
        isActive: boolean;
    };
}

/**
 * Message sent by extension with workload data for the selected type.
 * Contains workloads array with health information and metadata.
 */
export interface WorkloadsDataMessage {
    command: 'workloadsData';
    data: {
        /** Array of workload entries with health information */
        workloads: any[]; // WorkloadEntry[] - using any to avoid circular dependencies
        /** Timestamp of last data update */
        lastUpdated: Date;
        /** Namespace filter (null means "All Namespaces") */
        namespace: string | null;
        /** Optional error message if data fetch failed */
        error?: string;
    };
}

/**
 * Union type of all messages that can be sent from extension to webview.
 */
export type ExtensionMessage = 
    | NamespaceDataMessage 
    | NamespaceContextChangedMessage
    | WorkloadsDataMessage;

