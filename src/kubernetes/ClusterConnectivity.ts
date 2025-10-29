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
        } catch (error: any) {
            // kubectl failed - could be timeout, cluster unreachable, or kubectl not found
            if (error.killed || error.signal === 'SIGTERM') {
                console.log(`Cluster connectivity check timed out for context: ${contextName}`);
            } else if (error.code === 'ENOENT') {
                console.error('kubectl command not found in PATH. Please install kubectl to check cluster connectivity.');
            } else {
                // Log stderr if available for debugging
                const stderr = error.stderr ? error.stderr.toString().trim() : '';
                if (stderr) {
                    console.log(`Cluster connectivity check failed for context ${contextName}: ${stderr}`);
                } else {
                    console.log(`Cluster connectivity check failed for context ${contextName}: ${error.message}`);
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
}

