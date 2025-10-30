import * as vscode from 'vscode';
import { ClusterStatus } from '../kubernetes/ClusterTypes';

/**
 * Types of tree items that can appear in the cluster tree view.
 */
export type TreeItemType = 'cluster' | 'namespace' | 'allNamespaces' | 'info';

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

/**
 * Custom tree item class that extends VS Code's TreeItem with additional metadata.
 * This wrapper allows us to attach custom data to tree items for navigation and display.
 */
export class ClusterTreeItem extends vscode.TreeItem {
    /**
     * The type of tree item (cluster, namespace, allNamespaces, or info).
     */
    public readonly type: TreeItemType;

    /**
     * Optional metadata associated with this tree item.
     * Contains cluster context information (context and cluster data).
     */
    public readonly resourceData?: TreeItemData;

    /**
     * Optional array of child items.
     * Used for hierarchical navigation in the tree view.
     */
    public children?: ClusterTreeItem[];

    /**
     * Connection status of the cluster.
     * Only relevant for cluster-type tree items.
     */
    public status?: ClusterStatus;

    /**
     * Creates a new ClusterTreeItem.
     * 
     * @param label The display label for the tree item
     * @param type The type of tree item
     * @param collapsibleState Whether the item is collapsible and its initial state
     * @param resourceData Optional metadata associated with this item
     */
    constructor(
        label: string,
        type: TreeItemType,
        collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
        resourceData?: TreeItemData
    ) {
        super(label, collapsibleState);
        this.type = type;
        this.resourceData = resourceData;
        
        // Set context value for use in when clauses (e.g., for context menus)
        this.contextValue = type;
    }
}

