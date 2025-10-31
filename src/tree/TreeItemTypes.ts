import { ClusterStatus } from '../kubernetes/ClusterTypes';

/**
 * Types of tree items that can appear in the cluster tree view.
 * 
 * Base types:
 * - cluster: Top-level cluster nodes
 * - namespace: Individual namespace items (under Namespaces category)
 * - allNamespaces: Special "All Namespaces" item
 * - info: Informational items (e.g., auth status)
 * 
 * Category types (appear under clusters, also used for individual items within that category):
 * - nodes: Nodes category and individual node items
 * - namespaces: Namespaces category
 * - workloads: Workloads category
 * - storage: Storage category
 * - helm: Helm category
 * - configuration: Configuration category
 * - customResources: Custom Resources category
 */
export type TreeItemType = 
    | 'cluster' 
    | 'namespace' 
    | 'allNamespaces' 
    | 'info'
    | 'nodes'
    | 'namespaces'
    | 'workloads'
    | 'storage'
    | 'helm'
    | 'configuration'
    | 'customResources';

/**
 * Re-export ClusterStatus for convenience.
 */
export { ClusterStatus };

/**
 * Metadata structure for tree items.
 * Contains only cluster context information (no resource-specific data).
 */
export interface TreeItemData {
    /** Kubeconfig context information */
    context: {
        name: string;
        cluster: string;
        namespace?: string;
    };
    /** Cluster information */
    cluster: {
        name: string;
        server: string;
    };
}

