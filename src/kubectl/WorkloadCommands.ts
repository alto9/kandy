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
 * Information about a Kubernetes deployment.
 */
export interface DeploymentInfo {
    /** Name of the deployment */
    name: string;
    /** Namespace of the deployment */
    namespace: string;
    /** Number of ready replicas */
    readyReplicas: number;
    /** Total number of desired replicas */
    replicas: number;
    /** Label selector for finding pods */
    selector: string;
}

/**
 * Information about a Kubernetes pod.
 */
export interface PodInfo {
    /** Name of the pod */
    name: string;
    /** Namespace of the pod */
    namespace: string;
    /** Status phase of the pod */
    phase: string;
}

/**
 * Result of a deployment query operation.
 */
export interface DeploymentsResult {
    /**
     * Array of deployment information, empty if query failed.
     */
    deployments: DeploymentInfo[];
    
    /**
     * Error information if the deployment query failed.
     */
    error?: KubectlError;
}

/**
 * Result of a pod query operation.
 */
export interface PodsResult {
    /**
     * Array of pod information, empty if query failed.
     */
    pods: PodInfo[];
    
    /**
     * Error information if the pod query failed.
     */
    error?: KubectlError;
}

/**
 * Interface for kubectl deployment response items.
 */
interface DeploymentItem {
    metadata?: {
        name?: string;
        namespace?: string;
    };
    spec?: {
        replicas?: number;
        selector?: {
            matchLabels?: {
                [key: string]: string;
            };
        };
    };
    status?: {
        readyReplicas?: number;
        replicas?: number;
    };
}

/**
 * Interface for kubectl deployment list response.
 */
interface DeploymentListResponse {
    items?: DeploymentItem[];
}

/**
 * Interface for kubectl pod response items.
 */
interface PodItem {
    metadata?: {
        name?: string;
        namespace?: string;
    };
    status?: {
        phase?: string;
    };
}

/**
 * Interface for kubectl pod list response.
 */
interface PodListResponse {
    items?: PodItem[];
}

/**
 * Utility class for kubectl workload operations.
 */
export class WorkloadCommands {
    /**
     * Retrieves the list of deployments from all namespaces using kubectl.
     * Uses kubectl get deployments command with JSON output for parsing.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @returns DeploymentsResult with deployments array and optional error information
     */
    public static async getDeployments(
        kubeconfigPath: string,
        contextName: string
    ): Promise<DeploymentsResult> {
        try {
            // Execute kubectl get deployments with JSON output
            const { stdout } = await execFileAsync(
                'kubectl',
                [
                    'get',
                    'deployments',
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
            const response: DeploymentListResponse = JSON.parse(stdout);
            
            // Extract deployment information from the items array
            const deployments: DeploymentInfo[] = response.items?.map((item: DeploymentItem) => {
                const name = item.metadata?.name || 'Unknown';
                const namespace = item.metadata?.namespace || 'default';
                const replicas = item.spec?.replicas || 0;
                const readyReplicas = item.status?.readyReplicas || 0;
                
                // Build label selector from matchLabels
                const matchLabels = item.spec?.selector?.matchLabels || {};
                const selector = Object.entries(matchLabels)
                    .map(([key, value]) => `${key}=${value}`)
                    .join(',');
                
                return {
                    name,
                    namespace,
                    readyReplicas,
                    replicas,
                    selector
                };
            }) || [];
            
            // Sort deployments by namespace, then by name
            deployments.sort((a, b) => {
                const nsCompare = a.namespace.localeCompare(b.namespace);
                return nsCompare !== 0 ? nsCompare : a.name.localeCompare(b.name);
            });
            
            return { deployments };
        } catch (error: unknown) {
            // kubectl failed - create structured error for detailed handling
            const kubectlError = KubectlError.fromExecError(error, contextName);
            
            // Log error details for debugging
            console.log(`Deployment query failed for context ${contextName}: ${kubectlError.getDetails()}`);
            
            return {
                deployments: [],
                error: kubectlError
            };
        }
    }

    /**
     * Retrieves the list of pods for a specific deployment using kubectl.
     * Uses label selector to find pods belonging to the deployment.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @param deploymentName Name of the deployment
     * @param namespace Namespace of the deployment
     * @param labelSelector Label selector for finding pods
     * @returns PodsResult with pods array and optional error information
     */
    public static async getPodsForDeployment(
        kubeconfigPath: string,
        contextName: string,
        deploymentName: string,
        namespace: string,
        labelSelector: string
    ): Promise<PodsResult> {
        try {
            // If no label selector provided, return empty array
            if (!labelSelector) {
                return { pods: [] };
            }

            // Execute kubectl get pods with label selector
            const { stdout } = await execFileAsync(
                'kubectl',
                [
                    'get',
                    'pods',
                    '-n',
                    namespace,
                    '--selector',
                    labelSelector,
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
            const response: PodListResponse = JSON.parse(stdout);
            
            // Extract pod information from the items array
            const pods: PodInfo[] = response.items?.map((item: PodItem) => {
                const name = item.metadata?.name || 'Unknown';
                const podNamespace = item.metadata?.namespace || namespace;
                const phase = item.status?.phase || 'Unknown';
                
                return {
                    name,
                    namespace: podNamespace,
                    phase
                };
            }) || [];
            
            // Sort pods alphabetically by name
            pods.sort((a, b) => a.name.localeCompare(b.name));
            
            return { pods };
        } catch (error: unknown) {
            // kubectl failed - create structured error for detailed handling
            const kubectlError = KubectlError.fromExecError(error, contextName);
            
            // Log error details for debugging
            console.log(`Pod query failed for deployment ${deploymentName} in namespace ${namespace}: ${kubectlError.getDetails()}`);
            
            return {
                pods: [],
                error: kubectlError
            };
        }
    }
}

