import { execFile } from 'child_process';
import { promisify } from 'util';
import { ClusterStatus } from './ClusterTypes';
import { KubectlError } from './KubectlError';

/**
 * Timeout for connectivity checks in milliseconds.
 * If a cluster doesn't respond within this time, it's considered disconnected.
 */
const CONNECTIVITY_TIMEOUT_MS = 5000;

/**
 * Promisified version of execFile for async/await usage.
 */
const execFileAsync = promisify(execFile);

/**
 * Interface for kubectl namespace response items.
 */
interface NamespaceItem {
    metadata?: {
        name?: string;
    };
}

/**
 * Interface for kubectl namespace list response.
 */
interface NamespaceListResponse {
    items?: NamespaceItem[];
}

/**
 * Result of a connectivity check operation.
 */
export interface ConnectivityResult {
    /**
     * The connection status of the cluster.
     */
    status: ClusterStatus;
    
    /**
     * Error information if the connectivity check failed.
     */
    error?: KubectlError;
}

/**
 * Result of a namespace query operation.
 */
export interface NamespaceResult {
    /**
     * Array of namespace names, empty if query failed.
     */
    namespaces: string[];
    
    /**
     * Error information if the namespace query failed.
     */
    error?: KubectlError;
}

/**
 * Utility class for checking Kubernetes cluster connectivity using kubectl.
 */
export class ClusterConnectivity {
    /**
     * Checks if a cluster is reachable using kubectl cluster-info command.
     * Uses the specified kubeconfig file and context to verify connectivity.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to check
     * @returns ConnectivityResult with status and optional error information
     */
    public static async checkConnectivity(
        kubeconfigPath: string,
        contextName: string
    ): Promise<ConnectivityResult> {
        try {
            // Execute kubectl cluster-info with explicit kubeconfig and context
            await execFileAsync(
                'kubectl',
                [
                    'cluster-info',
                    `--kubeconfig=${kubeconfigPath}`,
                    `--context=${contextName}`
                ],
                {
                    timeout: CONNECTIVITY_TIMEOUT_MS,
                    // Set environment to avoid picking up unwanted kubectl settings
                    env: { ...process.env }
                }
            );
            
            // If kubectl succeeds (exit code 0), cluster is connected
            return { status: ClusterStatus.Connected };
        } catch (error: unknown) {
            // kubectl failed - create structured error for detailed handling
            const kubectlError = KubectlError.fromExecError(error, contextName);
            
            // Log error details for debugging
            console.log(`Cluster connectivity check failed for context ${contextName}: ${kubectlError.getDetails()}`);
            
            return { 
                status: ClusterStatus.Disconnected,
                error: kubectlError
            };
        }
    }

    /**
     * Checks connectivity for multiple clusters in parallel.
     * This is more efficient than checking them sequentially.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextNames Array of context names to check
     * @returns Array of ConnectivityResult values in the same order as input
     */
    public static async checkMultipleConnectivity(
        kubeconfigPath: string,
        contextNames: string[]
    ): Promise<ConnectivityResult[]> {
        const promises = contextNames.map(contextName => 
            this.checkConnectivity(kubeconfigPath, contextName)
        );
        return await Promise.all(promises);
    }

    /**
     * Retrieves the list of namespaces from a cluster using kubectl.
     * Uses kubectl get namespaces command with JSON output for parsing.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @returns NamespaceResult with namespaces array and optional error information
     */
    public static async getNamespaces(
        kubeconfigPath: string,
        contextName: string
    ): Promise<NamespaceResult> {
        try {
            // Execute kubectl get namespaces with JSON output
            const { stdout } = await execFileAsync(
                'kubectl',
                [
                    'get',
                    'namespaces',
                    '--output=json',
                    `--kubeconfig=${kubeconfigPath}`,
                    `--context=${contextName}`
                ],
                {
                    timeout: CONNECTIVITY_TIMEOUT_MS,
                    env: { ...process.env }
                }
            );

            // Parse the JSON response
            const response: NamespaceListResponse = JSON.parse(stdout);
            
            // Extract namespace names from the items array
            const namespaces: string[] = response.items?.map((item: NamespaceItem) => item.metadata?.name).filter((name): name is string => Boolean(name)) || [];
            
            // Sort alphabetically
            namespaces.sort((a, b) => a.localeCompare(b));
            
            return { namespaces };
        } catch (error: unknown) {
            // kubectl failed - create structured error for detailed handling
            const kubectlError = KubectlError.fromExecError(error, contextName);
            
            // Log error details for debugging
            console.log(`Namespace query failed for context ${contextName}: ${kubectlError.getDetails()}`);
            
            return {
                namespaces: [],
                error: kubectlError
            };
        }
    }
}

