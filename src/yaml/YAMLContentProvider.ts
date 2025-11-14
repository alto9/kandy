import { execFile } from 'child_process';
import { promisify } from 'util';
import { KubectlError } from '../kubernetes/KubectlError';
import { ResourceIdentifier } from './YAMLEditorManager';
import { KubeconfigParser } from '../kubernetes/KubeconfigParser';

/**
 * Timeout for kubectl commands in milliseconds.
 */
const KUBECTL_TIMEOUT_MS = 5000;

/**
 * Promisified version of execFile for async/await usage.
 */
const execFileAsync = promisify(execFile);

/**
 * Provides YAML content for Kubernetes resources by fetching from the cluster.
 * Uses kubectl commands to retrieve resource YAML configurations.
 */
export class YAMLContentProvider {
    /**
     * Fetches the YAML content for a Kubernetes resource from the cluster.
     * 
     * @param resource - The resource identifier specifying which resource to fetch
     * @returns Promise resolving to the YAML content as a string
     * @throws {Error} If kubectl command fails or resource cannot be fetched
     */
    public async fetchYAML(resource: ResourceIdentifier): Promise<string> {
        // Get kubeconfig path
        const kubeconfigPath = KubeconfigParser.getKubeconfigPath();
        
        // Build kubectl command arguments based on resource type
        const args = ['get', resource.kind.toLowerCase(), resource.name];
        
        // Add namespace flag for namespaced resources
        if (resource.namespace) {
            args.push('-n', resource.namespace);
        }
        
        // Add output format and cluster context flags
        args.push(
            '-o', 'yaml',
            `--kubeconfig=${kubeconfigPath}`,
            `--context=${resource.cluster}`
        );

        try {
            // Execute kubectl command to fetch YAML
            const { stdout } = await execFileAsync(
                'kubectl',
                args,
                {
                    timeout: KUBECTL_TIMEOUT_MS,
                    maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large resources
                    env: { ...process.env }
                }
            );

            // Return the YAML content from stdout
            return stdout;
        } catch (error: unknown) {
            // kubectl failed - create structured error for detailed handling
            const kubectlError = KubectlError.fromExecError(error, resource.cluster);
            
            // Log error details for debugging
            console.error(`Failed to fetch YAML for ${resource.kind}/${resource.name}: ${kubectlError.getDetails()}`);
            
            // Throw error with user-friendly message
            throw new Error(`Failed to fetch YAML for ${resource.kind} '${resource.name}': ${kubectlError.getUserMessage()}`);
        }
    }
}

