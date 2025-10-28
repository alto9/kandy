import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';

/**
 * Represents a cluster in the kubeconfig file.
 */
export interface KubeconfigCluster {
    name: string;
    server: string;
    certificateAuthority?: string;
    certificateAuthorityData?: string;
    insecureSkipTlsVerify?: boolean;
}

/**
 * Represents a context in the kubeconfig file.
 */
export interface KubeconfigContext {
    name: string;
    cluster: string;
    user: string;
    namespace?: string;
}

/**
 * Represents a user in the kubeconfig file.
 */
export interface KubeconfigUser {
    name: string;
    clientCertificate?: string;
    clientCertificateData?: string;
    clientKey?: string;
    clientKeyData?: string;
    token?: string;
    username?: string;
    password?: string;
}

/**
 * Represents the complete parsed kubeconfig structure.
 */
export interface ParsedKubeconfig {
    clusters: KubeconfigCluster[];
    contexts: KubeconfigContext[];
    users: KubeconfigUser[];
    currentContext?: string;
}

/**
 * Raw kubeconfig structure as it appears in the YAML file.
 * Note: Property names use kebab-case to match the kubeconfig YAML format.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
interface RawKubeconfig {
    apiVersion?: string;
    kind?: string;
    clusters?: Array<{
        name: string;
        cluster: {
            server: string;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'certificate-authority'?: string;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'certificate-authority-data'?: string;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'insecure-skip-tls-verify'?: boolean;
        };
    }>;
    contexts?: Array<{
        name: string;
        context: {
            cluster: string;
            user: string;
            namespace?: string;
        };
    }>;
    users?: Array<{
        name: string;
        user: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'client-certificate'?: string;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'client-certificate-data'?: string;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'client-key'?: string;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'client-key-data'?: string;
            token?: string;
            username?: string;
            password?: string;
        };
    }>;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'current-context'?: string;
}

/**
 * Parser for Kubernetes configuration files (kubeconfig).
 * Supports both default ~/.kube/config and custom KUBECONFIG environment variable locations.
 */
export class KubeconfigParser {
    /**
     * Determines the kubeconfig file path.
     * Checks KUBECONFIG environment variable first, then falls back to ~/.kube/config.
     * If KUBECONFIG contains multiple paths (colon-separated), returns the first one.
     * 
     * @returns The resolved kubeconfig file path
     */
    public static getKubeconfigPath(): string {
        const kubeconfigEnv = process.env.KUBECONFIG;
        
        if (kubeconfigEnv) {
            // KUBECONFIG can contain multiple paths separated by colons (Linux/Mac) or semicolons (Windows)
            const separator = process.platform === 'win32' ? ';' : ':';
            const paths = kubeconfigEnv.split(separator);
            return paths[0].trim();
        }
        
        // Default to ~/.kube/config
        return path.join(os.homedir(), '.kube', 'config');
    }

    /**
     * Parses the kubeconfig file and returns structured, typed data.
     * 
     * @param kubeconfigPath Optional path to kubeconfig file. If not provided, uses getKubeconfigPath()
     * @returns Parsed kubeconfig data
     * @throws Error if the file doesn't exist, can't be read, or contains invalid data
     */
    public static async parseKubeconfig(kubeconfigPath?: string): Promise<ParsedKubeconfig> {
        const configPath = kubeconfigPath || this.getKubeconfigPath();
        
        try {
            // Check if file exists
            await fs.access(configPath);
        } catch (error) {
            throw new Error(`Kubeconfig file not found at: ${configPath}`);
        }
        
        try {
            // Read file contents
            const fileContents = await fs.readFile(configPath, 'utf-8');
            
            // Parse YAML
            const rawConfig = yaml.load(fileContents) as RawKubeconfig;
            
            if (!rawConfig || typeof rawConfig !== 'object') {
                throw new Error('Invalid kubeconfig: file does not contain a valid YAML object');
            }
            
            // Extract and transform data
            const parsedConfig: ParsedKubeconfig = {
                clusters: this.extractClusters(rawConfig),
                contexts: this.extractContexts(rawConfig),
                users: this.extractUsers(rawConfig),
                currentContext: rawConfig['current-context']
            };
            
            return parsedConfig;
        } catch (error) {
            if (error instanceof Error) {
                // Re-throw our custom errors
                if (error.message.startsWith('Invalid kubeconfig') || error.message.startsWith('Kubeconfig file not found')) {
                    throw error;
                }
                throw new Error(`Failed to parse kubeconfig: ${error.message}`);
            }
            throw new Error(`Failed to parse kubeconfig: ${String(error)}`);
        }
    }

    /**
     * Extracts and transforms clusters from raw kubeconfig data.
     */
    private static extractClusters(rawConfig: RawKubeconfig): KubeconfigCluster[] {
        if (!rawConfig.clusters || !Array.isArray(rawConfig.clusters)) {
            return [];
        }
        
        return rawConfig.clusters.map(clusterItem => ({
            name: clusterItem.name,
            server: clusterItem.cluster.server,
            certificateAuthority: clusterItem.cluster['certificate-authority'],
            certificateAuthorityData: clusterItem.cluster['certificate-authority-data'],
            insecureSkipTlsVerify: clusterItem.cluster['insecure-skip-tls-verify']
        }));
    }

    /**
     * Extracts and transforms contexts from raw kubeconfig data.
     */
    private static extractContexts(rawConfig: RawKubeconfig): KubeconfigContext[] {
        if (!rawConfig.contexts || !Array.isArray(rawConfig.contexts)) {
            return [];
        }
        
        return rawConfig.contexts.map(contextItem => ({
            name: contextItem.name,
            cluster: contextItem.context.cluster,
            user: contextItem.context.user,
            namespace: contextItem.context.namespace
        }));
    }

    /**
     * Extracts and transforms users from raw kubeconfig data.
     */
    private static extractUsers(rawConfig: RawKubeconfig): KubeconfigUser[] {
        if (!rawConfig.users || !Array.isArray(rawConfig.users)) {
            return [];
        }
        
        return rawConfig.users.map(userItem => ({
            name: userItem.name,
            clientCertificate: userItem.user['client-certificate'],
            clientCertificateData: userItem.user['client-certificate-data'],
            clientKey: userItem.user['client-key'],
            clientKeyData: userItem.user['client-key-data'],
            token: userItem.user.token,
            username: userItem.user.username,
            password: userItem.user.password
        }));
    }
}

