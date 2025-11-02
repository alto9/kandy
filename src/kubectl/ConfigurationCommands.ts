import { execFile } from 'child_process';
import { promisify } from 'util';
import { KubectlError } from '../kubernetes/KubectlError';

/**
 * Timeout for kubectl commands in milliseconds.
 */
const KUBECTL_TIMEOUT_MS = 5000;

/**
 * Promisified version of execFile for async/await usage.
 */
const execFileAsync = promisify(execFile);

/**
 * Information about a Kubernetes configmap.
 */
export interface ConfigMapInfo {
    /** Name of the configmap */
    name: string;
    /** Namespace of the configmap */
    namespace: string;
    /** Number of data keys in the configmap */
    dataKeys: number;
}

/**
 * Result of a configmap query operation.
 */
export interface ConfigMapsResult {
    /**
     * Array of configmap information, empty if query failed.
     */
    configMaps: ConfigMapInfo[];
    
    /**
     * Error information if the configmap query failed.
     */
    error?: KubectlError;
}

/**
 * Interface for kubectl configmap response items.
 */
interface ConfigMapItem {
    metadata?: {
        name?: string;
        namespace?: string;
    };
    data?: {
        [key: string]: string;
    };
}

/**
 * Interface for kubectl configmap list response.
 */
interface ConfigMapListResponse {
    items?: ConfigMapItem[];
}

/**
 * Utility class for kubectl configuration operations.
 */
export class ConfigurationCommands {
    /**
     * Retrieves the list of configmaps from all namespaces using kubectl.
     * Uses kubectl get configmaps command with --all-namespaces and JSON output for parsing.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @returns ConfigMapsResult with configMaps array and optional error information
     */
    public static async getConfigMaps(
        kubeconfigPath: string,
        contextName: string
    ): Promise<ConfigMapsResult> {
        try {
            // Execute kubectl get configmaps with JSON output across all namespaces
            const { stdout } = await execFileAsync(
                'kubectl',
                [
                    'get',
                    'configmaps',
                    '--all-namespaces',
                    '--output=json',
                    `--kubeconfig=${kubeconfigPath}`,
                    `--context=${contextName}`
                ],
                {
                    timeout: KUBECTL_TIMEOUT_MS,
                    env: { ...process.env }
                }
            );

            // Parse the JSON response
            const response: ConfigMapListResponse = JSON.parse(stdout);
            
            // Extract configmap information from the items array
            const configMaps: ConfigMapInfo[] = response.items?.map((item: ConfigMapItem) => {
                const name = item.metadata?.name || 'Unknown';
                const namespace = item.metadata?.namespace || 'Unknown';
                
                // Count the number of data keys
                const dataKeys = item.data ? Object.keys(item.data).length : 0;
                
                return {
                    name,
                    namespace,
                    dataKeys
                };
            }) || [];
            
            // Sort configmaps by namespace first, then by name
            configMaps.sort((a, b) => {
                const namespaceCompare = a.namespace.localeCompare(b.namespace);
                if (namespaceCompare !== 0) {
                    return namespaceCompare;
                }
                return a.name.localeCompare(b.name);
            });
            
            return { configMaps };
        } catch (error: unknown) {
            // kubectl failed - create structured error for detailed handling
            const kubectlError = KubectlError.fromExecError(error, contextName);
            
            // Log error details for debugging
            console.log(`ConfigMap query failed for context ${contextName}: ${kubectlError.getDetails()}`);
            
            return {
                configMaps: [],
                error: kubectlError
            };
        }
    }
}

