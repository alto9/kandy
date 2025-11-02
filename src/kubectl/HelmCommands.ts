import { execFile } from 'child_process';
import { promisify } from 'util';
import { KubectlError } from '../kubernetes/KubectlError';

/**
 * Timeout for helm commands in milliseconds.
 */
const HELM_TIMEOUT_MS = 5000;

/**
 * Promisified version of execFile for async/await usage.
 */
const execFileAsync = promisify(execFile);

/**
 * Information about a Helm release.
 */
export interface HelmReleaseInfo {
    /** Name of the release */
    name: string;
    /** Namespace where the release is installed */
    namespace: string;
    /** Status of the release (deployed, failed, pending, etc.) */
    status: string;
    /** Chart name */
    chart: string;
    /** Chart version */
    version: string;
}

/**
 * Result of a helm releases query operation.
 */
export interface HelmReleasesResult {
    /**
     * Array of helm release information, empty if query failed.
     */
    releases: HelmReleaseInfo[];
    
    /**
     * Error information if the helm query failed.
     */
    error?: KubectlError;
}

/**
 * Interface for helm list response items.
 */
interface HelmReleaseItem {
    name?: string;
    namespace?: string;
    status?: string;
    chart?: string;
    app_version?: string;
}

/**
 * Utility class for helm CLI operations.
 */
export class HelmCommands {
    /**
     * Retrieves the list of helm releases from a cluster using helm CLI.
     * Uses helm list command with JSON output for parsing.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @returns HelmReleasesResult with releases array and optional error information
     */
    public static async getHelmReleases(
        kubeconfigPath: string,
        contextName: string
    ): Promise<HelmReleasesResult> {
        try {
            // Execute helm list with JSON output across all namespaces
            const { stdout } = await execFileAsync(
                'helm',
                [
                    'list',
                    '--all-namespaces',
                    '--output=json',
                    `--kube-context=${contextName}`
                ],
                {
                    timeout: HELM_TIMEOUT_MS,
                    env: { 
                        ...process.env,
                        KUBECONFIG: kubeconfigPath
                    }
                }
            );

            // Parse the JSON response (helm returns an array directly)
            const response: HelmReleaseItem[] = JSON.parse(stdout);
            
            // Extract helm release information from the array
            const releases: HelmReleaseInfo[] = response.map((item: HelmReleaseItem) => {
                const name = item.name || 'Unknown';
                const namespace = item.namespace || 'default';
                const status = item.status || 'Unknown';
                
                // Parse chart name and version from the chart field
                // Chart field format is typically "chart-name-version"
                const chart = item.chart || 'Unknown';
                let chartName = chart;
                let version = '';
                
                // Try to extract version from chart string
                // Format is usually "chart-name-version" where version starts with a number
                const lastDashIndex = chart.lastIndexOf('-');
                if (lastDashIndex > 0) {
                    const potentialVersion = chart.substring(lastDashIndex + 1);
                    // Check if it looks like a version (starts with a digit)
                    if (/^\d/.test(potentialVersion)) {
                        chartName = chart.substring(0, lastDashIndex);
                        version = potentialVersion;
                    }
                }
                
                return {
                    name,
                    namespace,
                    status,
                    chart: chartName,
                    version
                };
            });
            
            // Sort releases alphabetically by name
            releases.sort((a, b) => a.name.localeCompare(b.name));
            
            return { releases };
        } catch (error: unknown) {
            // helm CLI failed - create structured error for detailed handling
            const kubectlError = KubectlError.fromExecError(error, contextName);
            
            // Log error details for debugging
            console.log(`Helm releases query failed for context ${contextName}: ${kubectlError.getDetails()}`);
            
            return {
                releases: [],
                error: kubectlError
            };
        }
    }
}

