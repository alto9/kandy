import { ConfigurationCommands } from '../kubectl/ConfigurationCommands';
import { KubectlError, KubectlErrorType } from '../kubernetes/KubectlError';

/**
 * ConfigMap response structure from kubectl.
 * This interface matches what will be exported from ConfigurationCommands in story 002.
 */
interface ConfigMapResponse {
    metadata?: {
        name?: string;
        namespace?: string;
    };
    data?: {
        [key: string]: string;
    };
}

/**
 * Result of a single ConfigMap query operation.
 * This interface matches what will be exported from ConfigurationCommands in story 002.
 */
interface ConfigMapResult {
    configMap: ConfigMapResponse | null;
    error?: KubectlError;
}

// Note: getConfigMap will be added to ConfigurationCommands in story 002.
// We use a type assertion to call it until story 002 is complete.

/**
 * Operator status mode as determined by the extension.
 */
export type OperatorStatusMode = 'basic' | 'operated' | 'enabled' | 'degraded';

/**
 * Operator status as returned by the kube9-operator-status ConfigMap.
 * Matches the operator's OperatorStatus interface.
 */
export interface OperatorStatus {
    /** Operator mode: "operated" (free) or "enabled" (pro) */
    mode: 'operated' | 'enabled';
    
    /** User-facing tier name */
    tier: 'free' | 'pro';
    
    /** Operator version (semver) */
    version: string;
    
    /** Health status */
    health: 'healthy' | 'degraded' | 'unhealthy';
    
    /** ISO 8601 timestamp of last status update */
    lastUpdate: string;
    
    /** Whether operator is registered with kube9-server (pro tier only) */
    registered: boolean;
    
    /** Error message if unhealthy or degraded */
    error: string | null;
    
    /** Optional: Server-provided cluster ID (pro tier only) */
    clusterId?: string;
}

/**
 * Cached operator status with metadata.
 */
export interface CachedOperatorStatus {
    /** The operator status, or null if operator not installed */
    status: OperatorStatus | null;
    
    /** Timestamp when this status was cached (milliseconds since epoch) */
    timestamp: number;
    
    /** The extension-determined status mode */
    mode: OperatorStatusMode;
}

/**
 * Client for querying and caching operator status from the kube9-operator-status ConfigMap.
 * 
 * This client queries the ConfigMap in the kube9-system namespace and caches results
 * for 5 minutes to minimize kubectl calls. Status is determined based on operator
 * presence, mode, tier, health, and registration state.
 */
export class OperatorStatusClient {
    /**
     * Cache storage keyed by `<kubeconfigPath>:<contextName>`.
     */
    private cache: Map<string, CachedOperatorStatus> = new Map();

    /**
     * Cache time-to-live in milliseconds (5 minutes).
     */
    private readonly CACHE_TTL_MS = 5 * 60 * 1000;

    /**
     * Name of the operator status ConfigMap.
     */
    private readonly STATUS_CONFIGMAP_NAME = 'kube9-operator-status';

    /**
     * Namespace where the operator status ConfigMap is located.
     */
    private readonly STATUS_NAMESPACE = 'kube9-system';

    /**
     * Retrieves the operator status for a cluster, using cache when available.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the Kubernetes context
     * @param forceRefresh If true, bypasses cache and queries the cluster directly
     * @returns Cached operator status with mode, status data, and timestamp
     */
    async getStatus(
        kubeconfigPath: string,
        contextName: string,
        forceRefresh = false
    ): Promise<CachedOperatorStatus> {
        const cacheKey = `${kubeconfigPath}:${contextName}`;

        // Check cache if not forcing refresh
        if (!forceRefresh && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey)!;
            const cacheAge = Date.now() - cached.timestamp;
            
            // Return cached result if still valid
            if (cacheAge < this.CACHE_TTL_MS) {
                return cached;
            }
        }

