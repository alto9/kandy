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
     * If the file doesn't exist, is inaccessible, or contains invalid YAML,
     * returns an empty configuration instead of throwing an error to allow graceful degradation.
     * 
     * @param kubeconfigPath Optional path to kubeconfig file. If not provided, uses getKubeconfigPath()
     * @returns Parsed kubeconfig data, or empty config if file is missing/inaccessible/invalid
     */
    public static async parseKubeconfig(kubeconfigPath?: string): Promise<ParsedKubeconfig> {
        const configPath = kubeconfigPath || this.getKubeconfigPath();
        
        // Create empty config to return when file is missing or inaccessible
        const emptyConfig: ParsedKubeconfig = {
            clusters: [],
            contexts: [],
            users: [],
            currentContext: undefined
        };
        
        try {
            // Check if file exists and is accessible
            await fs.access(configPath);
        } catch (error) {
            // File doesn't exist or isn't accessible - this is not an error condition
            // The extension should work without a kubeconfig file
            const errorCode = (error as NodeJS.ErrnoException).code;
            if (errorCode === 'ENOENT') {
                console.log(`No kubeconfig file found at ${configPath}. Extension will continue with no clusters.`);
            } else if (errorCode === 'EACCES') {
                console.error(`Kubeconfig file at ${configPath} is not accessible due to permissions. Extension will continue with no clusters.`);
            } else {
                console.error(`Unable to access kubeconfig file at ${configPath}: ${error}. Extension will continue with no clusters.`);
            }
            return emptyConfig;
        }
        
        try {
            // Read file contents
            const fileContents = await fs.readFile(configPath, 'utf-8');
            
            // Handle truly empty files (no content or only whitespace)
            if (!fileContents || fileContents.trim().length === 0) {
                console.log(`Kubeconfig file at ${configPath} is empty. Extension will continue with no clusters.`);
                return emptyConfig;
            }
            
            // Parse YAML - wrap in try-catch to handle invalid YAML syntax
            let rawConfig: RawKubeconfig;
            try {
                rawConfig = yaml.load(fileContents) as RawKubeconfig;
            } catch (yamlError) {
                // Invalid YAML syntax - provide user-friendly error message
                const errorMessage = yamlError instanceof Error ? yamlError.message : String(yamlError);
                console.error(`Invalid kubeconfig file at ${configPath}: The file contains invalid YAML syntax.`);
                console.error(`Error details: ${errorMessage}`);
                console.error('Please check the file for syntax errors. Common issues include:');
                console.error('  - Incorrect indentation');
                console.error('  - Missing or extra quotes');
                console.error('  - Invalid characters');
                console.error('The extension will continue with no clusters.');
                return emptyConfig;
            }
            
            // Handle null or non-object YAML results
            if (!rawConfig || typeof rawConfig !== 'object') {
                console.log(`Kubeconfig file at ${configPath} is empty or contains no clusters.`);
                return emptyConfig;
            }
            
            // Extract and transform data
            const parsedConfig: ParsedKubeconfig = {
                clusters: this.extractClusters(rawConfig),
                contexts: this.extractContexts(rawConfig),
                users: this.extractUsers(rawConfig),
                currentContext: rawConfig['current-context']
            };
            
            // Log helpful information about what was found
            if (parsedConfig.clusters.length === 0) {
                console.log(`Kubeconfig file at ${configPath} contains no clusters.`);
            } else {
                console.log(`Found ${parsedConfig.clusters.length} cluster(s) in kubeconfig at ${configPath}`);
            }
            
            return parsedConfig;
        } catch (error) {
            // Catch any other unexpected errors during file reading or processing
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Unexpected error parsing kubeconfig at ${configPath}: ${errorMessage}`);
            console.error('The extension will continue with no clusters.');
            return emptyConfig;
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

