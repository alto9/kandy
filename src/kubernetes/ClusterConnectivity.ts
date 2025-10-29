import { execFile } from 'child_process';
import { promisify } from 'util';
import { ClusterStatus } from './ClusterTypes';

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
 * Utility class for checking Kubernetes cluster connectivity using kubectl.
 */
export class ClusterConnectivity {
    /**
     * Checks if a cluster is reachable using kubectl cluster-info command.
     * Uses the specified kubeconfig file and context to verify connectivity.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to check
     * @returns ClusterStatus indicating if the cluster is reachable
     */
    public static async checkConnectivity(
        kubeconfigPath: string,
        contextName: string
    ): Promise<ClusterStatus> {
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
            return ClusterStatus.Connected;
        } catch (error: unknown) {
            // kubectl failed - could be timeout, cluster unreachable, or kubectl not found
            const err = error as { killed?: boolean; signal?: string; code?: string; stderr?: Buffer; message?: string };
            if (err.killed || err.signal === 'SIGTERM') {
                console.log(`Cluster connectivity check timed out for context: ${contextName}`);
            } else if (err.code === 'ENOENT') {
                console.error('kubectl command not found in PATH. Please install kubectl to check cluster connectivity.');
            } else {
                // Log stderr if available for debugging
                const stderr = err.stderr ? err.stderr.toString().trim() : '';
                if (stderr) {
                    console.log(`Cluster connectivity check failed for context ${contextName}: ${stderr}`);
                } else {
                    console.log(`Cluster connectivity check failed for context ${contextName}: ${err.message || 'Unknown error'}`);
                }
            }
            
            return ClusterStatus.Disconnected;
        }
    }

    /**
     * Checks connectivity for multiple clusters in parallel.
     * This is more efficient than checking them sequentially.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextNames Array of context names to check
     * @returns Array of ClusterStatus values in the same order as input
     */
    public static async checkMultipleConnectivity(
        kubeconfigPath: string,
        contextNames: string[]
    ): Promise<ClusterStatus[]> {
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
     * @returns Array of namespace names sorted alphabetically, or empty array on error
     */
    public static async getNamespaces(
        kubeconfigPath: string,
        contextName: string
    ): Promise<string[]> {
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
            
            return namespaces;
        } catch (error: unknown) {
            // kubectl failed - could be timeout, cluster unreachable, or kubectl not found
            const err = error as { killed?: boolean; signal?: string; code?: string; stderr?: Buffer; message?: string };
            
            if (err.killed || err.signal === 'SIGTERM') {
                console.log(`Namespace query timed out for context: ${contextName}`);
            } else if (err.code === 'ENOENT') {
                console.error('kubectl command not found in PATH. Please install kubectl to query namespaces.');
            } else {
                // Log stderr if available for debugging
                const stderr = err.stderr ? err.stderr.toString().trim() : '';
                if (stderr) {
                    console.log(`Namespace query failed for context ${contextName}: ${stderr}`);
                } else {
                    console.log(`Namespace query failed for context ${contextName}: ${err.message || 'Unknown error'}`);
                }
            }
            
            // Return empty array on error - detailed error handling will come in story 08
            return [];
        }
    }
}

