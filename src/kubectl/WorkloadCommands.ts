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
 * Information about a Kubernetes statefulset.
 */
export interface StatefulSetInfo {
    /** Name of the statefulset */
    name: string;
    /** Namespace of the statefulset */
    namespace: string;
    /** Number of ready replicas */
    readyReplicas: number;
    /** Total number of desired replicas */
    replicas: number;
    /** Label selector for finding pods */
    selector: string;
}

/**
 * Information about a Kubernetes daemonset.
 */
export interface DaemonSetInfo {
    /** Name of the daemonset */
    name: string;
    /** Namespace of the daemonset */
    namespace: string;
    /** Number of nodes with ready daemon pods */
    readyNodes: number;
    /** Total number of nodes where daemon should run */
    desiredNodes: number;
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
 * Result of a statefulset query operation.
 */
export interface StatefulSetsResult {
    /**
     * Array of statefulset information, empty if query failed.
     */
    statefulsets: StatefulSetInfo[];
    
    /**
     * Error information if the statefulset query failed.
     */
    error?: KubectlError;
}

/**
 * Result of a daemonset query operation.
 */
export interface DaemonSetsResult {
    /**
     * Array of daemonset information, empty if query failed.
     */
    daemonsets: DaemonSetInfo[];
    
    /**
     * Error information if the daemonset query failed.
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
 * Interface for kubectl statefulset response items.
 */
interface StatefulSetItem {
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
 * Interface for kubectl statefulset list response.
 */
interface StatefulSetListResponse {
    items?: StatefulSetItem[];
}

/**
 * Interface for kubectl daemonset response items.
 */
interface DaemonSetItem {
    metadata?: {
        name?: string;
        namespace?: string;
    };
    spec?: {
        selector?: {
            matchLabels?: {
                [key: string]: string;
            };
        };
    };
    status?: {
        desiredNumberScheduled?: number;
        numberReady?: number;
    };
}

/**
 * Interface for kubectl daemonset list response.
 */
interface DaemonSetListResponse {
    items?: DaemonSetItem[];
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
     * Retrieves the list of statefulsets from all namespaces using kubectl.
     * Uses kubectl get statefulsets command with JSON output for parsing.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @returns StatefulSetsResult with statefulsets array and optional error information
     */
    public static async getStatefulSets(
        kubeconfigPath: string,
        contextName: string
    ): Promise<StatefulSetsResult> {
        try {
            // Execute kubectl get statefulsets with JSON output
            const { stdout } = await execFileAsync(
                'kubectl',
                [
                    'get',
                    'statefulsets',
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
            const response: StatefulSetListResponse = JSON.parse(stdout);
            
            // Extract statefulset information from the items array
            const statefulsets: StatefulSetInfo[] = response.items?.map((item: StatefulSetItem) => {
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
            
            // Sort statefulsets by namespace, then by name
            statefulsets.sort((a, b) => {
                const nsCompare = a.namespace.localeCompare(b.namespace);
                return nsCompare !== 0 ? nsCompare : a.name.localeCompare(b.name);
            });
            
            return { statefulsets };
        } catch (error: unknown) {
            // kubectl failed - create structured error for detailed handling
            const kubectlError = KubectlError.fromExecError(error, contextName);
            
            // Log error details for debugging
            console.log(`StatefulSet query failed for context ${contextName}: ${kubectlError.getDetails()}`);
            
            return {
                statefulsets: [],
                error: kubectlError
            };
        }
    }

    /**
     * Retrieves the list of pods for a specific statefulset using kubectl.
     * Uses label selector to find pods belonging to the statefulset.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @param statefulsetName Name of the statefulset
     * @param namespace Namespace of the statefulset
     * @param labelSelector Label selector for finding pods
     * @returns PodsResult with pods array and optional error information
     */
    public static async getPodsForStatefulSet(
        kubeconfigPath: string,
        contextName: string,
        statefulsetName: string,
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
            console.log(`Pod query failed for statefulset ${statefulsetName} in namespace ${namespace}: ${kubectlError.getDetails()}`);
            
            return {
                pods: [],
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

    /**
     * Retrieves the list of daemonsets from all namespaces using kubectl.
     * Uses kubectl get daemonsets command with JSON output for parsing.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @returns DaemonSetsResult with daemonsets array and optional error information
     */
    public static async getDaemonSets(
        kubeconfigPath: string,
        contextName: string
    ): Promise<DaemonSetsResult> {
        try {
            // Execute kubectl get daemonsets with JSON output
            const { stdout } = await execFileAsync(
                'kubectl',
                [
                    'get',
                    'daemonsets',
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
            const response: DaemonSetListResponse = JSON.parse(stdout);
            
            // Extract daemonset information from the items array
            const daemonsets: DaemonSetInfo[] = response.items?.map((item: DaemonSetItem) => {
                const name = item.metadata?.name || 'Unknown';
                const namespace = item.metadata?.namespace || 'default';
                const desiredNodes = item.status?.desiredNumberScheduled || 0;
                const readyNodes = item.status?.numberReady || 0;
                
                // Build label selector from matchLabels
                const matchLabels = item.spec?.selector?.matchLabels || {};
                const selector = Object.entries(matchLabels)
                    .map(([key, value]) => `${key}=${value}`)
                    .join(',');
                
                return {
                    name,
                    namespace,
                    readyNodes,
                    desiredNodes,
                    selector
                };
            }) || [];
            
            // Sort daemonsets by namespace, then by name
            daemonsets.sort((a, b) => {
                const nsCompare = a.namespace.localeCompare(b.namespace);
                return nsCompare !== 0 ? nsCompare : a.name.localeCompare(b.name);
            });
            
            return { daemonsets };
        } catch (error: unknown) {
            // kubectl failed - create structured error for detailed handling
            const kubectlError = KubectlError.fromExecError(error, contextName);
            
            // Log error details for debugging
            console.log(`DaemonSet query failed for context ${contextName}: ${kubectlError.getDetails()}`);
            
            return {
                daemonsets: [],
                error: kubectlError
            };
        }
    }

    /**
     * Retrieves the list of pods for a specific daemonset using kubectl.
     * Uses label selector to find pods belonging to the daemonset.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @param daemonsetName Name of the daemonset
     * @param namespace Namespace of the daemonset
     * @param labelSelector Label selector for finding pods
     * @returns PodsResult with pods array and optional error information
     */
    public static async getPodsForDaemonSet(
        kubeconfigPath: string,
        contextName: string,
        daemonsetName: string,
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
            console.log(`Pod query failed for daemonset ${daemonsetName} in namespace ${namespace}: ${kubectlError.getDetails()}`);
            
            return {
                pods: [],
                error: kubectlError
            };
        }
    }
}

