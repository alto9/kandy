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
 * Information about a Kubernetes persistent volume.
 */
export interface PersistentVolumeInfo {
    /** Name of the persistent volume */
    name: string;
    /** Storage capacity (e.g., "10Gi") */
    capacity: string;
    /** Status of the PV (Available, Bound, Released, Failed) */
    status: string;
    /** Reference to the claim if bound */
    claimRef?: string;
}

/**
 * Result of a persistent volume query operation.
 */
export interface PersistentVolumesResult {
    /**
     * Array of persistent volume information, empty if query failed.
     */
    persistentVolumes: PersistentVolumeInfo[];
    
    /**
     * Error information if the persistent volume query failed.
     */
    error?: KubectlError;
}

/**
 * Interface for kubectl persistent volume response items.
 */
interface PersistentVolumeItem {
    metadata?: {
        name?: string;
    };
    spec?: {
        capacity?: {
            storage?: string;
        };
        claimRef?: {
            namespace?: string;
            name?: string;
        };
    };
    status?: {
        phase?: string;
    };
}

/**
 * Interface for kubectl persistent volume list response.
 */
interface PersistentVolumeListResponse {
    items?: PersistentVolumeItem[];
}

/**
 * Utility class for kubectl storage operations.
 */
export class StorageCommands {
    /**
     * Retrieves the list of persistent volumes from the cluster using kubectl.
     * Uses kubectl get pv command with JSON output for parsing.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @returns PersistentVolumesResult with persistentVolumes array and optional error information
     */
    public static async getPersistentVolumes(
        kubeconfigPath: string,
        contextName: string
    ): Promise<PersistentVolumesResult> {
        try {
            // Execute kubectl get pv with JSON output
            const { stdout } = await execFileAsync(
                'kubectl',
                [
                    'get',
                    'pv',
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
            const response: PersistentVolumeListResponse = JSON.parse(stdout);
            
            // Extract persistent volume information from the items array
            const persistentVolumes: PersistentVolumeInfo[] = response.items?.map((item: PersistentVolumeItem) => {
                const name = item.metadata?.name || 'Unknown';
                const capacity = item.spec?.capacity?.storage || 'Unknown';
                const status = item.status?.phase || 'Unknown';
                
                // Build claim reference if the PV is bound
                let claimRef: string | undefined;
                if (item.spec?.claimRef) {
                    const claimNamespace = item.spec.claimRef.namespace;
                    const claimName = item.spec.claimRef.name;
                    if (claimNamespace && claimName) {
                        claimRef = `${claimNamespace}/${claimName}`;
                    }
                }
                
                return {
                    name,
                    capacity,
                    status,
                    claimRef
                };
            }) || [];
            
            // Sort persistent volumes alphabetically by name
            persistentVolumes.sort((a, b) => a.name.localeCompare(b.name));
            
            return { persistentVolumes };
        } catch (error: unknown) {
            // kubectl failed - create structured error for detailed handling
            const kubectlError = KubectlError.fromExecError(error, contextName);
            
            // Log error details for debugging
            console.log(`Persistent volume query failed for context ${contextName}: ${kubectlError.getDetails()}`);
            
            return {
                persistentVolumes: [],
                error: kubectlError
            };
        }
    }
}

