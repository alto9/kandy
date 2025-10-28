import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { ClusterStatus } from './ClusterTypes';

/**
 * Timeout for connectivity checks in milliseconds.
 * If a cluster doesn't respond within this time, it's considered disconnected.
 */
const CONNECTIVITY_TIMEOUT_MS = 5000;

/**
 * Utility class for checking Kubernetes cluster API connectivity.
 */
export class ClusterConnectivity {
    /**
     * Checks if a cluster API endpoint is reachable.
     * Makes a simple HTTPS/HTTP request to the cluster server URL.
     * 
     * Note: This only checks if the endpoint is reachable, not if authentication
     * would succeed. A 401/403 response is still considered "connected" since
     * the server is responding.
     * 
     * @param serverUrl The cluster API server URL (e.g., https://api.cluster.example.com:6443)
     * @returns ClusterStatus indicating if the cluster is reachable
     */
    public static async checkConnectivity(serverUrl: string): Promise<ClusterStatus> {
        try {
            // Parse the URL to determine protocol and endpoint
            const url = new URL(serverUrl);
            
            // Return a promise that resolves when the request completes or times out
            return await new Promise<ClusterStatus>((resolve) => {
                // Determine which module to use based on protocol
                const client = url.protocol === 'https:' ? https : http;
                
                // Create request options
                const options = {
                    method: 'GET',
                    hostname: url.hostname,
                    port: url.port || (url.protocol === 'https:' ? 443 : 80),
                    path: '/version', // Check the /version endpoint (publicly accessible)
                    timeout: CONNECTIVITY_TIMEOUT_MS,
                    // Allow self-signed certificates (common in k8s clusters)
                    rejectUnauthorized: false
                };
                
                // Make the request
                const req = client.request(options, (res) => {
                    // Any response (even 401/403/404) means the server is reachable
                    // We only care if the endpoint responds, not if we're authenticated
                    if (res.statusCode) {
                        resolve(ClusterStatus.Connected);
                    } else {
                        resolve(ClusterStatus.Disconnected);
                    }
                    
                    // Consume response data to free up memory
                    res.on('data', () => {});
                });
                
                // Handle request errors (connection refused, DNS failure, etc.)
                req.on('error', (error) => {
                    console.log(`Cluster connectivity check failed for ${serverUrl}: ${error.message}`);
                    resolve(ClusterStatus.Disconnected);
                });
                
                // Handle timeout
                req.on('timeout', () => {
                    console.log(`Cluster connectivity check timed out for ${serverUrl}`);
                    req.destroy();
                    resolve(ClusterStatus.Disconnected);
                });
                
                // End the request
                req.end();
            });
        } catch (error) {
            // Handle URL parsing errors or other unexpected errors
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Error checking connectivity for ${serverUrl}: ${errorMessage}`);
            return ClusterStatus.Disconnected;
        }
    }

    /**
     * Checks connectivity for multiple clusters in parallel.
     * This is more efficient than checking them sequentially.
     * 
     * @param serverUrls Array of cluster server URLs to check
     * @returns Array of ClusterStatus values in the same order as input
     */
    public static async checkMultipleConnectivity(serverUrls: string[]): Promise<ClusterStatus[]> {
        const promises = serverUrls.map(url => this.checkConnectivity(url));
        return await Promise.all(promises);
    }
}

