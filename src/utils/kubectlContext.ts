import { execFile } from 'child_process';
import { promisify } from 'util';
import { KubectlError } from '../kubernetes/KubectlError';
import { KubectlContextState } from '../types/namespaceState';

/**
 * Timeout for kubectl commands in milliseconds.
 */
const KUBECTL_TIMEOUT_MS = 5000;

/**
 * Promisified version of execFile for async/await usage.
 */
const execFileAsync = promisify(execFile);

/**
 * Interface for the raw kubectl config view JSON response.
 */
interface KubeconfigContext {
    name?: string;
    context?: {
        cluster?: string;
        namespace?: string;
        user?: string;
    };
}

interface KubeconfigResponse {
    contexts?: KubeconfigContext[];
    'current-context'?: string;
}

/**
 * Retrieves the current namespace from kubectl context configuration.
 * Returns null if no namespace is set (cluster-wide view).
 * 
 * This function reads the kubectl context to determine which namespace is
 * currently active. An empty result indicates no namespace filtering is
 * applied (cluster-wide view).
 * 
 * @returns The current namespace name, or null if no namespace is set
 * @throws {Error} If kubectl command fails or is not available
 */
export async function getCurrentNamespace(): Promise<string | null> {
    try {
        // Execute kubectl config view with jsonpath to extract namespace
        const { stdout } = await execFileAsync(
            'kubectl',
            [
                'config',
                'view',
                '--minify',
                '--output=jsonpath={..namespace}'
            ],
            {
                timeout: KUBECTL_TIMEOUT_MS,
                env: { ...process.env }
            }
        );

        // Trim whitespace from output
        const namespace = stdout.trim();
        
        // Empty string means no namespace is set in context (cluster-wide view)
        if (!namespace || namespace.length === 0) {
            return null;
        }

        return namespace;
    } catch (error: unknown) {
        // kubectl failed - create structured error for detailed handling
        const kubectlError = KubectlError.fromExecError(error, 'current');
        
        // Log error details for debugging
        console.error(`Failed to get current namespace: ${kubectlError.getDetails()}`);
        
        // Rethrow as standard error for caller to handle
        throw new Error(`Failed to get current namespace: ${kubectlError.getUserMessage()}`);
    }
}

/**
 * Retrieves complete kubectl context information including context name,
 * cluster name, and current namespace.
 * 
 * This function queries kubectl's full context configuration to get detailed
 * information about the active context. It returns a structured object with
 * all context metadata needed for namespace selection.
 * 
 * @returns Complete kubectl context state including namespace, context, and cluster
 * @throws {Error} If kubectl command fails, no context is set, or JSON is malformed
 */
export async function getContextInfo(): Promise<KubectlContextState> {
    try {
        // Execute kubectl config view with JSON output
        const { stdout } = await execFileAsync(
            'kubectl',
            [
                'config',
                'view',
                '--minify',
                '--output=json'
            ],
            {
                timeout: KUBECTL_TIMEOUT_MS,
                maxBuffer: 10 * 1024 * 1024, // 10MB buffer
                env: { ...process.env }
            }
        );

        // Parse the JSON response
        let response: KubeconfigResponse;
        try {
            response = JSON.parse(stdout);
        } catch (parseError) {
            const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
            console.error(`Failed to parse kubectl config JSON: ${errorMessage}`);
            throw new Error('kubectl config returned invalid JSON. The kubeconfig file may be corrupted.');
        }

        // Validate that we have context information
        if (!response.contexts || response.contexts.length === 0) {
            throw new Error('No kubectl context is currently set. Please configure a context using kubectl.');
        }

        // Extract the current context (first context in minified view)
        const currentContext = response.contexts[0];
        
        // Validate context structure
        if (!currentContext.name) {
            throw new Error('kubectl context is missing a name. The kubeconfig file may be corrupted.');
        }

        if (!currentContext.context?.cluster) {
            throw new Error(`kubectl context '${currentContext.name}' is missing a cluster reference.`);
        }

        // Extract context information
        const contextName = currentContext.name;
        const clusterName = currentContext.context.cluster;
        const currentNamespace = currentContext.context.namespace || null;

        // Build and return the context state
        const contextState: KubectlContextState = {
            currentNamespace,
            contextName,
            clusterName,
            lastUpdated: new Date(),
            source: 'external' // Initial read, not set by extension
        };

        return contextState;
    } catch (error: unknown) {
        // Check if this is already our formatted error from validation
        if (error instanceof Error && error.message.includes('kubectl')) {
            throw error;
        }

        // kubectl command execution failed - create structured error
        const kubectlError = KubectlError.fromExecError(error, 'current');
        
        // Log error details for debugging
        console.error(`Failed to get context info: ${kubectlError.getDetails()}`);
        
        // Rethrow as standard error for caller to handle
        throw new Error(`Failed to get kubectl context info: ${kubectlError.getUserMessage()}`);
    }
}