        // Query cluster for operator status
        try {
            // Note: getConfigMap will be added in story 002. Using type assertion for now.
            const result = await (ConfigurationCommands as any).getConfigMap(
                this.STATUS_CONFIGMAP_NAME,
                this.STATUS_NAMESPACE,
                kubeconfigPath,
                contextName
            ) as ConfigMapResult;

            // Handle 404 - operator not installed
            if (result.error) {
                const isNotFound = this.isNotFoundError(result.error);
                if (isNotFound) {
                    const basicStatus: CachedOperatorStatus = {
                        status: null,
                        timestamp: Date.now(),
                        mode: 'basic'
                    };
                    this.cache.set(cacheKey, basicStatus);
                    return basicStatus;
                }
                
                // Other errors - fall back to cache or basic status
                if (this.cache.has(cacheKey)) {
                    return this.cache.get(cacheKey)!;
                }
                
                // No cache available - return basic status
                const basicStatus: CachedOperatorStatus = {
                    status: null,
                    timestamp: Date.now(),
                    mode: 'basic'
                };
                this.cache.set(cacheKey, basicStatus);
                return basicStatus;
            }

            // ConfigMap found - parse status
            if (!result.configMap || !result.configMap.data) {
                // ConfigMap exists but has no data - treat as basic
                const basicStatus: CachedOperatorStatus = {
                    status: null,
                    timestamp: Date.now(),
                    mode: 'basic'
                };
                this.cache.set(cacheKey, basicStatus);
                return basicStatus;
            }

            const statusJson = result.configMap.data.status;
            if (!statusJson) {
                // ConfigMap exists but status key is missing - treat as basic
                const basicStatus: CachedOperatorStatus = {
                    status: null,
                    timestamp: Date.now(),
                    mode: 'basic'
                };
                this.cache.set(cacheKey, basicStatus);
                return basicStatus;
            }

            // Parse JSON status
            let operatorStatus: OperatorStatus;
            try {
                operatorStatus = JSON.parse(statusJson) as OperatorStatus;
            } catch (parseError) {
                // Invalid JSON - log error and fall back to basic status
                console.error(
                    `Failed to parse operator status JSON for context ${contextName}:`,
                    parseError instanceof Error ? parseError.message : String(parseError)
                );
                
                // Fall back to cache if available
                if (this.cache.has(cacheKey)) {
                    return this.cache.get(cacheKey)!;
                }
                
                // No cache - return basic status
                const basicStatus: CachedOperatorStatus = {
                    status: null,
                    timestamp: Date.now(),
                    mode: 'basic'
                };
                this.cache.set(cacheKey, basicStatus);
                return basicStatus;
            }

            // Determine extension status mode
            const mode = this.determineStatusMode(operatorStatus);

            // Cache the result
            const cachedStatus: CachedOperatorStatus = {
                status: operatorStatus,
                timestamp: Date.now(),
                mode
            };
            this.cache.set(cacheKey, cachedStatus);
            return cachedStatus;

        } catch (error) {
            // Unexpected error - fall back to cache or basic status
            console.error(
                `Unexpected error querying operator status for context ${contextName}:`,
                error instanceof Error ? error.message : String(error)
            );

            // Fall back to cache if available
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey)!;
            }

            // No cache available - return basic status
            const basicStatus: CachedOperatorStatus = {
                status: null,
                timestamp: Date.now(),
                mode: 'basic'
            };
            this.cache.set(cacheKey, basicStatus);
            return basicStatus;
        }
    }

    /**
     * Clears the cached status for a specific cluster.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the Kubernetes context
     */
    clearCache(kubeconfigPath: string, contextName: string): void {
        const cacheKey = `${kubeconfigPath}:${contextName}`;
        this.cache.delete(cacheKey);
    }

    /**
     * Clears all cached operator statuses.
     */
    clearAllCache(): void {
        this.cache.clear();
    }

    /**
     * Determines the extension status mode from operator status.
     * 
     * @param status The operator status from the ConfigMap
     * @returns The extension-determined status mode
     */
    private determineStatusMode(status: OperatorStatus): OperatorStatusMode {
        // Check if status timestamp is stale (>5 minutes)
        try {
            const lastUpdateTime = new Date(status.lastUpdate).getTime();
            const statusAge = Date.now() - lastUpdateTime;
            const isStale = statusAge > this.CACHE_TTL_MS;
            
            if (isStale) {
                return 'degraded';
            }
        } catch (error) {
            // Invalid timestamp - treat as degraded
            console.error('Failed to parse operator status lastUpdate timestamp:', error);
            return 'degraded';
        }

        // Check health status
        if (status.health === 'degraded' || status.health === 'unhealthy') {
            return 'degraded';
        }

        // Check enabled mode (pro tier)
        if (status.mode === 'enabled') {
            if (status.tier === 'pro' && status.registered && status.health === 'healthy') {
                return 'enabled';
            }
            // Enabled mode but not properly registered or healthy - degraded
            return 'degraded';
        }

        // Check operated mode (free tier)
        if (status.mode === 'operated') {
            if (status.tier === 'free' && status.health === 'healthy') {
                return 'operated';
            }
            // Operated mode but not healthy - degraded
            return 'degraded';
        }

        // Unknown mode - treat as degraded
        return 'degraded';
    }

    /**
     * Checks if a kubectl error indicates the ConfigMap was not found (404).
     * 
     * @param error The kubectl error to check
     * @returns True if the error indicates ConfigMap not found
     */
    private isNotFoundError(error: import('../kubernetes/KubectlError').KubectlError): boolean {
        // Check error details for 404 indicators
        const details = error.getDetails().toLowerCase();
        return (
            details.includes('not found') ||
            details.includes('404') ||
            error.type === KubectlErrorType.Unknown && details.includes('configmap') && details.includes('not found')
        );
    }
}

