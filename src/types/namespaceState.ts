/**
 * Represents the current namespace selection as managed by kubectl context.
 * 
 * This interface tracks the active namespace state from kubectl's context system,
 * which persists in the user's kubeconfig file. The extension reads this state
 * to display the active namespace and writes to it when the user changes selection.
 */
export interface KubectlContextState {
    /**
     * The currently selected namespace from kubectl context.
     * 
     * - string: A specific namespace is set as active
     * - null: No namespace is set (cluster-wide view)
     */
    currentNamespace: string | null;
    
    /**
     * The current kubectl context name.
     * 
     * Contexts are defined in kubeconfig and associate a cluster, user, and optionally a namespace.
     */
    contextName: string;
    
    /**
     * The cluster associated with the current context.
     * 
     * This is the cluster name as defined in the kubeconfig file.
     */
    clusterName: string;
    
    /**
     * Timestamp of when the context was last read.
     * 
     * Used for cache validation and staleness detection.
     */
    lastUpdated: Date;
    
    /**
     * Whether the context was set by this extension or externally.
     * 
     * - 'extension': The extension modified the kubectl context
     * - 'external': The context was changed outside the extension (e.g., via kubectl CLI)
     */
    source: 'extension' | 'external';
}

/**
 * Cached representation of namespace selection state.
 * 
 * This cache minimizes kubectl command executions by storing the context state
 * with a time-to-live (TTL). The cache is invalidated after the TTL expires or
 * when the extension makes context changes.
 */
export interface NamespaceSelectionCache {
    /**
     * Cached kubectl context state.
     */
    contextState: KubectlContextState;
    
    /**
     * Time-to-live for the cache in milliseconds.
     * 
     * The model specification recommends 5000ms (5 seconds) to balance
     * performance with responsiveness to external changes.
     */
    ttl: number;
    
    /**
     * Whether the cache is currently valid.
     * 
     * The cache is invalid if:
     * - The TTL has expired (lastUpdated + ttl < now)
     * - The cache was manually invalidated
     * - The extension has not yet populated the cache
     */
    isValid: boolean;
}

