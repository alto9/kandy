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
 * Information about a Custom Resource Definition (CRD).
 */
export interface CRDInfo {
    /** Name of the CRD (typically includes group, e.g., "mycustomresources.apps.example.com") */
    name: string;
    /** API group of the CRD (e.g., "apps.example.com") */
    group: string;
    /** Preferred version of the CRD (e.g., "v1") */
    version: string;
    /** Kind name for the custom resource (e.g., "MyCustomResource") */
    kind: string;
}

/**
 * Result of a CRD query operation.
 */
export interface CRDsResult {
    /**
     * Array of CRD information, empty if query failed.
     */
    crds: CRDInfo[];
    
    /**
     * Error information if the CRD query failed.
     */
    error?: KubectlError;
}

/**
 * Interface for kubectl CRD response items.
 */
interface CRDItem {
    metadata?: {
        name?: string;
    };
    spec?: {
        group?: string;
        versions?: Array<{
            name?: string;
            storage?: boolean;
        }>;
        names?: {
            kind?: string;
        };
    };
}

/**
 * Interface for kubectl CRD list response.
 */
interface CRDListResponse {
    items?: CRDItem[];
}

/**
 * Utility class for kubectl custom resource operations.
 */
export class CustomResourceCommands {
    /**
     * Retrieves the list of Custom Resource Definitions (CRDs) from a cluster using kubectl.
     * Uses kubectl get crds command with JSON output for parsing.
     * 
     * @param kubeconfigPath Path to the kubeconfig file
     * @param contextName Name of the context to query
     * @returns CRDsResult with crds array and optional error information
     */
    public static async getCRDs(
        kubeconfigPath: string,
        contextName: string
    ): Promise<CRDsResult> {
        try {
            // Execute kubectl get crds with JSON output
            const { stdout } = await execFileAsync(
                'kubectl',
                [
                    'get',
                    'crds',
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
            const response: CRDListResponse = JSON.parse(stdout);
            
            // Extract CRD information from the items array
            const crds: CRDInfo[] = response.items?.map((item: CRDItem) => {
                const name = item.metadata?.name || 'Unknown';
                const group = item.spec?.group || '';
                const kind = item.spec?.names?.kind || 'Unknown';
                
                // Find the preferred/storage version
                // The storage version is the one marked with storage: true
                let version = '';
                if (item.spec?.versions && item.spec.versions.length > 0) {
                    const storageVersion = item.spec.versions.find(v => v.storage === true);
                    version = storageVersion?.name || item.spec.versions[0]?.name || '';
                }
                
                return {
                    name,
                    group,
                    version,
                    kind
                };
            }) || [];
            
            // Sort CRDs alphabetically by kind
            crds.sort((a, b) => a.kind.localeCompare(b.kind));
            
            return { crds };
        } catch (error: unknown) {
            // kubectl failed - create structured error for detailed handling
            const kubectlError = KubectlError.fromExecError(error, contextName);
            
            // Log error details for debugging
            console.log(`CRD query failed for context ${contextName}: ${kubectlError.getDetails()}`);
            
            return {
                crds: [],
                error: kubectlError
            };
        }
    }
}

