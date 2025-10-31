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
 * Information about a Kubernetes namespace.
 */
export interface NamespaceInfo {
    /** Name of the namespace */
    name: string;
    /** Status/phase of the namespace (Active, Terminating, Unknown) */
    status: string;
}

/**
 * Result of a namespace query operation.
 */
export interface NamespacesResult {
    /**
     * Array of namespace information, empty if query failed.
     */
    namespaces: NamespaceInfo[];
    
    /**
     * Error information if the namespace query failed.
     */
    error?: KubectlError;
}

/**
 * Interface for kubectl namespace response items.
 */
interface NamespaceItem {
    metadata?: {
        name?: string;
    };
    status?: {
        phase?: string;
    };
}

/**
 * Interface for kubectl namespace list response.
 */
interface NamespaceListResponse {
    items?: NamespaceItem[];
}

/**
 * Utility class for kubectl namespace operations.
 */
export class NamespaceCommands {
    /**
     * Retrieves the list of namespaces from a cluster using kubectl.
     * Uses kubectl get namespaces command with JSON output for parsing.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @returns NamespacesResult with namespaces array and optional error information
     */
    public static async getNamespaces(
        kubeconfigPath: string,
        contextName: string
    ): Promise<NamespacesResult> {
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
                    timeout: KUBECTL_TIMEOUT_MS,
                    env: { ...process.env }
                }
            );

            // Parse the JSON response
            const response: NamespaceListResponse = JSON.parse(stdout);
            
            // Extract namespace information from the items array
            const namespaces: NamespaceInfo[] = response.items?.map((item: NamespaceItem) => {
                const name = item.metadata?.name || 'Unknown';
                
                // Determine namespace status from phase
                const status = item.status?.phase || 'Unknown';
                
                return {
                    name,
                    status
                };
            }) || [];
            
            // Sort namespaces alphabetically by name
            namespaces.sort((a, b) => a.name.localeCompare(b.name));
            
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

