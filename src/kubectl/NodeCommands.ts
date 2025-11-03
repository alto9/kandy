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
 * Information about a Kubernetes node.
 */
export interface NodeInfo {
    /** Name of the node */
    name: string;
    /** Status of the node (Ready, NotReady, Unknown) */
    status: string;
    /** Roles assigned to the node (e.g., control-plane, worker) */
    roles: string[];
}

/**
 * Result of a node query operation.
 */
export interface NodesResult {
    /**
     * Array of node information, empty if query failed.
     */
    nodes: NodeInfo[];
    
    /**
     * Error information if the node query failed.
     */
    error?: KubectlError;
}

/**
 * Interface for kubectl node response items.
 */
interface NodeItem {
    metadata?: {
        name?: string;
        labels?: {
            [key: string]: string;
        };
    };
    status?: {
        conditions?: Array<{
            type?: string;
            status?: string;
        }>;
    };
}

/**
 * Interface for kubectl node list response.
 */
interface NodeListResponse {
    items?: NodeItem[];
}

/**
 * Utility class for kubectl node operations.
 */
export class NodeCommands {
    /**
     * Retrieves the list of nodes from a cluster using kubectl.
     * Uses kubectl get nodes command with JSON output for parsing.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @returns NodesResult with nodes array and optional error information
     */
    public static async getNodes(
        kubeconfigPath: string,
        contextName: string
    ): Promise<NodesResult> {
        try {
            // Execute kubectl get nodes with JSON output
            const { stdout } = await execFileAsync(
                'kubectl',
                [
                    'get',
                    'nodes',
                    '--output=json',
                    `--kubeconfig=${kubeconfigPath}`,
                    `--context=${contextName}`
                ],
                {
                    timeout: KUBECTL_TIMEOUT_MS,
                    maxBuffer: 50 * 1024 * 1024, // 50MB buffer for very large clusters
                    env: { ...process.env }
                }
            );

            // Parse the JSON response
            const response: NodeListResponse = JSON.parse(stdout);
            
            // Extract node information from the items array
            const nodes: NodeInfo[] = response.items?.map((item: NodeItem) => {
                const name = item.metadata?.name || 'Unknown';
                
                // Extract roles from labels
                const labels = item.metadata?.labels || {};
                const roles: string[] = [];
                
                // Check for common role labels
                if (labels['node-role.kubernetes.io/control-plane'] !== undefined || 
                    labels['node-role.kubernetes.io/master'] !== undefined) {
                    roles.push('control-plane');
                }
                
                // Check for other role labels
                Object.keys(labels).forEach(key => {
                    if (key.startsWith('node-role.kubernetes.io/') && 
                        !key.includes('control-plane') && 
                        !key.includes('master')) {
                        const role = key.replace('node-role.kubernetes.io/', '');
                        if (role && !roles.includes(role)) {
                            roles.push(role);
                        }
                    }
                });
                
                // If no roles found, default to 'worker'
                if (roles.length === 0) {
                    roles.push('worker');
                }
                
                // Determine node status from conditions
                let status = 'Unknown';
                const conditions = item.status?.conditions || [];
                const readyCondition = conditions.find(c => c.type === 'Ready');
                
                if (readyCondition) {
                    status = readyCondition.status === 'True' ? 'Ready' : 'NotReady';
                }
                
                return {
                    name,
                    status,
                    roles
                };
            }) || [];
            
            // Sort nodes alphabetically by name
            nodes.sort((a, b) => a.name.localeCompare(b.name));
            
            return { nodes };
        } catch (error: unknown) {
            // kubectl failed - create structured error for detailed handling
            const kubectlError = KubectlError.fromExecError(error, contextName);
            
            // Log error details for debugging
            console.log(`Node query failed for context ${contextName}: ${kubectlError.getDetails()}`);
            
            return {
                nodes: [],
                error: kubectlError
            };
        }
    }
}

